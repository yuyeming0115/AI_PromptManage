-- 在 Supabase Dashboard → SQL Editor 里执行此文件

-- Prompts 表
create table if not exists public.prompts (
  id           text    primary key,
  user_id      uuid    references auth.users(id) on delete cascade not null,
  title        text    not null,
  content      text    not null,
  category_id  text    not null default 'general',
  use_count    integer not null default 0,
  created_at   bigint  not null,
  updated_at   bigint  not null
);

-- 自定义分类表（内置分类无需同步）
create table if not exists public.categories (
  id          text   primary key,
  user_id     uuid   references auth.users(id) on delete cascade not null,
  label       text   not null,
  created_at  bigint not null
);

-- Row Level Security
alter table public.prompts   enable row level security;
alter table public.categories enable row level security;

create policy "prompts: owner full access"
  on public.prompts for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories: owner full access"
  on public.categories for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Realtime（在 Supabase Dashboard → Realtime 里也要打开这两张表）
alter publication supabase_realtime add table public.prompts;
alter publication supabase_realtime add table public.categories;
