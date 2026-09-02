import { createFileRoute, redirect } from "@tanstack/react-router";

/** The mock shop portal is gone; send visitors to the real wholesale account. */
export const Route = createFileRoute("/portal")({
  beforeLoad: () => {
    throw redirect({ to: "/wholesale/dashboard", replace: true });
  },
  component: () => null,
});
