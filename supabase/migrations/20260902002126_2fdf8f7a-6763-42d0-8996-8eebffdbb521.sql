create or replace function public.submit_wholesale_application(_payload jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  _ref text;
begin
  if coalesce((_payload->>'certified_accurate')::boolean, false) is not true
     or coalesce((_payload->>'agreed_to_terms')::boolean, false) is not true then
    raise exception 'Certification and terms agreement are required';
  end if;

  insert into public.wholesale_applications (
    legal_business_name, dba_name, contact_name, job_title,
    business_email, business_phone,
    billing_address_line1, billing_address_line2, billing_city, billing_state, billing_postal_code,
    shipping_same_as_billing, shipping_address_line1, shipping_address_line2,
    shipping_city, shipping_state, shipping_postal_code,
    business_type, tax_id, website, monthly_spend_estimate, years_in_business,
    brands_serviced, bmw_mini_specialist, preferred_contact_method,
    tax_exempt_requested, resale_certificate_path, additional_notes,
    certified_accurate, agreed_to_terms, user_id
  ) values (
    nullif(trim(_payload->>'legal_business_name'), ''),
    nullif(trim(_payload->>'dba_name'), ''),
    nullif(trim(_payload->>'contact_name'), ''),
    nullif(trim(_payload->>'job_title'), ''),
    nullif(trim(_payload->>'business_email'), ''),
    nullif(trim(_payload->>'business_phone'), ''),
    nullif(trim(_payload->>'billing_address_line1'), ''),
    nullif(trim(_payload->>'billing_address_line2'), ''),
    nullif(trim(_payload->>'billing_city'), ''),
    nullif(trim(_payload->>'billing_state'), ''),
    nullif(trim(_payload->>'billing_postal_code'), ''),
    coalesce((_payload->>'shipping_same_as_billing')::boolean, true),
    nullif(trim(_payload->>'shipping_address_line1'), ''),
    nullif(trim(_payload->>'shipping_address_line2'), ''),
    nullif(trim(_payload->>'shipping_city'), ''),
    nullif(trim(_payload->>'shipping_state'), ''),
    nullif(trim(_payload->>'shipping_postal_code'), ''),
    (_payload->>'business_type')::public.wholesale_business_type,
    nullif(trim(_payload->>'tax_id'), ''),
    nullif(trim(_payload->>'website'), ''),
    nullif(trim(_payload->>'monthly_spend_estimate'), ''),
    nullif(trim(_payload->>'years_in_business'), ''),
    nullif(trim(_payload->>'brands_serviced'), ''),
    coalesce((_payload->>'bmw_mini_specialist')::boolean, false),
    coalesce(nullif(trim(_payload->>'preferred_contact_method'), ''), 'email'),
    coalesce((_payload->>'tax_exempt_requested')::boolean, false),
    nullif(trim(_payload->>'resale_certificate_path'), ''),
    nullif(trim(_payload->>'additional_notes'), ''),
    true,
    true,
    auth.uid()
  )
  returning reference_code into _ref;

  return _ref;
end;
$$;

revoke all on function public.submit_wholesale_application(jsonb) from public;
grant execute on function public.submit_wholesale_application(jsonb) to anon, authenticated;

delete from public.wholesale_applications where business_email = 'd@t.test';