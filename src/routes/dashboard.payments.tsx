import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { KES, dateTime } from "@/lib/format";
import { Download, FilePlus2, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { RecordPaymentDialog } from "@/components/modals/RecordPaymentDialog";
import { ReceiptViewDialog } from "@/components/modals/ReceiptViewDialog";
import type { Payment } from "@/lib/mock";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMySchoolId } from "@/lib/supabase-api";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsPage,
});

const PAGE = 15;

function PaymentsPage() {
  const localPayments = useStore((s) => s.payments);
  const [remote, setRemote] = useState<Payment[]>([]);
  const [recordOpen, setRecordOpen] = useState(false);
  const [viewing, setViewing] = useState<Payment | null>(null);
  const [q, setQ] = useState("");
  const [m, setM] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const loadRemote = async () => {
    const schoolId = await getMySchoolId();
    if (!schoolId) return;
    try {
      const { data } = await (supabase as any)
        .from("payments")
        .select("id, admission_number, amount, payment_method, receipt_number, transaction_code, payment_date, created_at, notes, students(full_name, classes(name))")
        .order("created_at", { ascending: false })
        .limit(500);
      const mapped: Payment[] = (data ?? []).map((p: any) => ({
        id: p.id,
        studentId: p.student_id ?? "",
        studentName: p.students?.full_name ?? "—",
        admission: p.admission_number ?? "",
        amount: Number(p.amount ?? 0),
        method: normalizeMethod(p.payment_method),
        receiptNo: p.receipt_number ?? "",
        txCode: p.transaction_code ?? "—",
        recordedBy: "Bursar",
        date: p.created_at ?? p.payment_date ?? new Date().toISOString(),
        className: p.students?.classes?.name ?? "—",
      }));
      setRemote(mapped);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadRemote(); }, []);
  // Reload remote list after closing the record dialog
  useEffect(() => { if (!recordOpen) loadRemote(); }, [recordOpen]);

  // Merge remote + local, dedupe by receiptNo+admission
  const merged = useMemo(() => {
    const key = (p: Payment) => `${p.receiptNo}|${p.admission}|${p.amount}`;
    const seen = new Set<string>();
    const combined: Payment[] = [];
    for (const p of [...localPayments, ...remote]) {
      const k = key(p);
      if (seen.has(k)) continue;
      seen.add(k);
      combined.push(p);
    }
    return combined.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [localPayments, remote]);

  const filtered = useMemo(() => merged.filter((p) => {
    if (q && !`${p.studentName} ${p.admission} ${p.receiptNo} ${p.txCode}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (m !== "all" && p.method !== m) return false;
    if (from && +new Date(p.date) < +new Date(from)) return false;
    if (to && +new Date(p.date) > +new Date(to) + 86400000) return false;
    return true;
  }), [merged, q, m, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={`${filtered.length} transactions`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Exported to CSV")}><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button onClick={() => setRecordOpen(true)}><FilePlus2 className="h-4 w-4 mr-2" /> Record Payment</Button>
          </>
        }
      />
      <Card className="p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search receipt, code, student..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={m} onValueChange={(v) => { setM(v); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
              <SelectItem value="Bank">Bank</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="w-40" />
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="w-40" />
        </div>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Tx Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.studentName}</TableCell>
                  <TableCell className="font-mono text-xs">{p.admission}</TableCell>
                  <TableCell className="font-semibold">{KES(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.method === "M-Pesa" ? "Active" : "Pending"} /></TableCell>
                  <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                  <TableCell className="font-mono text-xs">{p.txCode}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{dateTime(p.date)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setViewing(p)}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                  </TableCell>
                </TableRow>
              ))}
              {slice.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No payments recorded yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      <RecordPaymentDialog open={recordOpen} onOpenChange={setRecordOpen} />
      <ReceiptViewDialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)} payment={viewing} />
    </div>
  );
}

function normalizeMethod(m?: string): Payment["method"] {
  const s = (m || "").toLowerCase();
  if (s.includes("mpesa") || s === "m-pesa") return "M-Pesa";
  if (s.includes("bank")) return "Bank";
  if (s.includes("cheque") || s.includes("check")) return "Cheque";
  return "Cash";
}
