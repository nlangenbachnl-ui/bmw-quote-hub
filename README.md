# Precision Bimmer Parts

Independent BMW parts sourcing and quoting. Not affiliated with BMW AG.

## Sign-in URLs and roles

| URL | Who | After sign-in |
| --- | --- | --- |
| `/wholesale/sign-in` | Repair / body shops, dealerships, fleets | Approved accounts → `/wholesale/dashboard`; pending accounts → application-status shell |
| `/admin/sign-in` | Site owner and staff | Verified admins → `/admin`; everyone else sees access denied |

`/auth` stays only as a backward-compatible redirect to `/wholesale/sign-in`
(`/auth/reset-password` still renders). The old mock `/portal` prototype is gone —
every `/portal/*` URL redirects to the real wholesale dashboard.

## Dashboard navigation

Shop dashboard (`/wholesale/dashboard`): **Dashboard · New Request · History · Account**.
Saved vehicles/VIN management lives inside New Request and Account; History has
Requests / Quotes / Orders / Invoices subtabs.

Staff dashboard (`/admin`): **Requests · Quotes & Orders · Customers · Settings**.
Legacy deep links still work: `/admin/accounts` → Customers (Approved accounts),
`/admin/wholesale-applications` → Customers (Applications), `/admin/wholesale-quotes`
→ Quotes & Orders (Quotes), `/admin/deliveries` → Quotes & Orders (Deliveries).
`/admin/requests/$id` and `/admin/wholesale-applications/$id` are unchanged.


Wholesale signup collects the business profile once (contact name, business name,
phone, business type, account email). It prefills the wholesale application, and
existing accounts missing those fields get a one-time "Complete your business
profile" screen — never the whole application again.

## Designating an admin (wholesale review access)

Admin access to `/admin` is enforced in the database with the `user_roles` table and
the `has_role()` function — hiding routes in the UI is not the security boundary.
No admin exists by default and no credentials are hardcoded.

To grant the first admin:

1. Have the person sign up at `/wholesale/sign-in` (or `/admin/sign-in`) with their work email.
2. In the backend, find their user id in the auth users list.
3. Insert one row:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('<that-user-uuid>', 'admin');
   ```

4. They sign out and back in at `/admin/sign-in`; the admin dashboard unlocks.

Revoke access by deleting that row. Never store roles on a profile row, and never
grant admin from client-side code.

## Retail part-number protection

Retail customers never receive complete OEM part numbers before payment. Quotes are
served through a token-gated server projection that masks numbers (`••••••482`).
Approved wholesale accounts and admins see full part numbers.

## QA / demo wholesale account

A single clearly labeled test account exists for exercising the real wholesale
sign-in and approved dashboard: `qa-demo-shop@example.com` (business
"PBP Demo Repair & Body", no admin/staff role, tier `standard`). All of its
records are prefixed `QA-DEMO-` / `DEMO-` and must never be counted as revenue
or customer activity.

Cleanup SQL — deletes exactly this account and its data (run as a migration;
deleting the auth user cascades the rest):

```sql
-- QA/demo wholesale account teardown
do $$
declare _uid uuid;
begin
  select id into _uid from auth.users where email = 'qa-demo-shop@example.com';
  if _uid is null then return; end if;

  delete from public.wholesale_invoices where user_id = _uid;
  delete from public.wholesale_quote_lines
    where quote_id in (select id from public.wholesale_quotes where user_id = _uid);
  delete from public.wholesale_quotes where user_id = _uid;
  delete from public.wholesale_orders where user_id = _uid;
  delete from public.wholesale_request_items
    where request_id in (select id from public.wholesale_parts_requests where user_id = _uid);
  delete from public.wholesale_parts_requests where user_id = _uid;
  delete from public.wholesale_vehicles where user_id = _uid;
  delete from public.wholesale_profiles where user_id = _uid;
  delete from public.wholesale_application_events
    where application_id in (select id from public.wholesale_applications where user_id = _uid);
  delete from public.wholesale_applications where user_id = _uid;
  delete from public.account_profiles where user_id = _uid;
  delete from auth.users where id = _uid;
end $$;
```
