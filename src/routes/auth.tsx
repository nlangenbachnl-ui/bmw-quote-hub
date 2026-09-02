import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
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
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      void navigate({ to: "/wholesale/dashboard" });
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

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        toast.success("Signed in");
        await navigate({ to: "/wholesale/dashboard" });
      } else if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (err) throw err;
        setSent(
          "Account created. If email confirmation is required, check your inbox for the confirmation link, then sign in.",
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
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">
        {mode === "signup"
          ? "Create your account"
          : mode === "forgot"
            ? "Reset your password"
            : "Wholesale sign in"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {mode === "signup"
          ? "Register with your business email. If you have already applied, use the same email so we can link your approved application."
          : mode === "forgot"
            ? "We'll email you a secure link to choose a new password."
            : "Sign in to your Precision Bimmer Parts wholesale dashboard."}
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <Label htmlFor="email">Business email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5"
            required
          />
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
          Not a wholesale customer yet?{" "}
          <Link to="/wholesale" className="font-semibold text-primary hover:underline">
            Apply for an account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
