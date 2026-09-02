revoke all on function public.set_updated_at() from public;
revoke all on function public.protect_wholesale_profile_privileges() from public;
revoke all on function public.sync_wholesale_profile_from_application() from public;
revoke all on function public.has_role(uuid, public.app_role) from public;
revoke all on function public.claim_wholesale_application(text) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.claim_wholesale_application(text) to authenticated;