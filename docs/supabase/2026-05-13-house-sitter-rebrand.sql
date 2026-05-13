-- House Sitter Directory rebrand patch
-- Date: 2026-05-13
--
-- IMPORTANT:
-- 1) Keep users.role values as 'cleaner' and 'client' for app compatibility.
-- 2) This script adds rebrand-friendly labels + views and updates existing data copy.

begin;

-- ------------------------------------------------------------
-- 1) Add display fields for both user types (non-breaking)
-- ------------------------------------------------------------
alter table if exists public.users
  add column if not exists role_display text,
  add column if not exists marketplace_side text;

update public.users
set
  role_display = case
    when role = 'cleaner' then 'House Sitter'
    when role = 'client' then 'House Sit Host'
    when role = 'admin' then 'Admin'
    else role
  end,
  marketplace_side = case
    when role = 'cleaner' then 'house_sitters'
    when role = 'client' then 'house_sits'
    when role = 'admin' then 'admin'
    else role
  end
where role_display is distinct from case
    when role = 'cleaner' then 'House Sitter'
    when role = 'client' then 'House Sit Host'
    when role = 'admin' then 'Admin'
    else role
  end
  or marketplace_side is distinct from case
    when role = 'cleaner' then 'house_sitters'
    when role = 'client' then 'house_sits'
    when role = 'admin' then 'admin'
    else role
  end;

comment on column public.users.role_display is 'UI-safe role label for rebranded marketplace copy';
comment on column public.users.marketplace_side is 'UI taxonomy: house_sitters | house_sits | admin';

-- ------------------------------------------------------------
-- 2) Keep Supabase Auth metadata aligned (for existing users)
-- ------------------------------------------------------------
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object(
      'roleDisplay',
      case
        when coalesce(raw_user_meta_data->>'role', '') = 'cleaner' then 'House Sitter'
        when coalesce(raw_user_meta_data->>'role', '') = 'client' then 'House Sit Host'
        when coalesce(raw_user_meta_data->>'role', '') = 'admin' then 'Admin'
        else coalesce(raw_user_meta_data->>'role', '')
      end,
      'marketplaceSide',
      case
        when coalesce(raw_user_meta_data->>'role', '') = 'cleaner' then 'house_sitters'
        when coalesce(raw_user_meta_data->>'role', '') = 'client' then 'house_sits'
        when coalesce(raw_user_meta_data->>'role', '') = 'admin' then 'admin'
        else coalesce(raw_user_meta_data->>'role', '')
      end
    )
where raw_user_meta_data ? 'role';

-- ------------------------------------------------------------
-- 3) Update existing sitter/client profile copy in data (safe)
-- ------------------------------------------------------------
update public.cleaners
set bio = regexp_replace(
  regexp_replace(coalesce(bio, ''), '\\mcleaner(s)?\\M', 'house sitter\\1', 'gi'),
  '\\mcleaning\\M',
  'house sitting',
  'gi'
)
where bio is not null
  and (bio ~* '\\mcleaner(s)?\\M' or bio ~* '\\mcleaning\\M');

-- ------------------------------------------------------------
-- 4) Public rebrand views for the two marketplace sides
-- ------------------------------------------------------------
create or replace view public.house_sitters_v as
select
  c.id as sitter_id,
  c.user_id,
  u.name,
  u.email,
  u.phone,
  c.bio,
  c.skills,
  c.years_experience,
  c.hourly_rate,
  c.profile_image_url,
  c.average_rating,
  c.total_jobs,
  c.status,
  c.created_at,
  c.updated_at
from public.cleaners c
join public.users u on u.id = c.user_id
where u.role = 'cleaner';

create or replace view public.house_sits_v as
select
  b.id as house_sit_id,
  b.client_id,
  b.cleaner_id as assigned_sitter_id,
  b.status,
  b.service_type as sit_type,
  b.special_instructions,
  b.address,
  b.city,
  b.postcode,
  b.country,
  b.scheduled_start,
  b.scheduled_end,
  b.subtotal,
  b.platform_fee,
  b.total_amount,
  b.created_at,
  b.updated_at
from public.bookings b;

comment on view public.house_sitters_v is 'Rebrand view for sitter-side listings';
comment on view public.house_sits_v is 'Rebrand view for house-sit listings';

commit;

-- Optional validation queries:
-- select role, role_display, marketplace_side, count(*) from public.users group by 1,2,3 order by 1;
-- select count(*) from public.house_sitters_v;
-- select count(*) from public.house_sits_v;
