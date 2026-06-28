
REVOKE EXECUTE ON FUNCTION public.audit_attendance() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_grades() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fanout_announcement() FROM public, anon, authenticated;
