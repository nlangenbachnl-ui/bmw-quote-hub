import { createFileRoute } from "@tanstack/react-router";

/** Catch-all so old /portal/* links redirect via the parent route. */
export const Route = createFileRoute("/portal/$")({
  component: () => null,
});
