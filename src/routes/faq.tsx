import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does the quote process work?",
    a: "Submit your BMW model, year, VIN and a list of the parts you need through our Request a Quote form. Our specialists verify exact-fit part numbers against your VIN and email you an itemized quote — usually within one business day.",
  },
  {
    q: "Do I have to pay when I submit a request?",
    a: "No. Submitting a quote request is completely free and carries no obligation. You only decide after you've seen the itemized pricing. Online payment options are coming soon — for now, orders are finalized by email or phone.",
  },
  {
    q: "Where do I find my VIN?",
    a: "Your 17-character VIN is on the driver-side dashboard (visible through the windshield), on the driver-door jamb sticker, and on your registration or insurance documents. Providing it lets us guarantee fitment.",
  },
  {
    q: "Do you sell genuine BMW parts or aftermarket?",
    a: "We quote genuine BMW parts and OEM-supplier equivalents — the same manufacturers that supply BMW's factory line (e.g., for filters, brakes, and cooling components). Where both exist, we show both options so you can choose.",
  },
  {
    q: "How long does a quote take?",
    a: "Most quotes go out within 24 hours on business days. Complex or rare-part requests (classic models, M-specific components) can take a little longer — we'll keep you posted either way.",
  },
  {
    q: "Can I upload photos of the part I need?",
    a: "Yes — the quote form accepts up to 6 photos. Photos are especially helpful for trim pieces, brackets, or anything you can't name. A picture of the old part and its surroundings usually gets you a faster, more accurate quote.",
  },
  {
    q: "Do you ship nationwide?",
    a: "Yes, we ship across the country with tracked carriers. Shipping cost and estimated delivery time are included in your quote so there are no surprises.",
  },
  {
    q: "What models do you cover?",
    a: "All of them — from classic E-chassis cars to the latest G-series, plus the full X, Z, M, and i ranges. If BMW built it, we can source parts for it.",
  },
] as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — BMW Parts Quotes | BavarianParts" },
      {
        name: "description",
        content:
          "Answers about our BMW parts quote process: turnaround time, VIN lookup, genuine vs OEM parts, photo uploads, and shipping.",
      },
      { property: "og:title", content: "FAQ — BMW Parts Quotes | BavarianParts" },
      {
        property: "og:description",
        content: "Answers about quotes, VIN lookup, genuine vs OEM parts, and shipping.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker text-primary-glow">Good to Know</p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
            Frequently Asked Questions
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-lg border border-border bg-card shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-bold">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-secondary p-8 text-center">
          <h2 className="text-xl font-black uppercase">Still have questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We're happy to help — reach out or just start a quote request.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-input px-5 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-accent"
            >
              Contact Us
            </Link>
            <Link
              to="/request-quote"
              className="inline-flex items-center rounded-md bg-gradient-blue px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
