import { createFileRoute, redirect } from "@tanstack/react-router";

/** The mock shop portal is gone; send visitors to the real wholesale account (signed-in users are forwarded to the dashboard). */
export const Route = createFileRoute("/portal")({
  beforeLoad: () => {
    throw redirect({ to: "/wholesale/sign-in", replace: true });
  },
  component: () => null,
});
