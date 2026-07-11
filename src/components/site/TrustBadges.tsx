import { ShieldCheck, Truck, BadgeCheck, Clock } from "lucide-react";

const badges = [
  {
    icon: BadgeCheck,
    title: "Genuine OEM Parts",
    text: "Sourced from OEM manufacturers and authorized channels — no mystery aftermarket.",
  },
  {
    icon: ShieldCheck,
    title: "VIN-Verified Fitment",
    text: "Every part number is cross-checked against your VIN before you see the quote.",
  },
  {
    icon: Clock,
    title: "Fast Response",
    text: "Most quotes are returned within one business day, often the same afternoon.",
  },
  {
    icon: Truck,
    title: "Nationwide Shipping",
    text: "Tracked delivery to all 50 states with insured, careful packaging.",
  },
] as const;

export function TrustBadges() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((b) => (
        <li
          key={b.title}
          className="rounded-lg border border-border bg-card p-5 shadow-card"
        >
          <b.icon className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="mt-3 text-sm font-bold uppercase tracking-wide">{b.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
        </li>
      ))}
    </ul>
  );
}
