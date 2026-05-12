import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { students, paymentsForStudent, smsMessages } from "@/lib/mock";
import { KES, dateShort, dateTime } from "@/lib/format";
import { ArrowLeft, MessageSquare, FilePlus2, Download, Phone, User, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/dashboard/students/$id")({
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = Route.useParams();
  const s = students.find((x) => x.id === id);
  if (!s) throw notFound();
  const pays = paymentsForStudent(s.id);

  return (
    <div>
      <Link to="/dashboard/students" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to students
      </Link>

      <PageHeader
        title={s.name}
        subtitle={`${s.admission} · ${s.className}`}
        actions={
          <>
            <Link to="/dashboard/sms"><Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Send Reminder</Button></Link>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Receipt</Button>
            <Link to="/dashboard/payments/record"><Button><FilePlus2 className="h-4 w-4 mr-2" /> Record Payment</Button></Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1 space-y-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3"><User className="h-4 w-4" /> Student details</h3>
            <Row label="Name" value={s.name} />
            <Row label="Admission" value={s.admission} />
            <Row label="Class" value={s.className} />
            <Row label="Status" value={<StatusBadge status={s.status} />} />
          </div>
          <hr />
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3"><GraduationCap className="h-4 w-4" /> Parent</h3>
            <Row label="Name" value={s.parentName} />
            <Row label="Phone" value={<span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {s.parentPhone}</span>} />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Balance summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Expected" value={KES(s.expected)} />
            <Stat label="Paid" value={KES(s.paid)} tone="text-success" />
            <Stat label="Balance" value={KES(s.balance)} tone={s.balance > 0 ? "text-destructive" : "text-success"} />
          </div>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-[var(--gradient-primary)]" style={{ width: `${Math.min(100, (s.paid / s.expected) * 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{Math.round((s.paid / s.expected) * 100)}% of fees collected</p>
          </div>

          <Tabs defaultValue="payments" className="mt-6">
            <TabsList>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="sms">SMS history</TabsTrigger>
            </TabsList>
            <TabsContent value="payments" className="mt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Method</TableHead><TableHead>Receipt</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {pays.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No payments yet</TableCell></TableRow>}
                  {pays.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{dateShort(p.date)}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                      <TableCell className="text-right font-semibold">{KES(p.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="receipts" className="mt-4 space-y-2">
              {pays.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-mono text-sm">{p.receiptNo}</p>
                    <p className="text-xs text-muted-foreground">{dateShort(p.date)} · {KES(p.amount)}</p>
                  </div>
                  <Button variant="outline" size="sm"><Download className="h-3 w-3 mr-1" /> PDF</Button>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="sms" className="mt-4 space-y-2">
              {smsMessages.slice(0, 4).map((m) => (
                <div key={m.id} className="p-3 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{m.message}</p>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{dateTime(m.date)}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}
