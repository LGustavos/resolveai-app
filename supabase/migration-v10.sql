-- ============================================
-- Migration v10: Add CPF to provider_profiles
-- ============================================

-- Add CPF column (stored as digits only, unique per provider)
alter table public.provider_profiles
  add column cpf text;

-- Ensure CPF is unique across all providers
create unique index idx_provider_profiles_cpf
  on public.provider_profiles(cpf)
  where cpf is not null;
