import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Banknote, FileBarChart, Users, MessageSquare, Download, FilePlus2 } from "lucide-react";
import { collectionsByDay, classCollections } from "@/lib/mock";
import { KES } from "@/lib/format";
import { useState } from "react";
import { useStore, useTotals } from "@/lib/store";
import { GenerateReportDialog } from "@/components/modals/GenerateReportDialog";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard/reports")({
  component: Reports,
});

function Reports() {
  const sms = useStore((s) => s.sms);
  const totals = useTotals();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Daily, weekly, term and class-level financial reports"
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("PDF exported")}><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
            <Button variant="outline" onClick={() => toast.success("Excel exported")}><Download className="h-4 w-4 mr-2" /> Export Excel</Button>
            <Button onClick={() => setOpen(true)}><FilePlus2 className="h-4 w-4 mr-2" /> Generate Report</Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's collections" value={KES(totals.todayCollections)} icon={Banknote} accent="success" />
        <StatCard label="Weekly collections" value={KES(totals.collected / 12)} icon={FileBarChart} />
        <StatCard label="Term collections" value={KES(totals.collected)} icon={FileBarChart} accent="success" />
        <StatCard label="Outstanding balances" value={KES(totals.outstanding)} icon={Users} accent="destructive" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Daily collections trend</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={collectionsByDay}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(v: number) => KES(v)} />
                <Area type="monotone" dataKey="collected" stroke="var(--color-primary)" fill="url(#rg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Class summaries</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={classCollections}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="class" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(v: number) => KES(v)} />
                <Legend />
                <Bar dataKey="collected" fill="var(--color-chart-1)" radius={[6,6,0,0]} />
                <Bar dataKey="outstanding" fill="var(--color-chart-3)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 mt-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> SMS reports</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Sent total" value={String(sms.length)} />
          <Stat label="Delivered" value={String(sms.filter((m) => m.status === "Delivered").length)} tone="text-success" />
          <Stat label="Failed" value={String(sms.filter((m) => m.status === "Failed").length)} tone="text-destructive" />
        </div>
      </Card>

      <GenerateReportDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}
