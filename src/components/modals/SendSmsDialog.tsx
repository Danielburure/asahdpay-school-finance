import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Send } from "lucide-react";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function SendSmsDialog({ open, onOpenChange }: Props) {
  const students = useStore((s) => s.students);
  const addSms = useStore((s) => s.addSms);

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.className))), [students]);

  const [target, setTarget] = useState<"single" | "class" | "balances">("balances");
  const [studentId, setStudentId] = useState<string>(students[0]?.id ?? "");
  const [className, setClassName] = useState(classes[0] ?? "");
  const [message, setMessage] = useState(
    "Dear Parent, kindly clear the outstanding balance of KES {balance} for {student}. Paybill 522533.",
  );

  const recipientCount =
    target === "single" ? 1 :
    target === "class" ? students.filter((s) => s.className === className).length :
    students.filter((s) => s.balance > 0).length;

  const previewStudent = students[0];
  const preview = message
    .replace(/{balance}/g, previewStudent?.balance.toLocaleString() ?? "0")
    .replace(/{student}/g, previewStudent?.name ?? "");

  const send = () => {
    if (!message.trim()) { toast.error("Message cannot be empty"); return; }
    const n = addSms({
      target,
      studentId: target === "single" ? studentId : undefined,
      className: target === "class" ? className : undefined,
      message,
    });
    toast.success(`SMS Sent Successfully to ${n} recipient${n === 1 ? "" : "s"}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose SMS</DialogTitle>
          <DialogDescription>Send a message to parents. Use {"{student}"} and {"{balance}"} as placeholders.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Send to</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as typeof target)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">One student</SelectItem>
                <SelectItem value="class">One class</SelectItem>
                <SelectItem value="balances">All students with balances</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {target === "single" && (
            <div>
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {students.slice(0, 50).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} · {s.admission}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {target === "class" && (
            <div>
              <Label>Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Message</Label>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">{message.length} chars · {recipientCount} recipient{recipientCount === 1 ? "" : "s"}</p>
          </div>
          <div>
            <Label>Preview</Label>
            <div className="rounded-2xl bg-foreground text-background p-3 text-sm mt-1">{preview}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={send}><Send className="h-4 w-4 mr-2" /> Send SMS</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
