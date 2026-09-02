import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * The mock shop portal is gone. Every /portal route now lands on the real
 * Supabase-backed wholesale account (which redirects to wholesale sign-in when
 * there is no session).
 */
export const Route = createFileRoute("/portal")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/wholesale/dashboard", replace: true });
  },
  component: () => <Outlet />,
});
