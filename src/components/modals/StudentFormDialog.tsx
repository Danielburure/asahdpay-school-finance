import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import type { Student } from "@/lib/mock";

const classes = ["Form 1A","Form 1B","Form 2A","Form 2B","Form 3A","Form 3B","Form 4A","Form 4B"];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student?: Student | null;
};

export function StudentFormDialog({ open, onOpenChange, student }: Props) {
  const addStudent = useStore((s) => s.addStudent);
  const updateStudent = useStore((s) => s.updateStudent);
  const editing = !!student;

  const [name, setName] = useState(student?.name ?? "");
  const [admission, setAdmission] = useState(student?.admission ?? "");
  const [className, setClassName] = useState(student?.className ?? "Form 1A");
  const [parentName, setParentName] = useState(student?.parentName ?? "");
  const [parentPhone, setParentPhone] = useState(student?.parentPhone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset state when dialog opens
  const handleOpenChange = (v: boolean) => {
    if (v && student) {
      setName(student.name);
      setAdmission(student.admission);
      setClassName(student.className);
      setParentName(student.parentName);
      setParentPhone(student.parentPhone);
    } else if (v) {
      setName(""); setAdmission(""); setClassName("Form 1A"); setParentName(""); setParentPhone("");
    }
    setErrors({});
    onOpenChange(v);
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!admission.trim()) e.admission = "Required";
    if (!className.trim()) e.className = "Required";
    if (!parentName.trim()) e.parentName = "Required";
    if (!parentPhone.trim()) e.parentPhone = "Required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    if (editing && student) {
      updateStudent(student.id, { name, admission, className, parentName, parentPhone });
      toast.success("Student updated");
    } else {
      addStudent({ name, admission, className, parentName, parentPhone });
      toast.success("Student added successfully");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Student" : "Add Student"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update student details below." : "Enter student information to enroll them."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <Label>Student Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brian Kamau" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Admission Number *</Label>
              <Input value={admission} onChange={(e) => setAdmission(e.target.value)} placeholder="ADM2024999" />
              {errors.admission && <p className="text-xs text-destructive mt-1">{errors.admission}</p>}
            </div>
            <div>
              <Label>Class *</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Parent Name *</Label>
            <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="John Kamau" />
            {errors.parentName && <p className="text-xs text-destructive mt-1">{errors.parentName}</p>}
          </div>
          <div>
            <Label>Parent Phone *</Label>
            <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+254712345678" />
            {errors.parentPhone && <p className="text-xs text-destructive mt-1">{errors.parentPhone}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{editing ? "Save Changes" : "Add Student"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
