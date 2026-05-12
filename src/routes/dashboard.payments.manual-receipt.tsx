import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { payments } from "@/lib/mock";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/payments/manual-receipt")({
  component: ManualReceipt,
});

function ManualReceipt() {
  const [rno, setRno] = useState("");
  const dup = payments.some((p) => p.receiptNo.toLowerCase() === rno.toLowerCase());

  return (
    <div>
      <PageHeader title="Manual Receipt Recording" subtitle="For bank, cheque, or cash payments processed at the bursary" />
      <Card className="p-6 max-w-3xl space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Manual Receipt Number</Label>
            <Input placeholder="e.g. MAN-00045" value={rno} onChange={(e) => setRno(e.target.value)} />
          </div>
          <div>
            <Label>Bursar Name</Label>
            <Input defaultValue="Grace Wambui" />
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div>
            <Label>Recording Date</Label>
            <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </div>
          <div>
            <Label>Payment Method</Label>
            <Select defaultValue="Bank">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Bank">Bank Deposit</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Amount (KES)</Label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea rows={3} placeholder="Reference, branch, cheque number etc." />
        </div>
        {dup && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Duplicate receipt number</AlertTitle>
            <AlertDescription>
              Receipt number <span className="font-mono">{rno}</span> already exists in the system. Please verify before saving.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-2 pt-2">
          <Button onClick={() => toast.success("Manual receipt recorded")}>Save Receipt</Button>
          <Button variant="ghost">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
