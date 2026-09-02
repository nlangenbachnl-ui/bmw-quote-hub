import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old /portal/* deep links redirect to the real wholesale dashboard. */
export const Route = createFileRoute("/portal_/$")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/wholesale/dashboard", replace: true });
  },
  component: () => null,
});
