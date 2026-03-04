-- Migration v9: Add accepted_terms_at column to users table
ALTER TABLE users ADD COLUMN accepted_terms_at timestamptz;

-- Update handle_new_user trigger to copy accepted_terms_at from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, accepted_terms_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('CLIENT', 'PROVIDER') THEN NEW.raw_user_meta_data->>'role'
      ELSE 'CLIENT'
    END,
    (NEW.raw_user_meta_data->>'accepted_terms_at')::timestamptz
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    role = COALESCE(EXCLUDED.role, users.role),
    accepted_terms_at = COALESCE(EXCLUDED.accepted_terms_at, users.accepted_terms_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
