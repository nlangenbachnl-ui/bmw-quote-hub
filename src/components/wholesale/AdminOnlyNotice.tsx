import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

/** Client-side notice only — admin authorization is enforced by RLS in the database. */
export function AdminOnlyNotice({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-border bg-background p-8">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-xl font-extrabold uppercase tracking-tight">Admin access required</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {signedIn
          ? "Your account doesn't have the admin role. Access to wholesale applications is enforced in the database, so this page stays empty without it."
          : "Sign in with an admin account to review wholesale applications."}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        To designate the first admin, add a row to the <code>user_roles</code> table with that
        user's ID and the <code>admin</code> role from the backend. See <code>README.md</code> →
        "Designating an admin".
      </p>
      {!signedIn ? (
        <Link
          to="/wholesale/sign-in"
          className="mt-6 inline-block rounded-md bg-gradient-blue px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
        >
          Sign in
        </Link>
      ) : null}
    </div>
  );
}
