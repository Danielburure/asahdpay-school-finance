import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { KES, dateShort } from "@/lib/format";
import { Download, Printer, MessageSquare, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { ReceiptViewDialog } from "@/components/modals/ReceiptViewDialog";
import type { Payment } from "@/lib/mock";

export const Route = createFileRoute("/dashboard/receipts")({
  component: Receipts,
});

function Receipts() {
  const payments = useStore((s) => s.payments);
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<Payment | null>(null);

  const filtered = useMemo(
    () => payments.filter((p) => !q || `${p.studentName} ${p.admission} ${p.receiptNo}`.toLowerCase().includes(q.toLowerCase())),
    [payments, q],
  );

  const printOne = (p: Payment) => {
    const html = `<!doctype html><html><head><title>${p.receiptNo}</title>
    <style>body{font-family:system-ui;padding:40px;max-width:480px;margin:auto}
    h1{text-align:center;margin:0}.muted{color:#666;font-size:12px}
    .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee}
    .amt{font-size:28px;font-weight:bold;text-align:right;margin-top:16px}
    .center{text-align:center}hr{border:none;border-top:1px solid #ddd;margin:16px 0}</style></head>
    <body><div class="center"><h1>Mang'u High School</h1><p class="muted">P.O. Box 1, Thika · Paybill 522533</p>
    <p class="muted">OFFICIAL RECEIPT</p><h2 style="font-family:monospace">${p.receiptNo}</h2></div><hr/>
    <div class="row"><span>Student</span><b>${p.studentName}</b></div>
    <div class="row"><span>Admission</span><b>${p.admission}</b></div>
    <div class="row"><span>Class</span><b>${p.className}</b></div>
    <div class="row"><span>Date</span><b>${dateShort(p.date)}</b></div>
    <div class="row"><span>Method</span><b>${p.method}</b></div>
    <div class="row"><span>Tx Code</span><b>${p.txCode}</b></div>
    <div class="amt">${KES(p.amount)}</div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}</script></body></html>`;
    const w = window.open("", "_blank", "width=520,height=720");
    if (w) { w.document.write(html); w.document.close(); }
    else toast.error("Pop-up blocked");
  };

  return (
    <div>
      <PageHeader title="Receipts" subtitle="View, print or resend any receipt" />
      <Card className="p-5">
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search receipts..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Receipt #</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 30).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                <TableCell>{p.studentName}<div className="text-xs text-muted-foreground">{p.admission}</div></TableCell>
                <TableCell className="font-semibold">{KES(p.amount)}</TableCell>
                <TableCell>{p.method}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dateShort(p.date)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => setViewing(p)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("PDF downloaded")}><Download className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => printOne(p)}><Printer className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("SMS resent")}><MessageSquare className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ReceiptViewDialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)} payment={viewing} />
    </div>
  );
}
