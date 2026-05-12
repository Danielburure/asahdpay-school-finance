import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { students } from "@/lib/mock";
import { KES } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/payments/record")({
  component: RecordPayment,
});

function RecordPayment() {
  const [adm, setAdm] = useState("");
  const student = students.find((s) => s.admission.toLowerCase() === adm.toLowerCase());

  return (
    <div>
      <PageHeader title="Record Payment" subtitle="Manually record a payment from any channel" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div>
            <Label htmlFor="adm">Admission Number</Label>
            <Input id="adm" placeholder="e.g. ADM2024001" value={adm} onChange={(e) => setAdm(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Amount (KES)</Label>
              <Input type="number" placeholder="0" />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select defaultValue="M-Pesa">
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
              <Input placeholder="RCT-10001" />
            </div>
            <div>
              <Label>Payment Date</Label>
              <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} placeholder="Optional notes for the bursar's records..." />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={() => toast.success("Payment saved")}>Save Payment</Button>
            <Button variant="outline" onClick={() => toast.success("Payment saved & SMS queued")}>Save & Send SMS</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Student lookup</h3>
          {!student ? (
            <p className="text-sm text-muted-foreground">Enter an admission number to auto-fill student details.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-success text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" /> Student found
              </div>
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{student.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span className="font-medium">{student.className}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Parent</span><span className="font-medium">{student.parentName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{student.parentPhone}</span></div>
                <hr />
                <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="font-bold text-destructive">{KES(student.balance)}</span></div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
