import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy deep link — wholesale quotes now live inside Quotes & Orders.
export const Route = createFileRoute("/admin/wholesale-quotes")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/quotes-orders", search: { view: "quotes" } });
  },
});
