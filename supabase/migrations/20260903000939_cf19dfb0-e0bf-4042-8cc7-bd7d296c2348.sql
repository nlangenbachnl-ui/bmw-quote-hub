create or replace function public.has_staff_access(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin'::app_role, 'staff'::app_role)
  )
$$;

-- Parts staff: work the request queue
create policy "Staff read requests" on public.wholesale_parts_requests
  for select to authenticated using (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff update requests" on public.wholesale_parts_requests
  for update to authenticated using (public.has_role(auth.uid(), 'staff'::app_role))
  with check (public.has_role(auth.uid(), 'staff'::app_role));

create policy "Staff read request items" on public.wholesale_request_items
  for select to authenticated using (public.has_role(auth.uid(), 'staff'::app_role));

-- Parts staff: build quotes
create policy "Staff manage wholesale quotes" on public.wholesale_quotes
  for all to authenticated using (public.has_role(auth.uid(), 'staff'::app_role))
  with check (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff manage wholesale quote lines" on public.wholesale_quote_lines
  for all to authenticated using (public.has_role(auth.uid(), 'staff'::app_role))
  with check (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff manage retail quotes" on public.retail_quotes
  for all to authenticated using (public.has_role(auth.uid(), 'staff'::app_role))
  with check (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff manage retail quote lines" on public.retail_quote_lines
  for all to authenticated using (public.has_role(auth.uid(), 'staff'::app_role))
  with check (public.has_role(auth.uid(), 'staff'::app_role));

-- Parts staff: fulfilment context (read-only identity data)
create policy "Staff read orders" on public.wholesale_orders
  for select to authenticated using (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff update orders" on public.wholesale_orders
  for update to authenticated using (public.has_role(auth.uid(), 'staff'::app_role))
  with check (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff read invoices" on public.wholesale_invoices
  for select to authenticated using (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff read wholesale profiles" on public.wholesale_profiles
  for select to authenticated using (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff read vehicles" on public.wholesale_vehicles
  for select to authenticated using (public.has_role(auth.uid(), 'staff'::app_role));
create policy "Staff read account profiles" on public.account_profiles
  for select to authenticated using (public.has_role(auth.uid(), 'staff'::app_role));