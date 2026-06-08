import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { KES } from "@/lib/format";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function GenerateReportDialog({ open, onOpenChange }: Props) {
  const students = useStore((s) => s.students);
  const payments = useStore((s) => s.payments);
  const classes = useMemo(() => ["all", ...Array.from(new Set(students.map((s) => s.className)))], [students]);

  const [type, setType] = useState("collections");
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [cls, setCls] = useState("all");
  const [generated, setGenerated] = useState<null | { totalCollected: number; txCount: number; outstanding: number; studentCount: number }>(null);

  const generate = () => {
    const start = new Date(from).getTime();
    const end = new Date(to).getTime() + 86400000;
    const sList = cls === "all" ? students : students.filter((s) => s.className === cls);
    const sIds = new Set(sList.map((s) => s.id));
    const pList = payments.filter((p) => sIds.has(p.studentId) && +new Date(p.date) >= start && +new Date(p.date) < end);
    const result = {
      totalCollected: pList.reduce((a, p) => a + p.amount, 0),
      txCount: pList.length,
      outstanding: sList.reduce((a, s) => a + s.balance, 0),
      studentCount: sList.length,
    };
    setGenerated(result);
    toast.success("Report generated successfully");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setGenerated(null); onOpenChange(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
          <DialogDescription>Configure parameters and run the report.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Report Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="collections">Collections</SelectItem>
                <SelectItem value="outstanding">Outstanding balances</SelectItem>
                <SelectItem value="sms">SMS activity</SelectItem>
                <SelectItem value="class">Class breakdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>From</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Class</Label>
            <Select value={cls} onValueChange={setCls}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All classes" : c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {generated && (
            <div className="rounded-lg border bg-muted/40 p-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Total Collected</p><p className="font-bold text-base">{KES(generated.totalCollected)}</p></div>
              <div><p className="text-xs text-muted-foreground">Transactions</p><p className="font-bold text-base">{generated.txCount}</p></div>
              <div><p className="text-xs text-muted-foreground">Outstanding</p><p className="font-bold text-base text-destructive">{KES(generated.outstanding)}</p></div>
              <div><p className="text-xs text-muted-foreground">Students</p><p className="font-bold text-base">{generated.studentCount}</p></div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={generate}>Generate Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
