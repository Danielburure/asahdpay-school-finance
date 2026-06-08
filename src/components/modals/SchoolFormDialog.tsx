import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore, type School } from "@/lib/store";

const plans = ["Standard", "Pro", "Enterprise"];

type Props = { open: boolean; onOpenChange: (v: boolean) => void; school?: School | null };

export function SchoolFormDialog({ open, onOpenChange, school }: Props) {
  const addSchool = useStore((s) => s.addSchool);
  const updateSchool = useStore((s) => s.updateSchool);
  const editing = !!school;

  const [name, setName] = useState(school?.name ?? "");
  const [email, setEmail] = useState(school?.email ?? "");
  const [phone, setPhone] = useState(school?.phone ?? "");
  const [plan, setPlan] = useState(school?.plan ?? "Pro");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!email.trim()) e.email = "Required";
    if (!phone.trim()) e.phone = "Required";
    setErrors(e);
    if (Object.keys(e).length) return;

    if (editing && school) {
      updateSchool(school.id, { name, email, phone, plan });
      toast.success("School updated");
    } else {
      addSchool({ name, email, phone, plan });
      toast.success("School added successfully");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit School" : "Add School"}</DialogTitle>
          <DialogDescription>Onboard a new school tenant.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>School Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label>Phone Number *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label>Subscription Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save" : "Add School"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
