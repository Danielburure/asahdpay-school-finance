import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/SiteShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — AsahdPay" },
      { name: "description", content: "Simple per-term pricing for schools of every size." },
    ],
  }),
  component: Pricing,
});

const plans = [
  { name: "Standard", price: "KES 9,500", desc: "For small schools under 500 students", features: ["M-Pesa tracking","SMS reminders","Basic reports","Up to 3 staff"] },
  { name: "Pro", price: "KES 19,500", desc: "For growing schools up to 1,500 students", features: ["Everything in Standard","Audit logs","Multi-staff roles","Priority support","Advanced reports"], featured: true },
  { name: "Enterprise", price: "Custom", desc: "Multi-campus or 1,500+ students", features: ["Unlimited students","Multi-school","Dedicated success manager","Custom integrations"] },
];

function Pricing() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Simple, fair pricing</h1>
          <p className="mt-4 text-muted-foreground">Pay per term. Cancel anytime. No hidden fees.</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((p) => (
            <Card key={p.name} className={`p-6 ${p.featured ? "ring-2 ring-primary shadow-[var(--shadow-elegant)]" : ""}`}>
              {p.featured && <span className="text-xs font-semibold text-primary">MOST POPULAR</span>}
              <h3 className="mt-1 font-semibold text-lg">{p.name}</h3>
              <p className="mt-3 text-3xl font-bold">{p.price}<span className="text-sm font-normal text-muted-foreground">/term</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="text-sm flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {f}</li>
                ))}
              </ul>
              <Link to="/dashboard"><Button className="w-full mt-6" variant={p.featured ? "default" : "outline"}>Start Demo</Button></Link>
            </Card>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
