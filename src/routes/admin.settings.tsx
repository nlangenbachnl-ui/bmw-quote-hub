import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCutoff, money, percent, WEEK_DAYS } from "@/lib/admin/pricing";
import { resetSettings, updateSettings, useAdminState } from "@/lib/admin/store";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { settings } = useAdminState();

  const exampleAcquisition = 100 * settings.acquisitionMarkup;
  const examplePrice = exampleAcquisition / (1 - Math.min(0.95, settings.targetMargin));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defaults applied to every quote. Individual line prices can still be overridden in the
          quote builder.
        </p>
      </div>

      <section className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <Field
          id="markup"
          label="Acquisition markup"
          hint="Applied to dealer cost. 10% is entered as 10."
          suffix="%"
          value={round((settings.acquisitionMarkup - 1) * 100)}
          onChange={(v) => updateSettings({ acquisitionMarkup: 1 + v / 100 })}
        />
        <Field
          id="margin"
          label="Target gross margin"
          hint="Recommended price = acquisition cost ÷ (1 − target margin)."
          suffix="%"
          value={round(settings.targetMargin * 100)}
          onChange={(v) => updateSettings({ targetMargin: Math.min(95, Math.max(0, v)) / 100 })}
        />
        <Field
          id="proc-pct"
          label="Payment processing rate"
          hint="Percentage assumption per charged transaction."
          suffix="%"
          step={0.1}
          value={round(settings.processingPercent * 100, 2)}
          onChange={(v) => updateSettings({ processingPercent: v / 100 })}
        />
        <Field
          id="proc-fixed"
          label="Payment processing fixed fee"
          hint="Flat per-transaction fee assumption."
          prefix="$"
          step={0.05}
          value={round(settings.processingFixed, 2)}
          onChange={(v) => updateSettings({ processingFixed: Math.max(0, v) })}
        />
        <Field
          id="expiry"
          label="Quote expiration"
          hint="Days a quote stays valid once it is marked ready or sent."
          suffix="days"
          step={1}
          value={settings.quoteExpirationDays}
          onChange={(v) => updateSettings({ quoteExpirationDays: Math.max(1, Math.round(v)) })}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            Example: a {money(100)} dealer-cost part becomes {money(exampleAcquisition)} acquisition
            and a {money(examplePrice)} recommended price at {percent(settings.targetMargin)} margin.
          </p>
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            Restore defaults
          </Button>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider">Delivery</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Applied to commercial quotes and the delivery board. Eligibility is always confirmed by
            the desk before a window is promised.
          </p>
        </div>

        <Field
          id="radius"
          label="Local delivery radius"
          hint="Miles from the fulfilment hub for same-day service."
          suffix="mi"
          step={1}
          value={settings.deliveryRadiusMiles}
          onChange={(v) => updateSettings({ deliveryRadiusMiles: Math.max(0, Math.round(v)) })}
        />
        <Field
          id="same-day-fee"
          label="Local same-day fee"
          hint="Flat fee charged when the order is not over the free threshold."
          prefix="$"
          step={0.05}
          value={round(settings.sameDayFee, 2)}
          onChange={(v) => updateSettings({ sameDayFee: Math.max(0, v) })}
        />
        <Field
          id="free-threshold"
          label="Free same-day threshold"
          hint="Merchandise subtotal at or above which local same-day delivery is free."
          prefix="$"
          step={25}
          value={round(settings.freeSameDayThreshold, 2)}
          onChange={(v) => updateSettings({ freeSameDayThreshold: Math.max(0, v) })}
        />
        <Field
          id="courier-fee"
          label="Priority / oversize courier fee"
          prefix="$"
          hint="Flat fee for priority or oversize courier runs."
          step={0.05}
          value={round(settings.priorityCourierFee, 2)}
          onChange={(v) => updateSettings({ priorityCourierFee: Math.max(0, v) })}
        />

        <div className="grid gap-2 sm:grid-cols-[1fr_12rem] sm:items-center">
          <div>
            <Label htmlFor="cutoff" className="text-sm font-semibold">
              Same-day cutoff
            </Label>
            <p className="text-xs text-muted-foreground">
              Orders confirmed after this local time move to the next delivery day.
            </p>
          </div>
          <Input
            id="cutoff"
            type="time"
            value={settings.sameDayCutoff}
            onChange={(e) => updateSettings({ sameDayCutoff: e.target.value })}
          />
        </div>

        <fieldset className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <legend className="sr-only">Delivery days</legend>
          <div>
            <span className="text-sm font-semibold">Delivery days</span>
            <p className="text-xs text-muted-foreground">Weekdays local same-day delivery runs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const on = settings.deliveryDays.includes(day);
              return (
                <Button
                  key={day}
                  type="button"
                  size="sm"
                  variant={on ? "default" : "outline"}
                  aria-pressed={on}
                  onClick={() =>
                    updateSettings({
                      deliveryDays: on
                        ? settings.deliveryDays.filter((d) => d !== day)
                        : WEEK_DAYS.filter((d) => d === day || settings.deliveryDays.includes(d)),
                    })
                  }
                >
                  {day}
                </Button>
              );
            })}
          </div>
        </fieldset>

        <p className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
          Current same-day terms: {money(settings.sameDayFee)} flat, free at{" "}
          {money(settings.freeSameDayThreshold)}+, cutoff {formatCutoff(settings.sameDayCutoff)},{" "}
          {settings.deliveryDays.join(" · ")}, within {settings.deliveryRadiusMiles} miles.
        </p>
      </section>

      <details className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card">
        <summary className="cursor-pointer text-sm font-bold uppercase tracking-wider">
          Advanced — integrations &amp; API
        </summary>
        <p className="mt-1 text-xs text-muted-foreground">
          Reserved for courier dispatch and mapping/distance APIs. Keys move to server-side secrets
          when the backend is wired up.
        </p>
        <TextField
          id="courier-provider"
          label="Courier provider"
          placeholder="Roadie, Curri, in-house driver…"
          value={settings.courierProvider}
          onChange={(v) => updateSettings({ courierProvider: v })}
        />
        <TextField
          id="distance-provider"
          label="Mapping / distance provider"
          placeholder="Google Distance Matrix, Mapbox…"
          value={settings.distanceProvider}
          onChange={(v) => updateSettings({ distanceProvider: v })}
        />
        <TextField
          id="courier-key"
          label="Courier API key (placeholder)"
          placeholder="Stored as a server secret later"
          value={settings.courierApiKey}
          onChange={(v) => updateSettings({ courierApiKey: v })}
        />
      </details>

      <p className="text-xs text-muted-foreground">
        Settings are stored locally in this prototype. They move to the database — with an audit
        trail and per-user permissions — alongside authentication, email notifications, and Stripe
        checkout.
      </p>
    </div>
  );
}

function round(n: number, digits = 2) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  step = 0.5,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_12rem] sm:items-center">
      <div>
        <Label htmlFor={id} className="text-sm font-semibold">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        {prefix ? <span className="text-sm text-muted-foreground">{prefix}</span> : null}
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={String(value)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix ? <span className="text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_18rem] sm:items-center">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
