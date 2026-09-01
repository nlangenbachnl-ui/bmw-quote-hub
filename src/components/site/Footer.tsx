import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-carbon text-carbon-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-blue text-sm font-black text-primary-foreground"
            >
              BP
            </span>
            <span className="text-lg font-extrabold uppercase tracking-tight">
              Precision<span className="text-primary-glow">Bimmer Parts</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-carbon-muted">
            A concierge sourcing service for genuine OEM BMW parts. Send us your VIN and
            parts list — we verify exact fitment and reply with a personalized quote.
          </p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-carbon-muted/80">
            Precision Bimmer Parts is an independent parts sourcing service. We are not
            affiliated with, endorsed by, or sponsored by BMW AG or any of its
            subsidiaries. All trademarks are the property of their respective owners and
            are used for identification purposes only.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-carbon-muted">
            Navigate
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-primary-glow">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary-glow">About</Link></li>
            <li><Link to="/faq" className="hover:text-primary-glow">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-primary-glow">Contact</Link></li>
            <li><Link to="/request-quote" className="hover:text-primary-glow">Request a Quote</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-carbon-muted">
            Legal
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/privacy" className="hover:text-primary-glow">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary-glow">Terms of Service</Link></li>
            <li>
              <a href="mailto:hello@precisionbimmerparts.com" className="hover:text-primary-glow">
                hello@precisionbimmerparts.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-carbon-elevated">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-carbon-muted sm:px-6">
          © {new Date().getFullYear()} Precision Bimmer Parts All rights reserved.
        </p>
      </div>
    </footer>
  );
}
