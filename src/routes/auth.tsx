import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

/**
 * Backward-compatible shell. `/auth` now redirects to the branded wholesale
 * sign-in; `/auth/reset-password` still renders as a child.
 */
export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (location.pathname.replace(/\/$/, "") === "/auth") {
      throw redirect({ to: "/wholesale/sign-in" });
    }
  },
  component: () => <Outlet />,
});
