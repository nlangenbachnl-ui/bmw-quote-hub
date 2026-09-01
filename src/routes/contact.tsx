import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Precision Bimmer Parts" },
      {
        name: "description",
        content:
          "Reach the Precision Bimmer Parts team by email or phone, or submit a free VIN-verified parts quote request online.",
      },
      { property: "og:title", content: "Contact Us | Precision Bimmer Parts" },
      {
        property: "og:description",
        content: "Reach the Precision Bimmer Parts team by phone, email, or online quote request.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const details = [
  {
    icon: Mail,
    title: "Email",
    lines: ["hello@precisionbimmerparts.com"],
    href: "mailto:hello@precisionbimmerparts.com",
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["(555) 123-4567"],
    href: "tel:+15551234567",
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["Mon–Fri: 8am – 6pm PT", "Sat: 9am – 1pm PT"],
  },
  {
    icon: MapPin,
    title: "Service Area",
    lines: ["Nationwide shipping", "across the United States"],
  },
] as const;

function ContactPage() {
  return (
    <>
      <section className="bg-gradient-hero text-carbon-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="heading-kicker text-primary-glow">Get in Touch</p>
          <h1 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Contact Us</h1>
          <p className="mt-4 max-w-xl text-carbon-muted">
            Questions about a part, an existing quote, or an order? We're quick on email
            and even quicker on the phone.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((d) => (
            <li key={d.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
              <d.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-bold uppercase tracking-wide">{d.title}</h2>
              {d.lines.map((line) =>
                "href" in d && d.href ? (
                  <a
                    key={line}
                    href={d.href}
                    className="mt-1.5 block text-sm font-semibold text-primary hover:underline"
                  >
                    {line}
                  </a>
                ) : (
                  <p key={line} className="mt-1.5 text-sm text-muted-foreground">
                    {line}
                  </p>
                ),
              )}
            </li>
          ))}
        </ul>

        <div className="mt-12 rounded-lg bg-carbon p-8 text-center text-carbon-foreground sm:p-12">
          <h2 className="text-2xl font-black uppercase sm:text-3xl">
            Need a price on parts?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-carbon-muted">
            The fastest way to get pricing is the quote form — it captures everything
            our specialists need in one go.
          </p>
          <Link
            to="/request-quote"
            className="mt-6 inline-flex items-center rounded-md bg-gradient-blue px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-blue transition-transform hover:scale-[1.03]"
          >
            Request a Free Quote
          </Link>
        </div>
      </section>
    </>
  );
}
