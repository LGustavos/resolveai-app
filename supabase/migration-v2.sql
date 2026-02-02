-- ============================================
-- ResolveAí - Migration V2
-- Run this in the Supabase SQL Editor
-- Idempotent: safe to run multiple times
-- ============================================

-- 1. Add city column to provider_profiles
ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_provider_profiles_city ON public.provider_profiles(city);

-- 2. Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view avatars' AND tablename = 'objects') THEN
    CREATE POLICY "Anyone can view avatars"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload own avatar' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload own avatar"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own avatar' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update own avatar"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own avatar' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own avatar"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;

-- 3. Create favorites table (if not exists)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, provider_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own favorites' AND tablename = 'favorites') THEN
    CREATE POLICY "Users can read own favorites"
      ON public.favorites FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own favorites' AND tablename = 'favorites') THEN
    CREATE POLICY "Users can insert own favorites"
      ON public.favorites FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own favorites' AND tablename = 'favorites') THEN
    CREATE POLICY "Users can delete own favorites"
      ON public.favorites FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 4. Allow anonymous users to read categories (needed for register page)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read categories' AND tablename = 'categories') THEN
    CREATE POLICY "Anyone can read categories"
      ON public.categories FOR SELECT
      USING (true);
  END IF;
END $$;

-- 5. Add many more categories
INSERT INTO public.categories (name, slug) VALUES
  ('Gesseiro', 'gesseiro'),
  ('Azulejista', 'azulejista'),
  ('Vidraceiro', 'vidraceiro'),
  ('Serralheiro', 'serralheiro'),
  ('Marceneiro', 'marceneiro'),
  ('Carpinteiro', 'carpinteiro'),
  ('Impermeabilizador', 'impermeabilizador'),
  ('Mestre de Obras', 'mestre-de-obras'),
  ('Instalador de Ar-Condicionado', 'instalador-ar-condicionado'),
  ('Instalador de TV e Antenas', 'instalador-tv-antenas'),
  ('Instalador de Câmeras', 'instalador-cameras'),
  ('Instalador de Redes e Internet', 'instalador-redes'),
  ('Faxineira', 'faxineira'),
  ('Lavador de Estofados', 'lavador-estofados'),
  ('Dedetizador', 'dedetizador'),
  ('Jardineiro', 'jardineiro'),
  ('Piscineiro', 'piscineiro'),
  ('Chaveiro', 'chaveiro'),
  ('Montador de Móveis', 'montador-moveis'),
  ('Técnico em Eletrodomésticos', 'tecnico-eletrodomesticos'),
  ('Técnico em Celular', 'tecnico-celular'),
  ('Técnico em Informática', 'tecnico-informatica'),
  ('Mecânico', 'mecanico'),
  ('Eletricista Automotivo', 'eletricista-automotivo'),
  ('Borracheiro', 'borracheiro'),
  ('Cabeleireira', 'cabeleireira'),
  ('Manicure', 'manicure'),
  ('Maquiadora', 'maquiadora'),
  ('Barbeiro', 'barbeiro'),
  ('Designer de Sobrancelhas', 'designer-sobrancelhas'),
  ('Esteticista', 'esteticista'),
  ('Massagista', 'massagista'),
  ('Personal Trainer', 'personal-trainer'),
  ('Fisioterapeuta', 'fisioterapeuta'),
  ('Nutricionista', 'nutricionista'),
  ('Cuidador de Idosos', 'cuidador-idosos'),
  ('Enfermeiro(a)', 'enfermeiro'),
  ('Professor Particular', 'professor-particular'),
  ('Professor de Música', 'professor-musica'),
  ('Professor de Idiomas', 'professor-idiomas'),
  ('Instrutor de Autoescola', 'instrutor-autoescola'),
  ('Cozinheira', 'cozinheira'),
  ('Confeiteira', 'confeiteira'),
  ('Buffet', 'buffet'),
  ('Bartender', 'bartender'),
  ('DJ', 'dj'),
  ('Fotógrafo', 'fotografo'),
  ('Decorador de Festas', 'decorador-festas'),
  ('Motorista Particular', 'motorista-particular'),
  ('Freteiro', 'freteiro'),
  ('Mudanças', 'mudancas'),
  ('Motoboy', 'motoboy'),
  ('Contador', 'contador'),
  ('Advogado', 'advogado'),
  ('Despachante', 'despachante'),
  ('Designer Gráfico', 'designer-grafico'),
  ('Desenvolvedor de Sites', 'desenvolvedor-sites'),
  ('Social Media', 'social-media'),
  ('Pet Sitter', 'pet-sitter'),
  ('Dog Walker', 'dog-walker'),
  ('Banho e Tosa', 'banho-tosa'),
  ('Veterinário', 'veterinario'),
  ('Costureira', 'costureira'),
  ('Sapateiro', 'sapateiro'),
  ('Lavanderia', 'lavanderia'),
  ('Soldador', 'soldador'),
  ('Outros', 'outros')
ON CONFLICT (slug) DO NOTHING;
