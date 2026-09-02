revoke all on function public.set_updated_at() from anon, authenticated;
revoke all on function public.protect_wholesale_profile_privileges() from anon, authenticated;
revoke all on function public.sync_wholesale_profile_from_application() from anon, authenticated;
revoke all on function public.has_role(uuid, public.app_role) from anon;
revoke all on function public.claim_wholesale_application(text) from anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.claim_wholesale_application(text) to authenticated;