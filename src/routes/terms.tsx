import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Terms that govern your use of the Precision Bimmer Parts website and quote sourcing service.",
      },
      { property: "og:title", content: "Terms of Service | Precision Bimmer Parts" },
      {
        property: "og:description",
        content: "Terms that govern your use of the Precision Bimmer Parts website and service.",
      },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="heading-kicker text-primary-glow">Legal</p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-carbon-muted">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p className="rounded-md border border-border bg-secondary/50 p-4 text-foreground">
          These Terms explain how you may use the Precision Bimmer Parts website and
          concierge parts sourcing service. Please read them before submitting a quote
          request. They are provided for general information and are not legal advice.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">1. Independent business</h2>
          <p>
            Precision Bimmer Parts is an independent parts sourcing service. We are not
            affiliated with, endorsed by, or sponsored by BMW AG or any of its
            subsidiaries. Trademarks referenced on this site are the property of their
            respective owners and are used only to identify the vehicles we support.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">2. Quotes and pricing</h2>
          <p>
            A quote is an offer to sell specified parts at the stated price, subject to
            availability and reasonable time limits noted in the quote. Prices and
            availability may change without notice. Quotes do not constitute a
            reservation of inventory until you confirm the order in writing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">3. VIN verification</h2>
          <p>
            We verify fitment based on the VIN you provide. If the VIN is incorrect,
            incomplete, or does not correspond to the vehicle described, we cannot
            guarantee fitment. Please double-check your VIN before submitting.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">4. Orders, shipping and risk of loss</h2>
          <p>
            Orders are confirmed by email and paid for using the methods described in
            your quote. We ship via insured, tracked carriers. Risk of loss passes to
            you upon delivery. If a shipment arrives damaged, contact us within a
            reasonable time so we can assist with a carrier claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">5. Returns and warranties</h2>
          <p>
            If we quote a part incorrectly for your VIN, we cover the return. Otherwise
            returns are considered on a case-by-case basis and may be subject to a
            restocking fee for special-order parts. Parts carry only the manufacturer's
            standard warranty; we make no additional warranty, express or implied.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">6. Acceptable use</h2>
          <p>
            You agree to use this website lawfully and not to submit misleading
            information, attempt to interfere with the site's operation, or use it for
            any purpose other than a genuine parts inquiry.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">7. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Precision Bimmer Parts is not liable
            for indirect, incidental, or consequential damages arising from your use of
            this site or of parts we source. Our total liability for any claim is
            limited to the amount you paid for the specific part at issue.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">8. Changes and contact</h2>
          <p>
            We may update these Terms from time to time. The "Last updated" date above
            reflects the current version. Questions? Email{" "}
            <a href="mailto:hello@precisionbimmerparts.com" className="text-primary hover:underline">
              hello@precisionbimmerparts.com
            </a>
            .
          </p>
        </section>

        <div className="pt-4">
          <Link
            to="/request-quote"
            className="inline-flex items-center rounded-md bg-gradient-blue px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue hover:scale-[1.02]"
          >
            Back to quote request
          </Link>
        </div>
      </article>
    </>
  );
}
