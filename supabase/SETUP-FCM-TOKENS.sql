-- Execute isso no Supabase SQL Editor
-- Copie e cole tudo isso de uma vez

-- ============================================
-- Create FCM Tokens Table
-- ============================================

create table if not exists public.fcm_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('web', 'mobile', 'ios', 'android')) default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz
);

-- Indexes
create index if not exists idx_fcm_tokens_user_id on public.fcm_tokens(user_id);
create index if not exists idx_fcm_tokens_token on public.fcm_tokens(token);
create index if not exists idx_fcm_tokens_created_at on public.fcm_tokens(created_at);

-- RLS Policies
alter table public.fcm_tokens enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own FCM tokens" on public.fcm_tokens;
drop policy if exists "Users can insert their own FCM tokens" on public.fcm_tokens;
drop policy if exists "Users can update their own FCM tokens" on public.fcm_tokens;
drop policy if exists "Users can delete their own FCM tokens" on public.fcm_tokens;

-- Users can only view/manage their own FCM tokens
create policy "Users can view their own FCM tokens"
  on public.fcm_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert their own FCM tokens"
  on public.fcm_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own FCM tokens"
  on public.fcm_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete their own FCM tokens"
  on public.fcm_tokens for delete
  using (auth.uid() = user_id);
