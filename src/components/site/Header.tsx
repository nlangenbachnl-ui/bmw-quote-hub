import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
          aria-label="Precision Bimmer Parts — home"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-blue text-sm font-black text-primary-foreground"
          >
            BP
          </span>
          <span className="truncate text-lg font-extrabold uppercase tracking-tight">
            Precision<span className="text-primary">Bimmer Parts</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="text-sm font-semibold uppercase tracking-wide transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/request-quote"
            className="rounded-md bg-gradient-blue px-4 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
          >
            Request a Quote
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile"
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-3 text-sm font-semibold uppercase tracking-wide text-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/request-quote"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-md bg-gradient-blue px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground"
          >
            Request a Quote
          </Link>
        </nav>
      )}
    </header>
  );
}
