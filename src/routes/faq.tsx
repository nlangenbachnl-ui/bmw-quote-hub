import { createFileRoute, Link } from "@tanstack/react-router";

const faqs = [
  {
    q: "How does the quote process work?",
    a: "Submit your BMW model, year, VIN and a list of the parts you need through our Request a Quote form. Our specialists verify exact-fit part numbers against your VIN and email you an itemized quote — usually within one business day.",
  },
  {
    q: "Is Precision Bimmer Parts affiliated with BMW?",
    a: "No. We are an independent parts sourcing service and are not affiliated with, endorsed by, or sponsored by BMW AG or any of its subsidiaries. All trademarks are used for identification purposes only.",
  },
  {
    q: "Do I have to pay to get a quote?",
    a: "No. Submitting a quote request is completely free and carries no obligation. You only decide after you have seen the itemized pricing. Online payments are on our roadmap — for now, orders are finalized by email or phone.",
  },
  {
    q: "Where do I find my VIN?",
    a: "Your 17-character VIN is on the driver-side dashboard (visible through the windshield), on the driver-door jamb sticker, and on your registration or insurance documents. Providing it lets us guarantee fitment.",
  },
  {
    q: "Do you sell genuine OEM parts or aftermarket?",
    a: "We source genuine OEM BMW parts and OEM-supplier equivalents — the same manufacturers that supply BMW's factory line for many filters, brakes and cooling components. Where both exist we show both options so you can choose.",
  },
  {
    q: "How long does a quote take?",
    a: "Most quotes go out within 24 hours on business days. Complex or rare-part requests (classic models, M-specific components) can take a little longer — we will keep you posted either way.",
  },
  {
    q: "Can I upload photos of the part I need?",
    a: "Yes — the quote form accepts up to 6 photos. Photos are especially helpful for trim pieces, brackets, or anything you cannot name. A picture of the old part and its surroundings usually gets you a faster, more accurate quote.",
  },
  {
    q: "Do you ship nationwide?",
    a: "Yes, we ship across the United States with tracked, insured carriers. Shipping cost is calculated based on your ZIP code and included in every quote.",
  },
  {
    q: "What about returns and warranties?",
    a: "Because we VIN-verify fitment, wrong-part issues are rare. If we do quote something incorrectly, we cover the return. Parts also carry their manufacturer's standard warranty.",
  },
  {
    q: "Do you handle installation?",
    a: "No — we focus on sourcing. If you need install help, we're happy to recommend independent BMW specialists in most major US markets.",
  },
] as const;

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Answers to common questions about VIN-verified OEM BMW parts quotes, shipping, warranties and how Precision Bimmer Parts works.",
      },
      { property: "og:title", content: "Frequently Asked Questions | Precision Bimmer Parts" },
      {
        property: "og:description",
        content:
          "Common questions about our OEM BMW parts quote process, shipping, and warranties.",
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
          <p className="heading-kicker text-primary-glow">Frequently Asked</p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">
            Questions & Answers
          </h1>
          <p className="mt-4 max-w-xl text-carbon-muted">
            Everything you need to know about quotes, fitment, shipping and how we work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              open={i === 0}
              className="group rounded-lg border border-border bg-card p-5 shadow-card open:shadow-md"
            >
              <summary className="cursor-pointer list-none text-base font-bold">
                <span className="flex items-start justify-between gap-4">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="text-primary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-carbon p-8 text-center text-carbon-foreground sm:p-10">
          <h2 className="text-2xl font-black uppercase">Still have questions?</h2>
          <p className="mx-auto mt-3 max-w-md text-carbon-muted">
            The fastest way to get a real answer is to submit your request — we reply
            personally to every one.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/request-quote"
              className="inline-flex items-center rounded-md bg-gradient-blue px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
            >
              Request a Free Quote
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-md border border-carbon-muted/40 px-6 py-3 text-sm font-bold uppercase tracking-wide text-carbon-foreground hover:border-primary-glow hover:text-primary-glow"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
