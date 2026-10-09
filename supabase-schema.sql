create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('shopper', 'seller')),
  username text not null check (length(btrim(username)) >= 2),
  shop_name text,
  phone text,
  delivery_address text,
  location text,
  profile_image_path text,
  store_banner_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_details_check check (
    (
      role = 'seller'
      and length(btrim(shop_name)) >= 2
      and phone is null
      and delivery_address is null
    )
    or (
      role = 'shopper'
      and shop_name is null
      and nullif(btrim(phone), '') is not null
      and delivery_address is not null
      and length(btrim(delivery_address)) >= 5
    )
  )
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (
  username,
  shop_name,
  phone,
  delivery_address,
  location,
  profile_image_path,
  store_banner_path,
  updated_at
) on public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.create_marketplace_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_role text;
  account_username text;
begin
  profile_role := case
    when new.raw_user_meta_data ->> 'role' = 'seller' then 'seller'
    else 'shopper'
  end;
  account_username := coalesce(
    case
      when length(trim(new.raw_user_meta_data ->> 'username')) >= 2
        then trim(new.raw_user_meta_data ->> 'username')
    end,
    case
      when length(split_part(new.email, '@', 1)) >= 2
        then split_part(new.email, '@', 1)
    end,
    'Marketplace user'
  );

  insert into public.profiles (
    user_id,
    role,
    username,
    shop_name,
    phone,
    delivery_address
  )
  values (
    new.id,
    profile_role,
    account_username,
    nullif(trim(new.raw_user_meta_data ->> 'shop_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'delivery_address'), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.create_marketplace_profile() from public, anon, authenticated;

drop trigger if exists on_marketplace_auth_user_created on auth.users;
create trigger on_marketplace_auth_user_created
  after insert on auth.users
  for each row execute function public.create_marketplace_profile();

create or replace function public.set_marketplace_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_marketplace_profile_updated_at on public.profiles;
create trigger set_marketplace_profile_updated_at
  before update on public.profiles
  for each row execute function public.set_marketplace_profile_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read their own profile media" on storage.objects;
create policy "Users can read their own profile media"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload their own profile media" on storage.objects;
create policy "Users can upload their own profile media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their own profile media" on storage.objects;
create policy "Users can update their own profile media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own profile media" on storage.objects;
create policy "Users can delete their own profile media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
