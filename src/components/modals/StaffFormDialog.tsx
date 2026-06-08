import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore, type Staff } from "@/lib/store";

const roles = ["Bursar", "Accountant", "Principal", "Viewer"];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  staff?: Staff | null;
};

export function StaffFormDialog({ open, onOpenChange, staff }: Props) {
  const addStaff = useStore((s) => s.addStaff);
  const updateStaff = useStore((s) => s.updateStaff);
  const editing = !!staff;

  const [name, setName] = useState(staff?.name ?? "");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [role, setRole] = useState(staff?.role ?? "Bursar");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email required";
    setErrors(e);
    if (Object.keys(e).length) return;

    if (editing && staff) {
      updateStaff(staff.id, { name, email, role });
      toast.success("Staff member updated");
    } else {
      addStaff({ name, email, role });
      toast.success("Staff added successfully");
    }
    setName(""); setEmail(""); setRole("Bursar");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Staff" : "Add Staff Member"}</DialogTitle>
          <DialogDescription>{editing ? "Update staff details." : "Invite a new team member."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Full Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save" : "Add Staff"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
