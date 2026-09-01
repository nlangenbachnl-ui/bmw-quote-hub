import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateShop, useAdminState, type CommercialAccount } from "@/lib/admin/store";
import { usePortalSession } from "@/lib/portal/session";

export const Route = createFileRoute("/portal/profile")({
  component: ShopProfile,
});

function ShopProfile() {
  const shopId = usePortalSession();
  const { shops } = useAdminState();
  const shop = shops.find((s) => s.id === shopId);

  if (!shop) return null;

  const patch = (p: Partial<CommercialAccount>) => updateShop(shop.id, p);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Shop profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Used on every quote, order, and delivery run. Changes save as you type.
          </p>
        </div>
        <Badge className="border-transparent bg-primary/10 text-primary">{shop.status}</Badge>
      </div>

      <section className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:grid-cols-2">
        <h2 className="sr-only">Account details</h2>
        <Text id="shopName" label="Shop name" value={shop.shopName} onChange={(v) => patch({ shopName: v })} />
        <Text id="contactName" label="Contact name" value={shop.contactName} onChange={(v) => patch({ contactName: v })} />
        <Text id="email" label="Email" type="email" value={shop.email} onChange={(v) => patch({ email: v })} />
        <Text id="phone" label="Phone" type="tel" value={shop.phone} onChange={(v) => patch({ phone: v })} />
        <div>
          <Label htmlFor="preferredContact">Preferred contact method</Label>
          <Select
            value={shop.preferredContact}
            onValueChange={(v) => patch({ preferredContact: v as CommercialAccount["preferredContact"] })}
          >
            <SelectTrigger id="preferredContact" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Email", "Phone", "Text"] as const).map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="resaleStatus">Resale / tax-exempt certificate</Label>
          <Select
            value={shop.resaleStatus}
            onValueChange={(v) => patch({ resaleStatus: v as CommercialAccount["resaleStatus"] })}
          >
            <SelectTrigger id="resaleStatus" className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["On file", "Pending", "Not provided"] as const).map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            Certificate upload and verification arrive with the backend.
          </p>
        </div>
        <Text
          id="resaleCertNumber"
          label="Certificate number"
          value={shop.resaleCertNumber}
          onChange={(v) => patch({ resaleCertNumber: v })}
        />
      </section>

      <section className="grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-bold uppercase tracking-wider">Addresses &amp; receiving</h2>
        <div>
          <Label htmlFor="billingAddress">Billing address</Label>
          <Textarea
            id="billingAddress"
            className="mt-2"
            value={shop.billingAddress}
            onChange={(e) => patch({ billingAddress: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="deliveryAddress">Delivery address</Label>
          <Textarea
            id="deliveryAddress"
            className="mt-2"
            value={shop.deliveryAddress}
            onChange={(e) => patch({ deliveryAddress: e.target.value })}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Same-day eligibility is checked against this address.
          </p>
        </div>
        <Text
          id="receivingHours"
          label="Receiving hours"
          value={shop.receivingHours}
          onChange={(v) => patch({ receivingHours: v })}
        />
        <div>
          <Label htmlFor="deliveryInstructions">Default delivery instructions</Label>
          <Textarea
            id="deliveryInstructions"
            className="mt-2"
            value={shop.deliveryInstructions}
            onChange={(e) => patch({ deliveryInstructions: e.target.value })}
          />
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        Profile data is stored locally in this prototype. It moves to the database with real shop
        logins, user invitations, and audit history.
      </p>
    </div>
  );
}

function Text({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} className="mt-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
