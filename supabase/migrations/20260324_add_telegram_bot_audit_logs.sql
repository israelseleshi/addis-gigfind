create table if not exists public.telegram_bot_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  telegram_user_id text not null,
  role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists telegram_bot_audit_logs_user_id_idx
  on public.telegram_bot_audit_logs(user_id);

create index if not exists telegram_bot_audit_logs_action_idx
  on public.telegram_bot_audit_logs(action);

create index if not exists telegram_bot_audit_logs_entity_idx
  on public.telegram_bot_audit_logs(entity_type, entity_id);

alter table public.telegram_bot_audit_logs enable row level security;

create policy "Admins can view telegram bot audit logs"
on public.telegram_bot_audit_logs
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'regulator')
  )
);
