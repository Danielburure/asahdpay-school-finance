import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KES, dateShort } from "@/lib/format";
import type { Payment } from "@/lib/mock";
import { Printer, Download } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

type Props = { open: boolean; onOpenChange: (v: boolean) => void; payment: Payment | null };

export function ReceiptViewDialog({ open, onOpenChange, payment }: Props) {
  const school = useStore((s) => s.schoolProfile);
  if (!payment) return null;

  const headerLine = [school.address, school.paybill && `Paybill ${school.paybill}`]
    .filter(Boolean)
    .join(" · ");

  const print = () => {
    const logoTag = school.logo
      ? `<img src="${school.logo}" style="height:60px;margin:0 auto 8px;display:block" />`
      : "";
    const html = `<!doctype html><html><head><title>${payment.receiptNo}</title>
    <style>body{font-family:system-ui;padding:40px;max-width:480px;margin:auto}
    h1{text-align:center;margin:0}.muted{color:#666;font-size:12px}
    .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee}
    .amt{font-size:28px;font-weight:bold;text-align:right;margin-top:16px}
    .center{text-align:center}hr{border:none;border-top:1px solid #ddd;margin:16px 0}</style></head>
    <body><div class="center">${logoTag}<h1>${school.name}</h1><p class="muted">${headerLine}</p>
    <p class="muted">OFFICIAL RECEIPT</p><h2 style="font-family:monospace">${payment.receiptNo}</h2></div><hr/>
    <div class="row"><span>Student</span><b>${payment.studentName}</b></div>
    <div class="row"><span>Admission</span><b>${payment.admission}</b></div>
    <div class="row"><span>Class</span><b>${payment.className}</b></div>
    <div class="row"><span>Date</span><b>${dateShort(payment.date)}</b></div>
    <div class="row"><span>Method</span><b>${payment.method}</b></div>
    <div class="row"><span>Tx Code</span><b>${payment.txCode}</b></div>
    <div class="row"><span>Recorded by</span><b>${payment.recordedBy}</b></div>
    <div class="amt">${KES(payment.amount)}</div>
    <p class="center muted" style="margin-top:24px">Thank you for your payment.</p>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}</script>
    </body></html>`;
    const w = window.open("", "_blank", "width=520,height=720");
    if (w) { w.document.write(html); w.document.close(); }
    else toast.error("Pop-up blocked. Allow pop-ups to print.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Official Receipt</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border-2 border-dashed p-5 bg-card">
          <div className="text-center border-b pb-3">
            {school.logo && (
              <img src={school.logo} alt={school.name} className="h-12 mx-auto mb-2 object-contain" />
            )}
            <div className="font-bold text-lg">{school.name}</div>
            {headerLine && <div className="text-xs text-muted-foreground">{headerLine}</div>}
          </div>
          <div className="text-center my-3">
            <div className="text-xs text-muted-foreground">OFFICIAL RECEIPT</div>
            <div className="font-mono font-bold">{payment.receiptNo}</div>
          </div>
          <div className="space-y-1.5 text-sm">
            <Row k="Student" v={payment.studentName} />
            <Row k="Admission" v={payment.admission} />
            <Row k="Class" v={payment.className} />
            <Row k="Date" v={dateShort(payment.date)} />
            <Row k="Method" v={payment.method} />
            <Row k="Tx Code" v={payment.txCode} />
            <Row k="Recorded By" v={payment.recordedBy} />
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount Paid</span>
            <span className="text-2xl font-bold">{KES(payment.amount)}</span>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => toast.success("PDF downloaded")}><Download className="h-4 w-4 mr-2" /> PDF</Button>
          <Button onClick={print}><Printer className="h-4 w-4 mr-2" /> Print</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
