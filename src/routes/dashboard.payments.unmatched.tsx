import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { unmatchedPayments } from "@/lib/mock";
import { KES, dateTime } from "@/lib/format";
import { toast } from "sonner";
import { UserPlus, CheckCheck, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/dashboard/payments/unmatched")({
  component: Unmatched,
});

function Unmatched() {
  return (
    <div>
      <PageHeader title="Unmatched Payments" subtitle="M-Pesa transactions that need manual review" />
      <Card className="p-5">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Payer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Wrong Account #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Tx Code</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unmatchedPayments.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.payer}</TableCell>
                <TableCell className="text-sm">{u.phone}</TableCell>
                <TableCell className="font-mono text-xs">{u.wrongAccount}</TableCell>
                <TableCell className="font-semibold">{KES(u.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{u.txCode}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dateTime(u.date)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Assign dialog opened (demo)")}><UserPlus className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Marked reviewed")}><CheckCheck className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Note added")}><MessageSquare className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
