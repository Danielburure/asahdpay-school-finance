import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { KES } from "@/lib/format";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const [admission, setAdmission] = useState(defaultAdmission ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"M-Pesa" | "Bank" | "Cash" | "Cheque">("M-Pesa");
  const [receipt, setReceipt] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [remote, setRemote] = useState<RemoteStudent | null>(null);
  const [looking, setLooking] = useState(false);

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

  // Look up in Supabase if not in local store
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
          setRemote({
            id: data.id,
            name: data.full_name,
            admission: data.admission_number,
            className,
            balance,
          });
        } else setRemote(null);
      } catch { setRemote(null); }
      finally { setLooking(false); }
    }, 300);
    return () => clearTimeout(handle);
  }, [admission, localStudent, classFees, currentTerm]);

  const reset = () => {
    setAdmission(defaultAdmission ?? "");
    setAmount(""); setMethod("M-Pesa"); setReceipt(""); setNotes(""); setErrors({}); setRemote(null);
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!admission.trim()) e.admission = "Required";
    else if (!student) e.admission = "Student not found";
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // Local store payment (also keeps UI in sync)
    if (localStudent) {
      const payment = addPayment({ admission, amount: amt, method, receiptNo: receipt });
      if (!payment) { toast.error("Student not found"); return; }
    } else if (remote) {
      // Persist directly to Supabase
      try {
        const balanceAfter = Math.max(0, remote.balance - amt);
        await (supabase as any).from("payments").insert({
          student_id: remote.id,
          admission_number: remote.admission,
          amount: amt,
          payment_method: method.toLowerCase(),
          receipt_number: receipt || `RCT-${Date.now().toString().slice(-6)}`,
          payment_date: new Date().toISOString().split("T")[0],
          notes,
          balance_before: remote.balance,
          balance_after: balanceAfter,
        });
        // Increment total_paid on student so balance reflects payment
        const { data: cur } = await (supabase as any)
          .from("students").select("total_paid").eq("id", remote.id).maybeSingle();
        const newPaid = Number(cur?.total_paid ?? 0) + amt;
        await (supabase as any).from("students").update({ total_paid: newPaid }).eq("id", remote.id);
      } catch (err: any) {
        toast.error(err.message ?? "Failed to record payment");
        return;
      }
    }
    toast.success("Payment recorded successfully");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-xl">
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
            <div>
              <Label>Receipt Number</Label>
              <Input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="auto" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Save Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
