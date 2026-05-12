import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { schools, collectionsByDay } from "@/lib/mock";
import { KES, num } from "@/lib/format";
import { Building2, Users, Banknote, AlertTriangle, MessageSquare, Activity, ArrowLeft, Sparkles } from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Super Admin — AsahdPay" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const totalStudents = schools.reduce((a, s) => a + s.students, 0);
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="h-16 border-b bg-background flex items-center px-6 gap-4">
        <div className="h-8 w-8 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
        <span className="font-bold">AsahdPay <span className="text-primary">Admin</span></span>
        <div className="flex-1" />
        <Link to="/dashboard"><Button variant="outline" size="sm">Tenant View</Button></Link>
        <Link to="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Button></Link>
      </header>

      <main className="p-6 lg:p-8 max-w-7xl mx-auto">
        <PageHeader title="Super Admin Dashboard" subtitle="Manage every school, plan and subscription" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total schools" value={`${schools.length}`} icon={Building2} />
          <StatCard label="Active schools" value={`${schools.filter(s => s.status === "Active").length}`} icon={Activity} accent="success" />
          <StatCard label="Overdue schools" value={`${schools.filter(s => s.status === "Overdue").length}`} icon={AlertTriangle} accent="destructive" />
          <StatCard label="Total students" value={num(totalStudents)} icon={Users} />
          <StatCard label="MRR" value={KES(840000)} delta="+12.4%" icon={Banknote} accent="success" />
          <StatCard label="SMS this month" value="48,210" icon={MessageSquare} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-semibold mb-3">Platform revenue (14 days)</h3>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={collectionsByDay}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip formatter={(v: number) => KES(v)} />
                  <Area type="monotone" dataKey="collected" stroke="var(--color-primary)" fill="url(#ag)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold mb-4">System health</h3>
            <div className="space-y-3">
              {[
                { l: "API", v: "99.98%", s: "Active" },
                { l: "M-Pesa Integration", v: "100%", s: "Active" },
                { l: "SMS Gateway", v: "99.4%", s: "Active" },
                { l: "Database", v: "Healthy", s: "Active" },
              ].map((x) => (
                <div key={x.l} className="flex items-center justify-between">
                  <span className="text-sm">{x.l}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{x.v}</span>
                    <StatusBadge status={x.s} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Schools</h3>
            <Button>Add School</Button>
          </div>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>School name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.plan}</TableCell>
                  <TableCell>{num(s.students)}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell><StatusBadge status={s.subscription} /></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}
