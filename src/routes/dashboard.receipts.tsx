import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { payments } from "@/lib/mock";
import { KES, dateShort } from "@/lib/format";
import { Download, Printer, MessageSquare, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/receipts")({
  component: Receipts,
});

function Receipts() {
  return (
    <div>
      <PageHeader title="Receipts" subtitle="View, download, print or resend any receipt" />
      <Card className="p-5">
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
            {payments.slice(0, 20).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                <TableCell>{p.studentName}<div className="text-xs text-muted-foreground">{p.admission}</div></TableCell>
                <TableCell className="font-semibold">{KES(p.amount)}</TableCell>
                <TableCell>{p.method}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dateShort(p.date)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Dialog>
                    <DialogTrigger asChild><Button size="sm" variant="outline"><Eye className="h-3 w-3" /></Button></DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader><DialogTitle>Official Receipt</DialogTitle></DialogHeader>
                      <ReceiptCard p={p} />
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" variant="outline" onClick={() => toast.success("PDF downloaded")}><Download className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Sending to printer")}><Printer className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("SMS resent")}><MessageSquare className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function ReceiptCard({ p }: { p: typeof payments[number] }) {
  return (
    <div className="rounded-lg border-2 border-dashed p-5 bg-card">
      <div className="text-center border-b pb-3">
        <div className="font-bold text-lg">Mang'u High School</div>
        <div className="text-xs text-muted-foreground">P.O. Box 1, Thika · Paybill 522533</div>
      </div>
      <div className="text-center my-3">
        <div className="text-xs text-muted-foreground">OFFICIAL RECEIPT</div>
        <div className="font-mono font-bold">{p.receiptNo}</div>
      </div>
      <div className="space-y-1.5 text-sm">
        <Row k="Student" v={p.studentName} />
        <Row k="Admission" v={p.admission} />
        <Row k="Class" v={p.className} />
        <Row k="Date" v={dateShort(p.date)} />
        <Row k="Method" v={p.method} />
        <Row k="Tx Code" v={p.txCode} />
        <Row k="Recorded By" v={p.recordedBy} />
      </div>
      <div className="mt-4 pt-3 border-t flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Amount Paid</span>
        <span className="text-2xl font-bold">{KES(p.amount)}</span>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-3">Thank you for your payment.</p>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
