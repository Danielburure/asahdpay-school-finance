import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/SiteShell";
import { Card } from "@/components/ui/card";
import {
  Smartphone, Receipt, MessageSquare, RefreshCw, BarChart3, ShieldCheck,
  Building2, Users
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — AsahdPay" },
      { name: "description", content: "Every feature schools need for fee management." },
    ],
  }),
  component: Features,
});

const items = [
  { icon: Smartphone, title: "M-Pesa Payment Tracking", desc: "Realtime reconciliation of paybill transactions to student accounts." },
  { icon: Receipt, title: "Manual Receipt Recording", desc: "Bursars record bank, cheque and cash payments with audit-ready trails." },
  { icon: MessageSquare, title: "Parent SMS Reminders", desc: "Bulk and targeted reminders with delivery tracking." },
  { icon: RefreshCw, title: "Realtime Balance Updates", desc: "Student balances refresh the moment payment hits." },
  { icon: BarChart3, title: "Financial Reports", desc: "Daily, weekly and term-based collection reports with one-click export." },
  { icon: ShieldCheck, title: "Audit Logs", desc: "Every change tracked — who, what, when and the old value." },
  { icon: Building2, title: "Multi-School Support", desc: "Run multiple campuses or branches from one account." },
  { icon: Users, title: "Staff Roles", desc: "Principal, Bursar, Accountant and Viewer roles." },
];

function Features() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Everything you need</h1>
          <p className="mt-4 text-muted-foreground">A complete platform for school finance teams.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <Card key={f.title} className="p-6 hover:shadow-[var(--shadow-elegant)] transition">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
