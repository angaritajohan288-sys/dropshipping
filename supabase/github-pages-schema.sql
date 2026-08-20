-- Ejecuta este archivo una vez en Supabase: SQL Editor → New query → Run.
-- La seguridad depende de RLS; no uses service_role en GitHub Pages.

create table if not exists public.user_tracker_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  start_date date,
  reminder_lead_days integer not null default 3 check (reminder_lead_days between 0 and 30),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_task_state (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_key text not null,
  is_completed boolean not null default false,
  note text not null default '',
  due_date date,
  updated_at timestamptz not null default now(),
  primary key (user_id, task_key)
);

create table if not exists public.monthly_metrics (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month date not null,
  revenue numeric not null default 0 check (revenue >= 0),
  product_cost numeric not null default 0 check (product_cost >= 0),
  ad_spend numeric not null default 0 check (ad_spend >= 0),
  orders integer not null default 0 check (orders >= 0),
  currency text not null default 'USD' check (currency in ('USD', 'EUR', 'COP', 'MXN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  task_key text not null,
  file_name text not null,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.user_tracker_settings enable row level security;
alter table public.user_task_state enable row level security;
alter table public.monthly_metrics enable row level security;
alter table public.task_attachments enable row level security;

drop policy if exists "settings_private" on public.user_tracker_settings;
create policy "settings_private" on public.user_tracker_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "task_state_private" on public.user_task_state;
create policy "task_state_private" on public.user_task_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "metrics_private" on public.monthly_metrics;
create policy "metrics_private" on public.monthly_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "attachments_private" on public.task_attachments;
create policy "attachments_private" on public.task_attachments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('task-attachments', 'task-attachments', false) on conflict (id) do nothing;
drop policy if exists "attachments_select_own" on storage.objects;
create policy "attachments_select_own" on storage.objects for select using (bucket_id = 'task-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "attachments_insert_own" on storage.objects;
create policy "attachments_insert_own" on storage.objects for insert with check (bucket_id = 'task-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "attachments_delete_own" on storage.objects;
create policy "attachments_delete_own" on storage.objects for delete using (bucket_id = 'task-attachments' and auth.uid()::text = (storage.foldername(name))[1]);
