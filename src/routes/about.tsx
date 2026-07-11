import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Target, Handshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Bavarian Parts Co." },
      {
        name: "description",
        content:
          "Bavarian Parts Co. is an independent concierge sourcing service for genuine OEM BMW parts. Learn how our VIN-verified quote process works.",
      },
      { property: "og:title", content: "About Us | Bavarian Parts Co." },
      {
        property: "og:description",
        content:
          "Independent concierge sourcing for genuine OEM BMW parts, matched to your VIN.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Target,
    title: "Precision Fitment",
    text: "Every quote starts with your VIN, so the part numbers we quote are the part numbers that fit — no returns, no guesswork.",
  },
  {
    icon: Wrench,
    title: "Enthusiast-Run",
    text: "Our team drives, wrenches on, and races BMWs. We know the difference between a part that works and the part you actually want.",
  },
  {
    icon: Handshake,
    title: "Honest Pricing",
    text: "Transparent, itemized quotes with OEM options laid out clearly. You choose what fits your project and budget.",
  },
] as const;

function AboutPage() {
  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker text-primary-glow">About Bavarian Parts Co.</p>
          <h1 className="mt-3 max-w-2xl text-balance text-4xl font-black uppercase sm:text-5xl">
            Built by BMW people, for BMW people
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-5 leading-relaxed text-muted-foreground">
          <p>
            Bavarian Parts Co. started the way most good garage ideas do — with a
            frustrating parts counter experience. Wrong part numbers, dealership markups,
            and week-long waits for a simple answer. We knew there was a better way to
            get BMW owners the parts they need.
          </p>
          <p>
            Today, we operate as a concierge sourcing service, focused exclusively on
            BMW. Instead of asking you to decode diagrams and cross-reference part
            numbers, you tell us your car and what you need. Our specialists do the
            lookup against your VIN and reply with an exact-fit, itemized quote — usually
            within one business day.
          </p>
          <p>
            We source genuine OEM BMW parts and OEM-supplier equivalents from authorized
            channels, so you can choose the right balance of price and provenance for
            every job — from routine service to a full restoration.
          </p>
          <p className="rounded-md border border-border bg-secondary/50 p-4 text-sm">
            <strong className="text-foreground">Independent, not affiliated.</strong>{" "}
            Bavarian Parts Co. is an independent parts sourcing service. We are not
            affiliated with, endorsed by, or sponsored by BMW AG or any of its
            subsidiaries. Trademarks are used only to identify the vehicles we support.
          </p>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-black uppercase">What We Stand For</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-lg border border-border bg-card p-7 shadow-card">
                <v.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-black uppercase sm:text-3xl">Put us to the test</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Send us your toughest parts request — we love a challenge.
        </p>
        <Link
          to="/request-quote"
          className="mt-6 inline-flex items-center rounded-md bg-gradient-blue px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
        >
          Request a Free Quote
        </Link>
      </section>
    </>
  );
}
