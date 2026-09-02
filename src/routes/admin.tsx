import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { Building2, LayoutDashboard, Loader2, ReceiptText, Settings2, ShieldAlert, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { signOut, useAuth, useIsAdmin } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  // Client-only: the Supabase session lives in browser storage.
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith("/admin/sign-in")) return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/admin/sign-in" });
    }
  },
  head: () => ({
    meta: [
      { title: "Internal Quote Desk — Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Internal dashboard for reviewing BMW parts quote requests and building priced quotes.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);

  if (pathname.startsWith("/admin/sign-in")) {
    return <Outlet />;
  }

  if (loading || isAdmin.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (!isAdmin.data) {
    return <AccessDenied />;
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

/** UI-only notice — admin authorization is enforced by RLS in the database. */
function AccessDenied() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <div className="w-full max-w-xl rounded-xl border border-border bg-background p-8">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-xl font-extrabold uppercase tracking-tight">
          Admin access required
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You're signed in, but this account doesn't have the admin role. Access to the internal
          quote desk and wholesale applications is enforced in the database, so it stays locked
          without it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/wholesale/sign-in"
            className="rounded-md bg-gradient-blue px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
          >
            Go to wholesale sign in
          </Link>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              window.location.href = "/admin/sign-in";
            }}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}


function AdminHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    { to: "/admin", label: "Requests", icon: LayoutDashboard, exact: true },
    { to: "/admin/quotes-orders", label: "Quotes & Orders", icon: ReceiptText, exact: false },
    { to: "/admin/customers", label: "Customers", icon: Building2, exact: false },
    { to: "/admin/settings", label: "Settings", icon: Settings2, exact: false },
  ] as const;

  const isCustomers =
    pathname.startsWith("/admin/customers") ||
    pathname.startsWith("/admin/wholesale-applications") ||
    pathname.startsWith("/admin/accounts");

  return (
    <header className="border-b border-border bg-carbon text-carbon-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
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
            <p className="text-xs text-carbon-muted">Staff dashboard</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-carbon-muted hover:bg-carbon-elevated hover:text-carbon-foreground"
            >
              <UserRound className="mr-2 h-4 w-4" aria-hidden="true" />
              Staff
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/">View site</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={async () => {
                await signOut();
                window.location.href = "/admin/sign-in";
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6">
        <nav className="flex gap-2 overflow-x-auto" aria-label="Admin sections">
          {tabs.map((tab) => {
            const active =
              tab.to === "/admin/customers"
                ? isCustomers
                : tab.exact
                  ? pathname === tab.to
                  : pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
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
        </nav>
      </div>
    </header>
  );
}
