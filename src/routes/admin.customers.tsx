import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ApplicationsQueue } from "@/components/admin/ApplicationsQueue";
import { CommercialAccounts } from "@/components/admin/AccountsPanel";

type View = "applications" | "accounts";

const VIEWS: Array<{ key: View; label: string }> = [
  { key: "applications", label: "Applications" },
  { key: "accounts", label: "Approved accounts" },
];

export const Route = createFileRoute("/admin/customers")({
  validateSearch: (search: Record<string, unknown>) => ({
    view: (["applications", "accounts"] as string[]).includes(String(search.view))
      ? (search.view as View)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Customers — Precision Bimmer Parts" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Customers,
});

function Customers() {
  const { view: initialView } = Route.useSearch();
  const [view, setView] = useState<View>(initialView ?? "applications");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Wholesale applications awaiting review and the shop accounts already approved.
        </p>
      </div>

      <div
        className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/50 p-1"
        role="tablist"
        aria-label="Customer views"
      >
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            onClick={() => setView(v.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              view === v.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "applications" ? <ApplicationsQueue /> : <CommercialAccounts />}
    </div>
  );
}
