import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { KES, dateShort, dateTime } from "@/lib/format";
import { ArrowLeft, MessageSquare, FilePlus2, Download, Phone, User, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/students/$id")({
  component: StudentProfile,
});

function StudentProfile() {
  const { id } = Route.useParams();
  const [student, setStudent] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load student
        const { data: s, error } = await supabase
          .from("students")
          .select("*, classes(name)")
          .eq("id", id)
          .single();
        if (error || !s) throw notFound();
        setStudent(s);

        // Load payments
        const { data: pays } = await supabase
          .from("payments")
          .select("*")
          .eq("student_id", id)
          .eq("is_reversed", false)
          .order("payment_date", { ascending: false });
        setPayments(pays ?? []);

        // Load receipts
        const { data: recs } = await supabase
          .from("receipts")
          .select("*")
          .eq("student_id", id)
          .order("created_at", { ascending: false });
        setReceipts(recs ?? []);
      } catch (e) {
        throw notFound();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  if (!student) throw notFound();

  const balance = student.balance ?? 0;
  const paid = student.total_paid ?? 0;
  const expected = student.term_fee ?? 0;
  const pct = expected > 0 ? Math.min(100, Math.round((paid / expected) * 100)) : 0;
  const className = student.classes?.name ?? "—";
  const status = balance === 0 ? "Paid" : balance > 30000 ? "Overdue" : "Partial";

  return (
    <div>
      <Link to="/dashboard/students" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to students
      </Link>

      <PageHeader
        title={student.full_name}
        subtitle={`${student.admission_number} · ${className}`}
        actions={
          <>
            <Link to="/dashboard/sms"><Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Send Reminder</Button></Link>
            <Button variant="outline" onClick={() => toast.info("Receipt download coming soon")}><Download className="h-4 w-4 mr-2" /> Receipt</Button>
            <Link to="/dashboard/payments/record"><Button><FilePlus2 className="h-4 w-4 mr-2" /> Record Payment</Button></Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1 space-y-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3"><User className="h-4 w-4" /> Student details</h3>
            <Row label="Name" value={student.full_name} />
            <Row label="Admission" value={student.admission_number} />
            <Row label="Class" value={className} />
            <Row label="Status" value={<StatusBadge status={status} />} />
          </div>
          <hr />
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3"><GraduationCap className="h-4 w-4" /> Parent</h3>
            <Row label="Name" value={student.parent_name ?? "—"} />
            <Row label="Phone" value={<span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {student.parent_phone ?? "—"}</span>} />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Balance summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Expected" value={KES(expected)} />
            <Stat label="Paid" value={KES(paid)} tone="text-success" />
            <Stat label="Balance" value={KES(balance)} tone={balance > 0 ? "text-destructive" : "text-success"} />
          </div>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{pct}% of fees collected</p>
          </div>

          <Tabs defaultValue="payments" className="mt-6">
            <TabsList>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
            </TabsList>
            <TabsContent value="payments" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No payments yet</TableCell></TableRow>
                  )}
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{dateShort(p.payment_date)}</TableCell>
                      <TableCell className="capitalize">{p.payment_method}</TableCell>
                      <TableCell className="font-mono text-xs">{p.receipt_number ?? "—"}</TableCell>
                      <TableCell className="text-right font-semibold">{KES(p.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="receipts" className="mt-4 space-y-2">
              {receipts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No receipts yet</p>
              )}
              {receipts.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-mono text-sm">{r.receipt_number}</p>
                    <p className="text-xs text-muted-foreground">{dateShort(r.payment_date)} · {KES(r.amount)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.info("PDF download coming soon")}>
                    <Download className="h-3 w-3 mr-1" /> PDF
                  </Button>
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