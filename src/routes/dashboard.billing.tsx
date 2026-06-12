import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Sparkles, CheckCircle2, Download } from "lucide-react";

export const Route = createFileRoute("/dashboard/billing")({
  component: Billing,
});

const invoices = [
  { id: "INV-2025-04", date: "Apr 1, 2025", amount: "KES 19,500", status: "Paid" },
  { id: "INV-2025-01", date: "Jan 1, 2025", amount: "KES 19,500", status: "Paid" },
  { id: "INV-2024-09", date: "Sep 1, 2024", amount: "KES 19,500", status: "Paid" },
  { id: "INV-2024-05", date: "May 1, 2024", amount: "KES 19,500", status: "Paid" },
];

function Billing() {
  return (
    <div>
      <PageHeader title="Billing" subtitle="Subscription, invoices and payment history" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 text-white border-0" style={{ backgroundImage: "var(--gradient-dark)" }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs"><Sparkles className="h-3 w-3 text-primary" /> Pro Plan</span>
              <h2 className="text-3xl font-bold mt-3">KES 19,500<span className="text-sm font-normal text-white/60">/term</span></h2>
              <p className="text-white/60 mt-1 text-sm">Renews on 1 Sep 2025</p>
            </div>
            <StatusBadge status="Active" />
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-2 text-sm">
            {["Up to 1,500 students","Unlimited SMS","Audit logs","Priority support"].map((f) => (
              <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> {f}</li>
            ))}
          </ul>
          <div className="mt-6 flex gap-2">
            <Button>Upgrade plan</Button>
            <Button variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white">Manage billing</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Usage this term</h3>
          <div className="space-y-4">
            <Bar label="Students" used={1260} total={1500} />
            <Bar label="SMS" used={3420} total={5000} />
            <Bar label="Staff seats" used={4} total={10} />
          </div>
        </Card>
      </div>

      <Card className="p-5 mt-6">
        <h3 className="font-semibold mb-3">Invoices</h3>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-mono text-sm">{i.id}</TableCell>
                <TableCell>{i.date}</TableCell>
                <TableCell className="font-semibold">{i.amount}</TableCell>
                <TableCell><StatusBadge status={i.status} /></TableCell>
                <TableCell><Button variant="ghost" size="sm"><Download className="h-3 w-3 mr-1" /> PDF</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
function Bar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = (used / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5"><span>{label}</span><span className="text-muted-foreground">{used.toLocaleString()} / {total.toLocaleString()}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full" style={{ backgroundImage: "var(--gradient-primary)", width: `${pct}%` }} />
      </div>
    </div>
  );
}
