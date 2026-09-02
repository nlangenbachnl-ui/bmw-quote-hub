-- ROLES
create type public.app_role as enum ('admin','staff','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read their own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy "Admins can read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- SHARED
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.generate_reference(_prefix text)
returns text language sql volatile set search_path = public as $$
  select _prefix || '-' || to_char(now(),'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,5))
$$;

create type public.wholesale_app_status as enum ('pending','under_review','more_info_requested','approved','denied');
create type public.wholesale_tier as enum ('standard','plus','preferred');
create type public.wholesale_business_type as enum ('independent_repair','body_shop','dealership','fleet','performance_tuning','other');

-- APPLICATIONS
create table public.wholesale_applications (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default public.generate_reference('WA'),
  user_id uuid,
  legal_business_name text not null,
  dba_name text,
  contact_name text not null,
  job_title text,
  business_email text not null,
  business_phone text not null,
  billing_address_line1 text not null,
  billing_address_line2 text,
  billing_city text not null,
  billing_state text not null,
  billing_postal_code text not null,
  shipping_same_as_billing boolean not null default true,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  business_type public.wholesale_business_type not null,
  tax_id text not null,
  website text,
  monthly_spend_estimate text,
  years_in_business text,
  brands_serviced text,
  bmw_mini_specialist boolean not null default false,
  preferred_contact_method text not null default 'email',
  tax_exempt_requested boolean not null default false,
  resale_certificate_path text,
  additional_notes text,
  certified_accurate boolean not null default false,
  agreed_to_terms boolean not null default false,
  status public.wholesale_app_status not null default 'pending',
  tier public.wholesale_tier,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.wholesale_applications to anon;
grant select, insert, update on public.wholesale_applications to authenticated;
grant all on public.wholesale_applications to service_role;
alter table public.wholesale_applications enable row level security;

create policy "Anyone can submit an application" on public.wholesale_applications
  for insert to anon, authenticated with check (certified_accurate = true and agreed_to_terms = true);
create policy "Applicants read own application" on public.wholesale_applications
  for select to authenticated using (user_id = auth.uid());
create policy "Admins read all applications" on public.wholesale_applications
  for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update applications" on public.wholesale_applications
  for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create index wholesale_applications_status_idx on public.wholesale_applications (status, created_at desc);
create index wholesale_applications_email_idx on public.wholesale_applications (lower(business_email));
create trigger wholesale_applications_updated before update on public.wholesale_applications
  for each row execute function public.set_updated_at();

-- APPLICATION EVENTS / NOTES
create table public.wholesale_application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.wholesale_applications(id) on delete cascade,
  actor_id uuid,
  event_type text not null default 'note',
  from_status public.wholesale_app_status,
  to_status public.wholesale_app_status,
  note text,
  created_at timestamptz not null default now()
);
grant select, insert on public.wholesale_application_events to authenticated;
grant all on public.wholesale_application_events to service_role;
alter table public.wholesale_application_events enable row level security;
create policy "Admins manage application events" on public.wholesale_application_events
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create index wholesale_application_events_app_idx on public.wholesale_application_events (application_id, created_at desc);

-- PROFILES
create table public.wholesale_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  application_id uuid references public.wholesale_applications(id) on delete set null,
  company_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  status public.wholesale_app_status not null default 'pending',
  tier public.wholesale_tier not null default 'standard',
  ship_address_line1 text,
  ship_address_line2 text,
  ship_city text,
  ship_state text,
  ship_postal_code text,
  delivery_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.wholesale_profiles to authenticated;
grant all on public.wholesale_profiles to service_role;
alter table public.wholesale_profiles enable row level security;
create policy "Owners read own profile" on public.wholesale_profiles
  for select to authenticated using (user_id = auth.uid());
create policy "Owners update own profile" on public.wholesale_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins manage profiles" on public.wholesale_profiles
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger wholesale_profiles_updated before update on public.wholesale_profiles
  for each row execute function public.set_updated_at();

-- Owners may not escalate their own status or tier
create or replace function public.protect_wholesale_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then
    new.status := old.status;
    new.tier := old.tier;
    new.application_id := old.application_id;
  end if;
  return new;
end; $$;

create trigger wholesale_profiles_protect before update on public.wholesale_profiles
  for each row execute function public.protect_wholesale_profile_privileges();

-- TIER PRICING
create table public.wholesale_tier_pricing (
  tier public.wholesale_tier primary key,
  discount_percent numeric(5,2),
  description text,
  is_sample boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.wholesale_tier_pricing to authenticated;
grant all on public.wholesale_tier_pricing to service_role;
alter table public.wholesale_tier_pricing enable row level security;
create policy "Authenticated read tier pricing" on public.wholesale_tier_pricing
  for select to authenticated using (true);
create policy "Admins manage tier pricing" on public.wholesale_tier_pricing
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.wholesale_tier_pricing (tier, discount_percent, description) values
  ('standard', null, 'Entry wholesale tier. Discount not configured yet.'),
  ('plus', null, 'Mid volume tier. Discount not configured yet.'),
  ('preferred', null, 'Highest volume tier. Discount not configured yet.');
create trigger wholesale_tier_pricing_updated before update on public.wholesale_tier_pricing
  for each row execute function public.set_updated_at();

-- SAVED VEHICLES
create table public.wholesale_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nickname text not null,
  vin text not null,
  model_year text,
  model text,
  chassis_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wholesale_vehicles_vin_len check (char_length(vin) = 17)
);
grant select, insert, update, delete on public.wholesale_vehicles to authenticated;
grant all on public.wholesale_vehicles to service_role;
alter table public.wholesale_vehicles enable row level security;
create policy "Owners manage own vehicles" on public.wholesale_vehicles
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins read vehicles" on public.wholesale_vehicles
  for select to authenticated using (public.has_role(auth.uid(),'admin'));
create index wholesale_vehicles_user_idx on public.wholesale_vehicles (user_id, created_at desc);
create trigger wholesale_vehicles_updated before update on public.wholesale_vehicles
  for each row execute function public.set_updated_at();

-- PARTS REQUESTS
create table public.wholesale_parts_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique default public.generate_reference('WR'),
  user_id uuid not null,
  vehicle_id uuid references public.wholesale_vehicles(id) on delete set null,
  vin text,
  model_year text,
  model text,
  po_number text,
  urgency text not null default 'standard',
  fulfillment_preference text not null default 'shipping',
  notes text,
  attachment_paths text[] not null default '{}',
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.wholesale_parts_requests to authenticated;
grant all on public.wholesale_parts_requests to service_role;
alter table public.wholesale_parts_requests enable row level security;
create policy "Owners read own requests" on public.wholesale_parts_requests
  for select to authenticated using (user_id = auth.uid());
create policy "Owners create own requests" on public.wholesale_parts_requests
  for insert to authenticated with check (user_id = auth.uid());
create policy "Admins manage requests" on public.wholesale_parts_requests
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create index wholesale_parts_requests_user_idx on public.wholesale_parts_requests (user_id, created_at desc);
create trigger wholesale_parts_requests_updated before update on public.wholesale_parts_requests
  for each row execute function public.set_updated_at();

create table public.wholesale_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.wholesale_parts_requests(id) on delete cascade,
  part_number text,
  description text not null,
  quantity integer not null default 1,
  created_at timestamptz not null default now()
);
grant select, insert on public.wholesale_request_items to authenticated;
grant all on public.wholesale_request_items to service_role;
alter table public.wholesale_request_items enable row level security;
create policy "Owners read own request items" on public.wholesale_request_items
  for select to authenticated using (exists (select 1 from public.wholesale_parts_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "Owners create own request items" on public.wholesale_request_items
  for insert to authenticated with check (exists (select 1 from public.wholesale_parts_requests r where r.id = request_id and r.user_id = auth.uid()));
create policy "Admins manage request items" on public.wholesale_request_items
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create index wholesale_request_items_request_idx on public.wholesale_request_items (request_id);

-- ORDERS
create table public.wholesale_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_reference('WO'),
  user_id uuid not null,
  request_id uuid references public.wholesale_parts_requests(id) on delete set null,
  po_number text,
  status text not null default 'pending',
  total_amount numeric(12,2),
  carrier text,
  tracking_number text,
  tracking_url text,
  tracking_status text,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.wholesale_orders to authenticated;
grant all on public.wholesale_orders to service_role;
alter table public.wholesale_orders enable row level security;
create policy "Owners read own orders" on public.wholesale_orders
  for select to authenticated using (user_id = auth.uid());
create policy "Admins manage orders" on public.wholesale_orders
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create index wholesale_orders_user_idx on public.wholesale_orders (user_id, placed_at desc);
create trigger wholesale_orders_updated before update on public.wholesale_orders
  for each row execute function public.set_updated_at();

-- INVOICES
create table public.wholesale_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  user_id uuid not null,
  order_id uuid references public.wholesale_orders(id) on delete set null,
  issued_on date not null default current_date,
  amount numeric(12,2) not null,
  status text not null default 'open',
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.wholesale_invoices to authenticated;
grant all on public.wholesale_invoices to service_role;
alter table public.wholesale_invoices enable row level security;
create policy "Owners read own invoices" on public.wholesale_invoices
  for select to authenticated using (user_id = auth.uid());
create policy "Admins manage invoices" on public.wholesale_invoices
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create index wholesale_invoices_user_idx on public.wholesale_invoices (user_id, issued_on desc);
create trigger wholesale_invoices_updated before update on public.wholesale_invoices
  for each row execute function public.set_updated_at();

-- CLAIM AN APPROVED APPLICATION
create or replace function public.claim_wholesale_application(_reference_code text)
returns public.wholesale_profiles
language plpgsql volatile security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _email text := lower(coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email', ''));
  _app public.wholesale_applications;
  _profile public.wholesale_profiles;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;

  select * into _app from public.wholesale_applications
  where upper(reference_code) = upper(trim(_reference_code)) limit 1;

  if _app.id is null then raise exception 'No application found for that reference number'; end if;
  if _email = '' or lower(_app.business_email) <> _email then
    raise exception 'This application was submitted with a different business email';
  end if;
  if _app.user_id is not null and _app.user_id <> _uid then
    raise exception 'This application is already linked to another account';
  end if;

  update public.wholesale_applications set user_id = _uid where id = _app.id;

  insert into public.wholesale_profiles (
    user_id, application_id, company_name, contact_name, contact_email, contact_phone,
    status, tier, ship_address_line1, ship_address_line2, ship_city, ship_state, ship_postal_code
  ) values (
    _uid, _app.id, coalesce(_app.dba_name, _app.legal_business_name), _app.contact_name,
    _app.business_email, _app.business_phone, _app.status, coalesce(_app.tier,'standard'),
    coalesce(_app.shipping_address_line1, _app.billing_address_line1),
    coalesce(_app.shipping_address_line2, _app.billing_address_line2),
    coalesce(_app.shipping_city, _app.billing_city),
    coalesce(_app.shipping_state, _app.billing_state),
    coalesce(_app.shipping_postal_code, _app.billing_postal_code)
  )
  on conflict (user_id) do update set
    application_id = excluded.application_id,
    company_name = excluded.company_name,
    status = excluded.status,
    tier = excluded.tier,
    updated_at = now()
  returning * into _profile;

  return _profile;
end; $$;

grant execute on function public.claim_wholesale_application(text) to authenticated;

-- Keep linked profiles in sync when admins change an application
create or replace function public.sync_wholesale_profile_from_application()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.wholesale_profiles
     set status = new.status,
         tier = coalesce(new.tier, tier),
         updated_at = now()
   where application_id = new.id;
  return new;
end; $$;

create trigger wholesale_applications_sync_profile
after update of status, tier on public.wholesale_applications
for each row execute function public.sync_wholesale_profile_from_application();

-- STORAGE POLICIES (buckets created separately)
create policy "Anyone can upload wholesale documents" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'wholesale-docs');
create policy "Admins read wholesale documents" on storage.objects
  for select to authenticated using (bucket_id = 'wholesale-docs' and public.has_role(auth.uid(),'admin'));
create policy "Wholesale users upload own files" on storage.objects
  for insert to authenticated with check (bucket_id = 'wholesale-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Wholesale users read own files" on storage.objects
  for select to authenticated using (bucket_id = 'wholesale-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Admins read wholesale files" on storage.objects
  for select to authenticated using (bucket_id = 'wholesale-files' and public.has_role(auth.uid(),'admin'));