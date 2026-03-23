-- Telegram bot account linking support

create table if not exists public.telegram_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  telegram_user_id text not null,
  telegram_chat_id text not null,
  telegram_username text,
  telegram_first_name text,
  telegram_last_name text,
  is_active boolean not null default true,
  linked_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists telegram_accounts_user_id_key
  on public.telegram_accounts(user_id);

create unique index if not exists telegram_accounts_telegram_user_id_key
  on public.telegram_accounts(telegram_user_id);

create table if not exists public.telegram_link_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists telegram_link_codes_code_key
  on public.telegram_link_codes(code);

alter table public.telegram_accounts enable row level security;
alter table public.telegram_link_codes enable row level security;

create policy "Users can view their own telegram account"
on public.telegram_accounts
for select
using (auth.uid() = user_id);

create policy "Users can view their own telegram link codes"
on public.telegram_link_codes
for select
using (auth.uid() = user_id);

create policy "Users can create their own telegram link codes"
on public.telegram_link_codes
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own telegram link codes"
on public.telegram_link_codes
for update
using (auth.uid() = user_id);
