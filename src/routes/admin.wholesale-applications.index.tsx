import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy deep link — the application queue now lives inside Customers.
export const Route = createFileRoute("/admin/wholesale-applications/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/customers", search: { view: "applications" } });
  },
});
