import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ensureAccountProfileFromMetadata } from "@/lib/account/api";
import { BUSINESS_TYPE_LABELS } from "@/lib/wholesale/constants";

export const Route = createFileRoute("/wholesale/sign-in")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Wholesale Account Sign In | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Sign in or create a Precision Bimmer Parts wholesale account to request OEM BMW parts, manage saved VINs, and track orders.",
      },
      { property: "og:title", content: "Wholesale Account Sign In | Precision Bimmer Parts" },
      {
        property: "og:description",
        content: "Access your Precision Bimmer Parts wholesale dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WholesaleSignInPage,
});

type Mode = "signin" | "signup" | "forgot";

const emptyProfile = {
  full_name: "",
  business_name: "",
  phone: "",
  business_type: "",
};

function WholesaleSignInPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      void (async () => {
        await ensureAccountProfileFromMetadata().catch(() => null);
        await navigate({ to: "/wholesale/dashboard" });
      })();
    }
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSent(null);

    if (!email.trim() || (mode !== "forgot" && password.length < 8)) {
      setError(
        mode === "forgot"
          ? "Enter the email on your account."
          : "Enter your email and a password of at least 8 characters.",
      );
      return;
    }

    if (mode === "signup") {
      if (profile.full_name.trim().length < 2) return setError("Enter your full name.");
      if (profile.business_name.trim().length < 2)
        return setError("Enter your legal or trading business name.");
      if (profile.phone.trim().length < 7) return setError("Enter a reachable business phone.");
      if (!profile.business_type) return setError("Select your business type.");
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        await ensureAccountProfileFromMetadata().catch(() => null);
        toast.success("Signed in");
        await navigate({ to: "/wholesale/dashboard" });
      } else if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/wholesale/sign-in`,
            data: {
              full_name: profile.full_name.trim(),
              business_name: profile.business_name.trim(),
              phone: profile.phone.trim(),
              business_type: profile.business_type,
            },
          },
        });
        if (err) throw err;
        if (data.session) {
          await ensureAccountProfileFromMetadata().catch(() => null);
          toast.success("Account created");
          await navigate({ to: "/wholesale/dashboard" });
          return;
        }
        setSent(
          "Account created. If email confirmation is required, check your inbox for the confirmation link, then sign in — your business details are already saved.",
        );
        setMode("signin");
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (err) throw err;
        setSent("If that email has an account, a password reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Repair &amp; body shop accounts
      </p>
      <h1 className="mt-3 text-3xl font-extrabold uppercase tracking-tight">
        {mode === "signup"
          ? "Create your wholesale account"
          : mode === "forgot"
            ? "Reset your password"
            : "Wholesale account sign in"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {mode === "signup"
          ? "We collect your business details once here, so the wholesale application is prefilled. Use the same email as any application you already submitted and we can link it."
          : mode === "forgot"
            ? "We'll email you a secure link to choose a new password."
            : "Sign in to your Precision Bimmer Parts wholesale dashboard."}
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        {mode === "signup" ? (
          <>
            <div>
              <Label htmlFor="full_name">Contact name</Label>
              <Input
                id="full_name"
                autoComplete="name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="business_name">Legal / business name</Label>
              <Input
                id="business_name"
                autoComplete="organization"
                value={profile.business_name}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Business phone</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="business_type">Business type</Label>
              <select
                id="business_type"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={profile.business_type}
                onChange={(e) => setProfile({ ...profile, business_type: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {Object.entries(BUSINESS_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        <div>
          <Label htmlFor="email">Business email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
            aria-describedby={mode === "signup" ? "email-help" : undefined}
            required
          />
          {mode === "signup" ? (
            <p id="email-help" className="mt-1.5 text-xs text-muted-foreground">
              This is your sign-in email and the business email on your account — we won't ask
              for it again.
            </p>
          ) : null}
        </div>

        {mode !== "forgot" ? (
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
              aria-describedby="password-help"
              required
            />
            <p id="password-help" className="mt-1.5 text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
        {sent ? (
          <p role="status" className="rounded-md bg-muted p-3 text-sm text-foreground">
            {sent}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {mode === "signup"
            ? "Create account"
            : mode === "forgot"
              ? "Send reset link"
              : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-sm">
        {mode !== "signin" ? (
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setMode("signin")}
          >
            Back to sign in
          </button>
        ) : (
          <>
            <p>
              New here?{" "}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setMode("signup")}
              >
                Create an account
              </button>
            </p>
            <p>
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setMode("forgot")}
              >
                Forgot your password?
              </button>
            </p>
          </>
        )}
        <p className="pt-2 text-muted-foreground">
          Need a wholesale account?{" "}
          <Link to="/wholesale" className="font-semibold text-primary hover:underline">
            Apply here.
          </Link>
        </p>
        <p className="text-muted-foreground">
          Staff member?{" "}
          <Link to="/admin/sign-in" className="font-semibold text-primary hover:underline">
            Admin sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
