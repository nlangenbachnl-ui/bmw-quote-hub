import { createFileRoute } from "@tanstack/react-router";

import { WholesaleRequestDetail } from "@/components/admin/WholesaleRequestDetail";

export const Route = createFileRoute("/staff/wholesale/$id")({
  component: StaffWholesaleRequest,
});

function StaffWholesaleRequest() {
  const { id } = Route.useParams();
  return <WholesaleRequestDetail id={id} backTo="/staff" />;
}
