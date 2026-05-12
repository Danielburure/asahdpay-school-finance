import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { payments } from "@/lib/mock";
import { KES, dateTime } from "@/lib/format";
import { Download, FilePlus2, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const [q, setQ] = useState("");
  const [m, setM] = useState("all");

  const filtered = payments.filter((p) => {
    if (q && !`${p.studentName} ${p.admission} ${p.receiptNo} ${p.txCode}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (m !== "all" && p.method !== m) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle={`${filtered.length} transactions`}
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Link to="/dashboard/payments/record"><Button><FilePlus2 className="h-4 w-4 mr-2" /> Record Payment</Button></Link>
          </>
        }
      />
      <Card className="p-5">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search receipt, code, student..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={m} onValueChange={setM}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
              <SelectItem value="Bank">Bank</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Tx Code</TableHead>
                <TableHead>Recorded By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(0, 25).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.studentName}</TableCell>
                  <TableCell className="font-mono text-xs">{p.admission}</TableCell>
                  <TableCell className="font-semibold">{KES(p.amount)}</TableCell>
                  <TableCell><StatusBadge status={p.method === "M-Pesa" ? "Active" : "Pending"} /></TableCell>
                  <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                  <TableCell className="font-mono text-xs">{p.txCode}</TableCell>
                  <TableCell className="text-sm">{p.recordedBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{dateTime(p.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
