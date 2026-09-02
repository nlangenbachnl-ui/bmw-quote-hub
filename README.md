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
