import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Banknote, Wallet, AlertTriangle, Users, TrendingUp, ArrowRight, Activity, Calendar
} from "lucide-react";
import { collectionsByDay, classCollections, methodBreakdown } from "@/lib/mock";
import { useStore, useTotals } from "@/lib/store";
import { useState } from "react";
import { RecordPaymentDialog } from "@/components/modals/RecordPaymentDialog";
import { KES, dateTime } from "@/lib/format";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const chartColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-5)"];

function DashboardHome() {
  const students = useStore((s) => s.students);
  const payments = useStore((s) => s.payments);
  const school = useStore((s) => s.schoolProfile);
  const totals = useTotals();
  const [recordOpen, setRecordOpen] = useState(false);
  const overdue = students.filter((s) => s.status === "Overdue").slice(0, 6);
  const recent = payments.slice(0, 6);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${school.name} 👋`}
        subtitle="Here's what's happening with fee collection today."
        actions={
          <>
            <Button variant="outline"><Calendar className="h-4 w-4 mr-2" /> Term 2, 2025</Button>
            <Button onClick={() => setRecordOpen(true)}>Record Payment</Button>
          </>
        }
      />
      <RecordPaymentDialog open={recordOpen} onOpenChange={setRecordOpen} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Expected Fees" value={KES(totals.expected)} icon={Wallet} />
        <StatCard label="Total Collected" value={KES(totals.collected)} delta="+18.4% vs last term" trend="up" icon={Banknote} accent="success" />
        <StatCard label="Outstanding" value={KES(totals.outstanding)} delta="-4.2% vs last week" trend="down" icon={AlertTriangle} accent="destructive" />
        <StatCard label="Students" value={`${totals.studentCount}`} icon={Users} accent="warning" />
        <StatCard label="Today's Collections" value={KES(totals.todayCollections)} delta="updated live" icon={TrendingUp} accent="success" />
        <StatCard label="Unmatched Payments" value={`${totals.unmatched}`} delta="needs review" trend="neutral" icon={Activity} accent="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Collections — last 14 days</h3>
              <p className="text-xs text-muted-foreground">Daily collected vs expected</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={collectionsByDay}>
                <defs>
                  <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(v: number) => KES(v)} />
                <Area type="monotone" dataKey="collected" stroke="var(--color-primary)" fill="url(#dg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Payment methods</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={methodBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {methodBreakdown.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Class collections breakdown</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={classCollections}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="class" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(v: number) => KES(v)} />
                <Legend />
                <Bar dataKey="collected" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="outstanding" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Activity feed</h3>
          <div className="space-y-4">
            {recent.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-success/15 text-success flex items-center justify-center text-xs font-bold">
                  {p.method.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.studentName}</p>
                  <p className="text-xs text-muted-foreground">{KES(p.amount)} · {p.method}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{dateTime(p.date)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent payments</h3>
            <Link to="/dashboard/payments"><Button variant="ghost" size="sm">View all <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.studentName}</div>
                    <div className="text-xs text-muted-foreground">{p.admission} · {p.className}</div>
                  </TableCell>
                  <TableCell className="font-semibold">{KES(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.method === "M-Pesa" ? "Active" : "Pending"} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{dateTime(p.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Overdue balances</h3>
            <Link to="/dashboard/students"><Button variant="ghost" size="sm">All</Button></Link>
          </div>
          <div className="space-y-3">
            {overdue.map((s) => (
              <Link key={s.id} to="/dashboard/students/$id" params={{ id: s.id }} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.admission} · {s.className}</p>
                </div>
                <span className="text-sm font-bold text-destructive">{KES(s.balance)}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
