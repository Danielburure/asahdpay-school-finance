import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteNav, SiteFooter } from "@/components/site/SiteShell";
import {
  Smartphone, Receipt, MessageSquare, RefreshCw, BarChart3, ShieldCheck,
  Building2, Users, ArrowRight, Check, TrendingUp, CreditCard, Bell, Quote
} from "lucide-react";
import { KES } from "@/lib/format";
import { collectionsByDay, totals } from "@/lib/mock";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AsahdPay — School Fee Management for Kenyan Schools" },
      { name: "description", content: "Automate fee collection, M-Pesa tracking, SMS reminders, receipts and financial reports for Kenyan schools." },
      { property: "og:title", content: "AsahdPay — School Fee Management" },
      { property: "og:description", content: "Modern school finance platform built for Kenya." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Smartphone, title: "M-Pesa Payment Tracking", desc: "Realtime reconciliation of paybill transactions to student accounts." },
  { icon: Receipt, title: "Manual Receipt Recording", desc: "Bursars record bank, cheque and cash payments with audit-ready trails." },
  { icon: MessageSquare, title: "Parent SMS Reminders", desc: "Bulk and targeted reminders with delivery tracking." },
  { icon: RefreshCw, title: "Realtime Balance Updates", desc: "Student balances refresh the moment payment hits." },
  { icon: BarChart3, title: "Financial Reports", desc: "Daily, weekly and term-based collection reports with one click export." },
  { icon: ShieldCheck, title: "Audit Logs", desc: "Every change tracked — who, what, when and the old value." },
  { icon: Building2, title: "Multi-School Support", desc: "Run multiple campuses or branches from one account." },
  { icon: Users, title: "Staff Roles", desc: "Principal, Bursar, Accountant and Viewer roles with granular access." },
];

const steps = [
  { n: "01", title: "Upload students", desc: "Import your roster from Excel in seconds." },
  { n: "02", title: "Parents pay fees", desc: "Via M-Pesa paybill, bank or cash at the bursary." },
  { n: "03", title: "Auto-reconciled", desc: "Payments record against the right student instantly." },
  { n: "04", title: "SMS confirmation", desc: "Parents get a receipt SMS in real time." },
  { n: "05", title: "Reports update", desc: "Dashboards and exports refresh live." },
];

const benefits = [
  "Reduce manual bursary work by 80%",
  "Faster, accurate fee tracking",
  "Better parent communication",
  "Professional financial management",
  "Secure, audit-ready records",
  "Mobile-friendly for staff on the go",
];

