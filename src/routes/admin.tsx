import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, LayoutDashboard, Lock, Settings2, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  // Client-only: the prototype gate and mock store both rely on browser storage.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Internal Quote Desk — Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Internal prototype dashboard for reviewing BMW parts quote requests and building priced quotes.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const GATE_KEY = "pbp:admin-gate";
// Prototype gate only. Real access control moves to Supabase auth + an
// admin role check before this dashboard is exposed anywhere public.
const PROTOTYPE_PASSCODE = "bimmer";

function AdminLayout() {
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== "undefined" && window.sessionStorage.getItem(GATE_KEY) === "1",
  );

  if (!unlocked) {
    return <Gate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

function AdminHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    { to: "/admin", label: "Requests", icon: LayoutDashboard, exact: true },
    { to: "/admin/accounts", label: "Accounts", icon: Building2, exact: false },
    {
      to: "/admin/wholesale-applications",
      label: "Wholesale",
      icon: ShieldCheck,
      exact: false,
    },
    { to: "/admin/deliveries", label: "Deliveries", icon: Truck, exact: false },
    { to: "/admin/settings", label: "Settings", icon: Settings2, exact: false },
  ] as const;

  return (
    <header className="border-b border-border bg-carbon text-carbon-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-blue text-sm font-black text-primary-foreground"
          >
            PB
          </span>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-tight">
              Precision Bimmer Parts
            </p>
            <p className="text-xs text-carbon-muted">Internal quote desk · prototype</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Admin sections">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-carbon-muted hover:bg-carbon-elevated hover:text-carbon-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </Link>
            );
          })}
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-sm font-semibold text-carbon-muted hover:text-carbon-foreground"
          >
            View site
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-carbon px-4 text-carbon-foreground">
      <form
        className="w-full max-w-sm rounded-xl border border-white/10 bg-carbon-elevated p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim().toLowerCase() === PROTOTYPE_PASSCODE) {
            window.sessionStorage.setItem(GATE_KEY, "1");
            onUnlock();
          } else {
            setError("Incorrect passcode.");
          }
        }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 text-primary-glow">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-tight">Internal access</h1>
            <p className="text-xs text-carbon-muted">Precision Bimmer Parts quote desk</p>
          </div>
        </div>

        <Label htmlFor="passcode" className="text-carbon-foreground">
          Team passcode
        </Label>
        <Input
          id="passcode"
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          className="mt-2 bg-carbon text-carbon-foreground"
          aria-describedby="passcode-help"
        />
        {error ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <p id="passcode-help" className="mt-2 text-xs text-carbon-muted">
          Prototype gate — demo passcode <span className="font-mono">bimmer</span>. Replaced by real
          staff accounts and role checks when the backend is wired up.
        </p>

        <Button type="submit" className="mt-5 w-full">
          <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
          Enter dashboard
        </Button>
      </form>
    </div>
  );
}
