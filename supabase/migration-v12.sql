-- ============================================
-- Migration v12: Make CPF/CNPJ required, add provider_type
-- ============================================

-- Add provider_type column (individual = autonomo/CPF, company = empresa/CNPJ)
alter table public.provider_profiles
  add column if not exists provider_type text;

alter table public.provider_profiles
  alter column provider_type set default 'individual';

update public.provider_profiles
  set provider_type = 'individual'
  where provider_type is null;

alter table public.provider_profiles
  alter column provider_type set not null;

alter table public.provider_profiles
  drop constraint if exists provider_profiles_provider_type_check;

alter table public.provider_profiles
  add constraint provider_profiles_provider_type_check
  check (provider_type in ('individual', 'company'));

-- Set a placeholder for existing providers without CPF
-- so the NOT NULL constraint can be applied.
-- These providers will be prompted to update their document on next login.
update public.provider_profiles
  set cpf = 'PENDING-' || id::text
  where cpf is null or cpf = 'PENDING';

-- Make CPF/CNPJ document required
alter table public.provider_profiles
  alter column cpf set not null;
