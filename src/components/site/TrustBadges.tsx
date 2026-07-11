import { ShieldCheck, Truck, BadgeCheck, Clock } from "lucide-react";

const badges = [
  {
    icon: BadgeCheck,
    title: "Genuine & OEM Only",
    text: "Every part matched to your VIN for guaranteed fitment.",
  },
  {
    icon: Clock,
    title: "Quotes in 24h",
    text: "Most requests answered within one business day.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    text: "Your details are encrypted and never shared.",
  },
  {
    icon: Truck,
    title: "Nationwide Shipping",
    text: "Fast, tracked delivery on every order.",
  },
] as const;

export function TrustBadges() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((b) => (
        <div
          key={b.title}
          className="rounded-lg border border-border bg-card p-5 shadow-card"
        >
          <b.icon className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-bold uppercase tracking-wide">{b.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
        </div>
      ))}
    </div>
  );
}
