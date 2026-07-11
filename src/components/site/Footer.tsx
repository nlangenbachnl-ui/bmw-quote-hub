import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-carbon text-carbon-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-blue text-sm font-black text-primary-foreground">
              BP
            </span>
            <span className="text-lg font-extrabold uppercase tracking-tight">
              Bavarian<span className="text-primary-glow">Parts</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-carbon-muted">
            Genuine and OEM BMW parts, quoted fast. Submit your VIN and parts list — our
            specialists reply with an exact-fit quote, usually within one business day.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-carbon-muted">
            Navigate
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-primary-glow">Home</Link></li>
            <li><Link to="/about" className="hover:text-primary-glow">About</Link></li>
            <li><Link to="/faq" className="hover:text-primary-glow">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-primary-glow">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-carbon-muted">
            Get a Quote
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/request-quote" className="hover:text-primary-glow">Request a Quote</Link></li>
            <li><a href="mailto:quotes@bavarianparts.example" className="hover:text-primary-glow">quotes@bavarianparts.example</a></li>
            <li><a href="tel:+15551234567" className="hover:text-primary-glow">(555) 123-4567</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-carbon-elevated">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-carbon-muted sm:px-6">
          © {new Date().getFullYear()} BavarianParts. Independent parts supplier — not affiliated
          with BMW AG. BMW is a registered trademark of BMW AG.
        </p>
      </div>
    </footer>
  );
}
