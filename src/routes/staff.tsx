import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { Loader2, ShieldAlert, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { signOut, useAuth, useStaffAccess } from "@/hooks/useAuth";

export const Route = createFileRoute("/staff")({
  // Client-only: the Supabase session lives in browser storage.
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (location.pathname.startsWith("/staff/sign-in")) return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/staff/sign-in" });
  },
  head: () => ({
    meta: [
      { title: "Parts Desk — Precision Bimmer Parts" },
      {
        name: "description",
        content: "Parts staff queue for incoming BMW parts requests.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StaffLayout,
});

function StaffLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const access = useStaffAccess(user?.id);

  if (pathname.startsWith("/staff/sign-in")) return <Outlet />;

  if (loading || access.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  if (!access.data?.canWorkQueue) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
        <div className="w-full max-w-xl rounded-xl border border-border bg-background p-8">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-xl font-extrabold uppercase tracking-tight">
            Parts staff access required
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You're signed in, but this account isn't set up as parts staff. An owner can grant
            parts-desk access from Admin → Staff.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/wholesale/sign-in"
              className="rounded-md bg-gradient-blue px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
            >
              Shop sign in
            </Link>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                window.location.href = "/staff/sign-in";
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-carbon text-carbon-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
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
              <p className="text-xs text-carbon-muted">Parts desk</p>
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
                Parts staff
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/staff">Queue</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/">View site</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={async () => {
                  await signOut();
                  window.location.href = "/staff/sign-in";
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
