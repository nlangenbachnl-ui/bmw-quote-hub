
## Designating an admin (wholesale review access)

Admin access to `/admin/wholesale-applications` is enforced in the database with the
`user_roles` table and the `has_role()` function — hiding routes in the UI is not the
security boundary. No admin exists by default and no credentials are hardcoded.

To grant the first admin:

1. Have the person sign up at `/auth` with their work email.
2. In the backend, find their user id in the auth users list.
3. Insert one row:

   ```sql
   insert into public.user_roles (user_id, role)
   values ('<that-user-uuid>', 'admin');
   ```

4. They sign out and back in; the wholesale queue and review actions unlock.

Revoke access by deleting that row. Never store roles on a profile row, and never
grant admin from client-side code.
