import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore, type Staff } from "@/lib/store";
import { StaffFormDialog } from "@/components/modals/StaffFormDialog";
import { ConfirmDeleteDialog } from "@/components/modals/ConfirmDeleteDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/staff")({
  component: StaffPage,
});

function StaffPage() {
  const staff = useStore((s) => s.staff);
  const updateStaff = useStore((s) => s.updateStaff);
  const deleteStaff = useStore((s) => s.deleteStaff);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState<Staff | null>(null);

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage roles and permissions"
        actions={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><UserPlus className="h-4 w-4 mr-2" /> Add Staff</Button>}
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
            {staff.map((s) => (
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
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    updateStaff(s.id, { status: s.status === "Active" ? "Disabled" : "Active" });
                    toast.success(`Staff ${s.status === "Active" ? "disabled" : "enabled"}`);
                  }}>{s.status === "Active" ? "Disable" : "Enable"}</Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleting(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} staff={editing} />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Remove staff member?"
        description={deleting ? `${deleting.name} will lose access.` : ""}
        onConfirm={() => { if (deleting) { deleteStaff(deleting.id); toast.success("Staff removed"); setDeleting(null); } }}
      />
    </div>
  );
}
