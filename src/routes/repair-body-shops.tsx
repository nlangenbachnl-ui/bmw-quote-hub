import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  LogIn,
  Percent,
  ShieldCheck,
  Timer,
  Truck,
} from "lucide-react";

import { TrustBadges } from "@/components/site/TrustBadges";

export const Route = createFileRoute("/repair-body-shops")({
  head: () => ({
    meta: [
      { title: "OEM BMW Parts for Repair & Body Shops | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Wholesale OEM BMW parts sourcing for independent repair and collision shops: fast quoting, PO/RO references, tiered wholesale pricing, and local same-day delivery where eligible.",
      },
      { property: "og:title", content: "OEM BMW Parts for Repair & Body Shops" },
      {
        property: "og:description",
        content:
          "Send an estimate and a VIN — we build the OEM parts quote. Wholesale accounts get tiered pricing, PO/RO tracking, and repeat ordering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RepairBodyShops,
});

const benefits = [
  {
    icon: Timer,
    title: "Fast sourcing, same business day",
    body: "Send a VIN and a parts list — or just the estimate. Most quotes go back the same business day so your bay is not waiting on a parts hunt.",
  },
  {
    icon: FileText,
    title: "PO and RO references on every job",
    body: "Attach your PO, repair-order, or insurer estimate number to each request. Quotes, orders, and invoices carry the reference straight through.",
  },
  {
    icon: Percent,
    title: "Tiered wholesale pricing",
    body: "Approved accounts are assigned a wholesale tier. Pricing is confirmed on each quote — we never publish invented discount percentages.",
  },
  {
    icon: Truck,
    title: "Local same-day delivery",
    body: "Inside our delivery area, eligible orders can go out same-day. Eligibility depends on parts availability, radius, package size, and courier capacity.",
  },
  {
    icon: BadgeCheck,
    title: "Full OEM part numbers",
    body: "Approved wholesale accounts see complete OEM part numbers on quotes, so your estimators and techs can cross-check before you commit.",
  },
  {
    icon: ShieldCheck,
    title: "Genuine parts, VIN-verified",
    body: "Fitment is checked against the VIN, including build date and option codes, before the quote leaves our desk.",
  },
];

const steps = [
  {
    step: "01",
    title: "Apply for a wholesale account",
    body: "Business details, tax ID, and shipping information. We review applications and follow up if anything needs clarifying.",
  },
  {
    step: "02",
    title: "Submit requests from your dashboard",
    body: "Save shop vehicles and VINs, attach estimates, set urgency, and add your PO/RO reference on each parts request.",
  },
  {
    step: "03",
    title: "Approve and receive",
    body: "We quote with full part numbers and delivery options. Approve, and we order, dispatch, and keep the job history in your account.",
  },
];

function RepairBodyShops() {
  return (
    <>
      <section className="bg-carbon text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <p className="heading-kicker text-primary-glow">For Repair &amp; Body Shops</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[1.05] sm:text-5xl">
            Upload the estimate and the VIN — <span className="text-primary-glow">we build the OEM quote</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-carbon-muted">
            A wholesale sourcing desk for independent BMW repair and collision shops: VIN-verified
            fitment, PO and RO references on every job, tiered wholesale pricing, repeat ordering,
            and local same-day delivery where eligible.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/wholesale/apply"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-blue px-7 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.02]"
            >
              Apply for a Wholesale Account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-carbon-muted/40 px-7 py-4 text-sm font-bold uppercase tracking-wide text-carbon-foreground hover:border-primary-glow"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign In
            </Link>
          </div>
          <p className="mt-4 text-sm text-carbon-muted">
            Already applied?{" "}
            <Link to="/wholesale" className="font-semibold text-primary-glow hover:underline">
              See how wholesale accounts work
            </Link>
            .
          </p>
        </div>
      </section>

      <TrustBadges />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="heading-kicker">Wholesale Benefits</p>
        <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">
          Built for <span className="text-primary">shop workflows</span>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold uppercase tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker">Getting Started</p>
          <h2 className="mt-3 text-3xl font-black uppercase sm:text-4xl">From application to delivery</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.step} className="rounded-xl border border-border bg-card p-6 shadow-card">
                <p className="text-3xl font-black text-primary">{s.step}</p>
                <h3 className="mt-3 text-lg font-extrabold uppercase tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-black uppercase sm:text-4xl">Open a wholesale account</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Applications are reviewed by a person, not a bot. We will confirm your tier and delivery
          options before your first order.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/wholesale/apply"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-blue px-7 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
          >
            Apply for a Wholesale Account
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-7 py-4 text-sm font-bold uppercase tracking-wide hover:border-primary"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Precision Bimmer Parts is an independent parts sourcing service and is not affiliated with,
          endorsed by, or sponsored by BMW AG.
        </p>
      </section>
    </>
  );
}
