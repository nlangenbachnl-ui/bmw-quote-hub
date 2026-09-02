import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/sign-in")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — Precision Bimmer Parts" },
      {
        name: "description",
        content: "Staff sign-in for the Precision Bimmer Parts internal quote desk.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSignInPage,
});

function AdminSignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setDenied(false);

    if (!email.trim() || password.length < 8) {
      setError("Enter your staff email and password.");
      return;
    }

    setBusy(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      // Authorization is enforced in the database (user_roles + has_role RLS);
      // this check only decides where to send the user.
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: data.user!.id,
        _role: "admin",
      });
      if (roleError) throw roleError;

      if (!isAdmin) {
        setDenied(true);
        return;
      }

      toast.success("Signed in");
      await navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-carbon px-4 text-carbon-foreground">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-carbon-elevated p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 text-primary-glow">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold uppercase tracking-tight">Admin sign in</h1>
            <p className="text-xs text-carbon-muted">Precision Bimmer Parts staff only</p>
          </div>
        </div>

        {denied ? (
          <div role="alert" className="space-y-4">
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              This account is signed in but does not have the admin role, so the internal quote
              desk stays locked. Access is enforced in the database.
            </p>
            <p className="text-sm text-carbon-muted">
              Running a repair or body shop?{" "}
              <Link
                to="/wholesale/sign-in"
                className="font-semibold text-primary-glow hover:underline"
              >
                Use the wholesale sign in
              </Link>
              .
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut();
                setDenied(false);
                setPassword("");
              }}
            >
              Sign out and try another account
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <Label htmlFor="admin-email" className="text-carbon-foreground">
                Staff email
              </Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-carbon text-carbon-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-carbon-foreground">
                Password
              </Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 bg-carbon text-carbon-foreground"
                required
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Sign in to admin
            </Button>

            <p className="text-center text-xs text-carbon-muted">
              Shop customer?{" "}
              <Link
                to="/wholesale/sign-in"
                className="font-semibold text-primary-glow hover:underline"
              >
                Wholesale sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
