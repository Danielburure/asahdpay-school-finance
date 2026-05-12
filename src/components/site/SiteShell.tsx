import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">AsahdPay</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition">Home</Link>
          <Link to="/features" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition">Features</Link>
          <Link to="/pricing" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition">Pricing</Link>
          <Link to="/contact" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard"><Button variant="ghost" size="sm">Demo Login</Button></Link>
          <Link to="/dashboard"><Button size="sm" className="shadow-[var(--shadow-glow)]">Start Demo</Button></Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold">AsahdPay</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">School fee management built for Kenyan schools.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Demo</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><a className="hover:text-foreground" href="#">Help Center</a></li>
            <li><a className="hover:text-foreground" href="#">System Status</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a className="hover:text-foreground" href="#">Privacy</a></li>
            <li><a className="hover:text-foreground" href="#">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AsahdPay. All rights reserved.
      </div>
    </footer>
  );
}
