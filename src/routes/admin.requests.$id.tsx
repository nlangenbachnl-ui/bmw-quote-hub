import { createFileRoute } from "@tanstack/react-router";

import { RetailQuoteBuilder } from "@/components/admin/RetailQuoteBuilder";

export const Route = createFileRoute("/admin/requests/$id")({
  component: AdminRetailRequest,
});

function AdminRetailRequest() {
  const { id } = Route.useParams();
  return <RetailQuoteBuilder id={id} backTo="/admin" />;
}
