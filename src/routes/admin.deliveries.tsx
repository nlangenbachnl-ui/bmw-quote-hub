import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy deep link — the delivery board now lives inside Quotes & Orders.
export const Route = createFileRoute("/admin/deliveries")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/quotes-orders", search: { view: "deliveries" } });
  },
});
