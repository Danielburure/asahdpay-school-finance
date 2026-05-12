import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { staffList } from "@/lib/mock";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/staff")({
  component: Staff,
});

function Staff() {
  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage roles and permissions"
        actions={<Button onClick={() => toast.success("Invite sent")}><UserPlus className="h-4 w-4 mr-2" /> Invite Staff</Button>}
      />
      <Card className="p-5">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{s.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                    <span className="font-medium">{s.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                <TableCell>{s.role}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.lastLogin}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Role updated")}>Change Role</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Account toggled")}>Disable</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
