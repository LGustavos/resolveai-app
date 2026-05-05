-- ============================================
-- Migration v15: FCM Tokens Table
-- Add table to store Firebase Cloud Messaging tokens per user
-- ============================================

-- FCM Tokens table
create table public.fcm_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('web', 'mobile', 'ios', 'android')) default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz
);

-- Indexes
create index idx_fcm_tokens_user_id on public.fcm_tokens(user_id);
create index idx_fcm_tokens_token on public.fcm_tokens(token);
create index idx_fcm_tokens_created_at on public.fcm_tokens(created_at);

-- RLS Policies
alter table public.fcm_tokens enable row level security;

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
