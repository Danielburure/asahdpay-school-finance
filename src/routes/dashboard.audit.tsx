import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auditLogs } from "@/lib/mock";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/dashboard/audit")({
  component: AuditLogs,
});

function AuditLogs() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Every change in the system, fully traceable" />
      <Card className="p-5">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Affected Record</TableHead>
              <TableHead>Old Value</TableHead>
              <TableHead>New Value</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.action}</TableCell>
                <TableCell>{l.user}</TableCell>
                <TableCell className="font-mono text-xs">{l.record}</TableCell>
                <TableCell className="text-destructive line-through text-sm">{l.oldValue}</TableCell>
                <TableCell className="text-success font-medium text-sm">{l.newValue}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{dateTime(l.timestamp)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
