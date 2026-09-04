import { createFileRoute } from "@tanstack/react-router";

import { RetailQuoteBuilder } from "@/components/admin/RetailQuoteBuilder";

export const Route = createFileRoute("/staff/requests/$id")({
  component: StaffRetailRequest,
});

function StaffRetailRequest() {
  const { id } = Route.useParams();
  return <RetailQuoteBuilder id={id} backTo="/staff" />;
}
