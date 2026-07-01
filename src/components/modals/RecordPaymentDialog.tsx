import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { KES, dateShort } from "@/lib/format";
import { CheckCircle2, Loader2, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Payment } from "@/lib/mock";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultAdmission?: string;
};

type RemoteStudent = {
  id: string;
  name: string;
  admission: string;
  className: string;
  balance: number;
};

export function RecordPaymentDialog({ open, onOpenChange, defaultAdmission }: Props) {
  const students = useStore((s) => s.students);
  const addPayment = useStore((s) => s.addPayment);
  const school = useStore((s) => s.schoolProfile);

  const [admission, setAdmission] = useState(defaultAdmission ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"M-Pesa" | "Bank" | "Cash" | "Cheque">("M-Pesa");
  const [mpesaCode, setMpesaCode] = useState("");
  const [receipt, setReceipt] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [remote, setRemote] = useState<RemoteStudent | null>(null);
  const [looking, setLooking] = useState(false);
  const [saved, setSaved] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);

  const localStudent = useMemo(
    () => students.find((s) => s.admission.toLowerCase() === admission.toLowerCase()),
    [admission, students],
  );

  const student = localStudent
    ? { id: localStudent.id, name: localStudent.name, admission: localStudent.admission, className: localStudent.className, balance: localStudent.balance }
    : remote && remote.admission.toLowerCase() === admission.toLowerCase()
      ? remote
      : null;

  const classFees = useStore((s) => s.classFees);
  const currentTerm = useStore((s) => s.currentTerm);

  useEffect(() => {
    if (!admission.trim() || localStudent) { setRemote(null); return; }
    const handle = setTimeout(async () => {
      setLooking(true);
      try {
        const { data } = await (supabase as any)
          .from("students")
          .select("id, full_name, admission_number, total_paid, term_fee, classes(name)")
          .ilike("admission_number", admission.trim())
          .maybeSingle();
        if (data) {
          const className = data.classes?.name ?? "—";
          const fee = classFees[className]?.[currentTerm] ?? Number(data.term_fee ?? 0);
          const balance = Math.max(0, fee - Number(data.total_paid ?? 0));
          setRemote({ id: data.id, name: data.full_name, admission: data.admission_number, className, balance });
        } else setRemote(null);
      } catch { setRemote(null); }
      finally { setLooking(false); }
    }, 300);
    return () => clearTimeout(handle);
  }, [admission, localStudent, classFees, currentTerm]);

  const reset = () => {
    setAdmission(defaultAdmission ?? "");
    setAmount(""); setMethod("M-Pesa"); setMpesaCode(""); setReceipt(""); setNotes("");
    setDate(new Date().toISOString().slice(0, 10));
    setErrors({}); setRemote(null); setSaved(null);
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!admission.trim()) e.admission = "Required";
    else if (!student) e.admission = "Student not found";
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = "Enter a valid amount";
    if (method === "M-Pesa" && !mpesaCode.trim()) e.mpesaCode = "Enter the M-Pesa transaction code";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    const finalTxCode = method === "M-Pesa" ? mpesaCode.trim().toUpperCase() : `TX-${Date.now().toString().slice(-6)}`;
    const finalReceipt = receipt || `RCT-${Date.now().toString().slice(-6)}`;
    const isoDate = new Date(date).toISOString();

    try {
      // Always add to local store so UI updates live
      const payment = addPayment({
        admission: student!.admission,
        amount: amt,
        method,
        receiptNo: finalReceipt,
        txCode: finalTxCode,
        notes,
        date: isoDate,
      }) ?? {
        // If student wasn't in local store, synthesize a payment object for receipt/list display
        id: `p-${Date.now()}`,
        studentId: student!.id,
        studentName: student!.name,
        admission: student!.admission,
        amount: amt,
        method,
        receiptNo: finalReceipt,
        txCode: finalTxCode,
        recordedBy: "Bursar",
        date: isoDate,
        className: student!.className,
      } as Payment;

      // Persist to Supabase when the student came from remote
      if (!localStudent && remote) {
        const balanceAfter = Math.max(0, remote.balance - amt);
        await (supabase as any).from("payments").insert({
          student_id: remote.id,
          admission_number: remote.admission,
          amount: amt,
          payment_method: method.toLowerCase(),
          receipt_number: finalReceipt,
          transaction_code: finalTxCode,
          payment_date: isoDate.split("T")[0],
          notes,
          balance_before: remote.balance,
          balance_after: balanceAfter,
        });
        const { data: cur } = await (supabase as any)
          .from("students").select("total_paid").eq("id", remote.id).maybeSingle();
        const newPaid = Number(cur?.total_paid ?? 0) + amt;
        await (supabase as any).from("students").update({ total_paid: newPaid }).eq("id", remote.id);
      }

      toast.success("Payment recorded successfully");
      setSaved(payment);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const printReceipt = () => {
    if (!saved) return;
    const headerLine = [school.address, school.paybill && `Paybill ${school.paybill}`].filter(Boolean).join(" · ");
    const logoTag = school.logo ? `<img src="${school.logo}" style="height:60px;margin:0 auto 8px;display:block" />` : "";
    const html = `<!doctype html><html><head><title>${saved.receiptNo}</title>
    <style>body{font-family:system-ui;padding:40px;max-width:480px;margin:auto}
    h1{text-align:center;margin:0}.muted{color:#666;font-size:12px}
    .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee}
    .amt{font-size:28px;font-weight:bold;text-align:right;margin-top:16px}
    .center{text-align:center}hr{border:none;border-top:1px solid #ddd;margin:16px 0}</style></head>
    <body><div class="center">${logoTag}<h1>${school.name}</h1><p class="muted">${headerLine}</p>
    <p class="muted">OFFICIAL RECEIPT</p><h2 style="font-family:monospace">${saved.receiptNo}</h2></div><hr/>
    <div class="row"><span>Student</span><b>${saved.studentName}</b></div>
    <div class="row"><span>Admission</span><b>${saved.admission}</b></div>
    <div class="row"><span>Class</span><b>${saved.className}</b></div>
    <div class="row"><span>Date</span><b>${dateShort(saved.date)}</b></div>
    <div class="row"><span>Method</span><b>${saved.method}</b></div>
    <div class="row"><span>Tx Code</span><b>${saved.txCode}</b></div>
    <div class="row"><span>Recorded by</span><b>${saved.recordedBy}</b></div>
    <div class="amt">${KES(saved.amount)}</div>
    <p class="center muted" style="margin-top:24px">Thank you for your payment.</p>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}</script>
    </body></html>`;
    const w = window.open("", "_blank", "width=520,height=720");
    if (w) { w.document.write(html); w.document.close(); } else toast.error("Pop-up blocked");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        {saved ? (
          <>
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
              <DialogDescription>Payment recorded successfully.</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border-2 border-dashed p-5 bg-card">
              <div className="text-center border-b pb-3">
                {school.logo && <img src={school.logo} alt={school.name} className="h-12 mx-auto mb-2 object-contain" />}
                <div className="font-bold text-lg">{school.name}</div>
                {(school.address || school.paybill) && (
                  <div className="text-xs text-muted-foreground">
                    {[school.address, school.paybill && `Paybill ${school.paybill}`].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <div className="text-center my-3">
                <div className="text-xs text-muted-foreground">OFFICIAL RECEIPT</div>
                <div className="font-mono font-bold">{saved.receiptNo}</div>
              </div>
              <div className="space-y-1.5 text-sm">
                <Row k="Student" v={saved.studentName} />
                <Row k="Admission" v={saved.admission} />
                <Row k="Class" v={saved.className} />
                <Row k="Date" v={dateShort(saved.date)} />
                <Row k="Method" v={saved.method} />
                <Row k="Tx Code" v={saved.txCode} />
                <Row k="Recorded By" v={saved.recordedBy} />
              </div>
              <div className="mt-4 pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-2xl font-bold">{KES(saved.amount)}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setSaved(null); }}>Record Another</Button>
              <Button onClick={printReceipt}><Printer className="h-4 w-4 mr-1" /> Print Receipt</Button>
              <Button variant="secondary" onClick={() => handleClose(false)}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Manually log a payment from any channel.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <Label>Admission Number *</Label>
                <Input value={admission} onChange={(e) => setAdmission(e.target.value)} placeholder="ADM2024001" />
                {errors.admission && <p className="text-xs text-destructive mt-1">{errors.admission}</p>}
                {looking && !student && admission.trim() && (
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Looking up student…
                  </div>
                )}
                {student && (
                  <div className="mt-2 flex items-center gap-2 text-success text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {student.name} · {student.className} · Balance {KES(student.balance)}
                  </div>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Amount (KES) *</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                  {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                      <SelectItem value="Bank">Bank</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {method === "M-Pesa" && (
                  <div className="sm:col-span-2">
                    <Label>M-Pesa Transaction Code *</Label>
                    <Input
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                      placeholder="e.g. QK7A2BC3XY"
                      className="font-mono"
                    />
                    {errors.mpesaCode && <p className="text-xs text-destructive mt-1">{errors.mpesaCode}</p>}
                  </div>
                )}
                <div>
                  <Label>Receipt Number</Label>
                  <Input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="auto" />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
              <Button onClick={submit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save Payment
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
