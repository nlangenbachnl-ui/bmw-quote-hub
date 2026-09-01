import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, ClipboardList, FilePlus2, History, LogOut, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminState } from "@/lib/admin/store";
import { PORTAL_PASSCODE, signIn, signOut, usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal")({
  // Client-only: the prototype session and mock store both rely on browser storage.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Shop Portal — Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Commercial shop portal for OEM BMW parts: submit requests, approve quotes, and track same-day local deliveries.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalLayout,
});

const tabs = [
  { to: "/portal", label: "Dashboard", icon: ClipboardList, exact: true },
  { to: "/portal/request", label: "New Request", icon: FilePlus2, exact: false },
  { to: "/portal/history", label: "History", icon: History, exact: false },
  { to: "/portal/profile", label: "Shop Profile", icon: Store, exact: false },
] as const;

function PortalLayout() {
  const shopId = usePortalSession();
  const { shops } = useAdminState();
  const shop = shops.find((s) => s.id === shopId);

  if (!shop) return <PortalSignIn />;

  return (
    <div className="min-h-screen bg-muted/40">
      <PortalHeader shopName={shop.shopName} contactName={shop.contactName} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

function PortalHeader({ shopName, contactName }: { shopName: string; contactName: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="border-b border-border bg-carbon text-carbon-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full bg-gradient-blue text-sm font-black text-primary-foreground"
          >
            PB
          </span>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-tight">{shopName}</p>
            <p className="text-xs text-carbon-muted">
              Commercial portal · {contactName} · Precision Bimmer Parts
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Portal sections">
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
            to="/for-shops"
            className="rounded-md px-3 py-2 text-sm font-semibold text-carbon-muted hover:text-carbon-foreground"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-carbon-muted hover:text-carbon-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}

function PortalSignIn() {
  const { shops } = useAdminState();
  const [selected, setSelected] = useState(shops[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-carbon px-4 text-carbon-foreground">
      <form
        className="w-full max-w-md rounded-xl border border-white/10 bg-carbon-elevated p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!selected) {
            setError("Choose a shop account.");
            return;
          }
          if (code.trim().toLowerCase() !== PORTAL_PASSCODE) {
            setError("Incorrect passcode.");
            return;
          }
          signIn(selected);
        }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 text-primary-glow">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-tight">Shop portal</h1>
            <p className="text-xs text-carbon-muted">Repair &amp; body shop accounts</p>
          </div>
        </div>

        <Label htmlFor="shop" className="text-carbon-foreground">
          Shop account
        </Label>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger id="shop" className="mt-2 bg-carbon text-carbon-foreground">
            <SelectValue placeholder="Select your shop" />
          </SelectTrigger>
          <SelectContent>
            {shops.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.shopName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label htmlFor="portal-code" className="mt-4 block text-carbon-foreground">
          Account passcode
        </Label>
        <Input
          id="portal-code"
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          className="mt-2 bg-carbon text-carbon-foreground"
          aria-describedby="portal-code-help"
        />
        {error ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <p id="portal-code-help" className="mt-2 text-xs text-carbon-muted">
          Prototype sign-in — demo passcode <span className="font-mono">shop</span>. Real shop
          logins, invitations, and roles arrive with the backend.
        </p>

        <Button type="submit" className="mt-5 w-full">
          Enter portal
        </Button>

        <p className="mt-4 text-center text-xs text-carbon-muted">
          Not set up yet?{" "}
          <Link to="/contact" className="font-semibold text-primary-glow hover:underline">
            Contact our wholesale desk
          </Link>
        </p>
      </form>
    </div>
  );
}
