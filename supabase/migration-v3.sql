-- ============================================
-- ResolveAí - Migration V3
-- Features: Verified Badge, Business Hours, Subcategories
-- Run this in the Supabase SQL Editor
-- Idempotent: safe to run multiple times
-- ============================================

-- ============================================
-- 1. PROVIDER PROFILES - Verification columns
-- ============================================

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS verified_at timestamptz DEFAULT NULL;

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'none';

-- Add check constraint for verification_status (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'provider_profiles_verification_status_check'
  ) THEN
    ALTER TABLE public.provider_profiles
      ADD CONSTRAINT provider_profiles_verification_status_check
      CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_is_verified
  ON public.provider_profiles(is_verified);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_verification_status
  ON public.provider_profiles(verification_status);

-- ============================================
-- 2. CATEGORIES - Hierarchical columns
-- ============================================

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id uuid DEFAULT NULL;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- Add FK constraint for parent_id (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'categories_parent_id_fkey'
  ) THEN
    ALTER TABLE public.categories
      ADD CONSTRAINT categories_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
  ON public.categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_categories_display_order
  ON public.categories(display_order);

-- ============================================
-- 3. BUSINESS HOURS table
-- ============================================

CREATE TABLE IF NOT EXISTS public.business_hours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time DEFAULT NULL,
  close_time time DEFAULT NULL,
  is_closed boolean NOT NULL DEFAULT false,
  UNIQUE(provider_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_business_hours_provider_id
  ON public.business_hours(provider_id);

-- Enable RLS
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_hours
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read business hours' AND tablename = 'business_hours') THEN
    CREATE POLICY "Anyone can read business hours"
      ON public.business_hours FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Providers can insert own business hours' AND tablename = 'business_hours') THEN
    CREATE POLICY "Providers can insert own business hours"
      ON public.business_hours FOR INSERT
      TO authenticated
      WITH CHECK (
        provider_id IN (
          SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Providers can update own business hours' AND tablename = 'business_hours') THEN
    CREATE POLICY "Providers can update own business hours"
      ON public.business_hours FOR UPDATE
      TO authenticated
      USING (
        provider_id IN (
          SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Providers can delete own business hours' AND tablename = 'business_hours') THEN
    CREATE POLICY "Providers can delete own business hours"
      ON public.business_hours FOR DELETE
      TO authenticated
      USING (
        provider_id IN (
          SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- 4. VERIFICATION DOCUMENTS table
-- ============================================

CREATE TABLE IF NOT EXISTS public.verification_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('identity', 'selfie')),
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_documents_provider_id
  ON public.verification_documents(provider_id);

CREATE INDEX IF NOT EXISTS idx_verification_documents_status
  ON public.verification_documents(status);

-- Enable RLS
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for verification_documents
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Providers can read own verification documents' AND tablename = 'verification_documents') THEN
    CREATE POLICY "Providers can read own verification documents"
      ON public.verification_documents FOR SELECT
      TO authenticated
      USING (
        provider_id IN (
          SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Providers can insert own verification documents' AND tablename = 'verification_documents') THEN
    CREATE POLICY "Providers can insert own verification documents"
      ON public.verification_documents FOR INSERT
      TO authenticated
      WITH CHECK (
        provider_id IN (
          SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- 5. STORAGE BUCKET for verification documents
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('verifications', 'verifications', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload verification files' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users can upload verification files"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'verifications' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own verification files' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users can read own verification files"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'verifications' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- ============================================
-- 6. FUNCTION: Auto-approve verification
-- When all documents are approved, mark provider as verified
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_verification_approved()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    -- Check if all documents for this provider are approved
    IF NOT EXISTS (
      SELECT 1 FROM public.verification_documents
      WHERE provider_id = NEW.provider_id
        AND status != 'approved'
        AND id != NEW.id
    ) THEN
      UPDATE public.provider_profiles
      SET is_verified = true,
          verified_at = now(),
          verification_status = 'approved'
      WHERE id = NEW.provider_id;
    END IF;
  END IF;

  IF NEW.status = 'rejected' THEN
    UPDATE public.provider_profiles
    SET verification_status = 'rejected'
    WHERE id = NEW.provider_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_verification_status_change ON public.verification_documents;
CREATE TRIGGER on_verification_status_change
  AFTER UPDATE OF status ON public.verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_verification_approved();
