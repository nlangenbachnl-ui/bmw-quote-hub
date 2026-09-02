import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Consolidated into /repair-body-shops. Kept as a permanent redirect so any
 * existing links, bookmarks, or indexed URLs keep working.
 */
export const Route = createFileRoute("/for-shops")({
  beforeLoad: () => {
    throw redirect({ to: "/repair-body-shops", statusCode: 301 });
  },
});