const testimonials = [
  { name: "Mr. Otieno", role: "Bursar, Maseno High", quote: "Reconciliation that used to take three days now takes minutes. Parents finally trust our records." },
  { name: "Mrs. Wambui", role: "Principal, Greenfields Academy", quote: "AsahdPay has completely changed how we run finance. The dashboards are a game-changer." },
  { name: "Mr. Kiprop", role: "Accountant, Eldoret Boys", quote: "The SMS reminders alone paid for the system in one term." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Built for Kenyan schools
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                AsahdPay School Fee<br />Management System
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl">
                Automate fee collection, M-Pesa tracking, SMS reminders, receipts and financial reports for Kenyan schools.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/auth">
                  <Button size="lg" className="shadow-[var(--shadow-glow)]">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline">Book Demo</Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> No card required</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Live in 1 day</div>
              </div>
            </div>

            {/* Floating dashboard preview */}
            <div className="relative">
              <Card className="p-5 shadow-[var(--shadow-elegant)] border-border/60 backdrop-blur bg-card/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Collected (Term 2)</p>
                    <p className="text-2xl font-bold">{KES(totals.collected)}</p>
                  </div>
                  <div className="text-success text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> +18.4%
                  </div>
                </div>
                <div className="h-44">
                  <ResponsiveContainer>
                    <AreaChart data={collectionsByDay}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="collected" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="absolute -bottom-6 -left-4 p-4 w-60 shadow-[var(--shadow-elegant)] border-border/60 backdrop-blur bg-card/95">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/15 flex items-center justify-center text-success">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">M-Pesa received</p>
                    <p className="font-semibold">KES 12,500</p>
                    <p className="text-[10px] text-muted-foreground">From Joy Achieng • Form 2A</p>
                  </div>
                </div>
              </Card>

              <Card className="absolute -top-4 -right-4 p-4 w-56 shadow-[var(--shadow-elegant)] border-border/60 backdrop-blur bg-card/95">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SMS sent</p>
                    <p className="font-semibold text-sm">42 reminders delivered</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything finance teams need</h2>
          <p className="mt-3 text-muted-foreground">Powerful, simple tools that replace spreadsheets, paper receipts and WhatsApp groups.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="p-6 hover:shadow-[var(--shadow-elegant)] transition group">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-muted/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">From import to insights in under an hour.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {steps.map((s) => (
              <div key={s.n} className="relative p-6 bg-card rounded-2xl border border-border/60">
                <span className="text-xs font-bold text-primary">{s.n}</span>
                <h4 className="mt-2 font-semibold">{s.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">A finance dashboard you'll actually use</h2>
            <p className="mt-3 text-muted-foreground">Live collections, outstanding balances and class-level breakdowns at a glance.</p>
            <ul className="mt-6 space-y-2.5">
              {["Realtime stat cards","Class & term filters","Export to PDF or Excel","Audit-ready receipts"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success" /> {b}
                </li>
              ))}
            </ul>
            <Link to="/dashboard"><Button className="mt-6">Open the demo dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
          <Card className="p-2 shadow-[var(--shadow-elegant)] border-border/60 overflow-hidden">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 to-background p-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Collected", v: KES(totals.collected) },
                  { l: "Outstanding", v: KES(totals.outstanding) },
                  { l: "Today", v: KES(totals.todayCollections) },
                ].map((s) => (
                  <div key={s.l} className="bg-card rounded-lg p-3 border border-border/60">
                    <p className="text-[10px] text-muted-foreground">{s.l}</p>
                    <p className="font-bold text-sm">{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-44 bg-card rounded-lg p-2 border border-border/60">
                <ResponsiveContainer>
                  <AreaChart data={collectionsByDay}>
                    <defs>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="collected" stroke="var(--color-primary)" fill="url(#g2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Why schools switch to AsahdPay</h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <Card key={b} className="p-5 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <p className="font-medium">{b}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-muted/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">Loved by school finance teams</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="p-6">
                <Quote className="h-6 w-6 text-primary" />
                <p className="mt-3 text-sm leading-relaxed">"{t.quote}"</p>
                <div className="mt-5">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple pricing for every school</h2>
          <p className="mt-3 text-muted-foreground">Pay per term. Cancel anytime.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { name: "Standard", price: "KES 9,500", desc: "For small schools (under 500 students)", features: ["M-Pesa tracking","SMS reminders","Basic reports"] },
            { name: "Pro", price: "KES 19,500", desc: "For growing schools (up to 1,500)", features: ["Everything in Standard","Audit logs","Multi-staff roles","Priority support"], featured: true },
            { name: "Enterprise", price: "Custom", desc: "For large or multi-campus", features: ["Unlimited students","Multi-school","Dedicated success manager"] },
          ].map((p) => (
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

      {/* CONTACT CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
        <Card className="p-10 text-center bg-[var(--gradient-dark)] text-white border-0 shadow-[var(--shadow-elegant)]">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to modernize your bursary?</h2>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">Join schools across Kenya already saving days every term with AsahdPay.</p>
          <div className="mt-7 flex justify-center gap-3 flex-wrap">
            <Link to="/dashboard"><Button size="lg" className="shadow-[var(--shadow-glow)]">Start Free Demo</Button></Link>
            <Link to="/contact"><Button size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white">Talk to Sales</Button></Link>
          </div>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
