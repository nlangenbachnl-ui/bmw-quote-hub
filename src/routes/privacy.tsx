import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Bavarian Parts Co." },
      {
        name: "description",
        content:
          "How Bavarian Parts Co. collects, uses and protects the information you share when requesting an OEM BMW parts quote.",
      },
      { property: "og:title", content: "Privacy Policy | Bavarian Parts Co." },
      {
        property: "og:description",
        content:
          "How we collect, use and protect the information you share with Bavarian Parts Co.",
      },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="heading-kicker text-primary-glow">Legal</p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-carbon-muted">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p className="rounded-md border border-border bg-secondary/50 p-4 text-foreground">
          This page is maintained by Bavarian Parts Co. to explain how we handle the
          information you share when using this website. It is written in plain
          language and is not legal advice. If you have questions, contact us at{" "}
          <a href="mailto:hello@bavarianpartsco.com" className="text-primary hover:underline">
            hello@bavarianpartsco.com
          </a>
          .
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Information we collect</h2>
          <p>
            When you request a quote, we collect only what we need to identify your
            vehicle and reach you: your name, email, phone number, VIN, BMW model and
            year, optional mileage, your list of requested parts, shipping ZIP code and
            any photos you choose to upload.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">How we use your information</h2>
          <p>
            We use your information solely to verify parts fitment, prepare and send
            your quote, follow up about your request, and — if you place an order —
            fulfill and ship it. We do not sell, rent or share your personal information
            with third parties for marketing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Sharing with service providers</h2>
          <p>
            To operate our business we may share necessary information with trusted
            service providers — for example, shipping carriers to deliver your order or
            email providers to send your quote. These providers are bound to use your
            information only to perform services for us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Data retention</h2>
          <p>
            Quote requests and related communications are retained for as long as
            reasonably necessary to support your order, respond to follow-up questions,
            and meet our tax and accounting obligations. You may ask us to delete your
            information at any time by emailing us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Cookies and analytics</h2>
          <p>
            This site uses a minimal set of first-party cookies required for basic site
            functionality. If we add analytics in the future, this policy will be
            updated to describe them.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Your choices</h2>
          <p>
            You can request access to, correction of, or deletion of the personal
            information you have shared with us by contacting{" "}
            <a href="mailto:hello@bavarianpartsco.com" className="text-primary hover:underline">
              hello@bavarianpartsco.com
            </a>
            . We will respond within a reasonable time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will
            be posted on this page with an updated "Last updated" date.
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
