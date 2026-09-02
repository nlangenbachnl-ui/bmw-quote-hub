import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy deep link — approved accounts now live inside Customers.
export const Route = createFileRoute("/admin/accounts")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/customers", search: { view: "accounts" } });
  },
});
