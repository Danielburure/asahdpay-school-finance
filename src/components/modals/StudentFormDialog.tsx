import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { KES } from "@/lib/format";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student?: any | null;
  classes: { id: string; name: string }[];
  schoolId: string | null;
  onSaved: () => void;
};

export function StudentFormDialog({ open, onOpenChange, student, classes, schoolId, onSaved }: Props) {
  const editing = !!student;
  const classFees = useStore((s) => s.classFees);
  const currentTerm = useStore((s) => s.currentTerm);

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [admission, setAdmission] = useState("");
  const [classId, setClassId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setName(student?.full_name ?? "");
      setAdmission(student?.admission_number ?? "");
      setClassId(student?.class_id ?? "");
      setParentName(student?.parent_name ?? "");
      setParentPhone(student?.parent_phone ?? "");
      setErrors({});
    }
  }, [open, student]);

  const selectedClassName = useMemo(
    () => classes.find((c) => c.id === classId)?.name ?? "",
    [classId, classes],
  );
  const termFee = selectedClassName ? (classFees[selectedClassName]?.[currentTerm] ?? 0) : 0;
  const termLabel = currentTerm === "term1" ? "Term 1" : currentTerm === "term2" ? "Term 2" : "Term 3";

  async function submit() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Required";
    if (!admission.trim()) e.admission = "Required";
    if (!classId) e.classId = "Required";
    if (!parentName.trim()) e.parentName = "Required";
    if (!parentPhone.trim()) e.parentPhone = "Required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (!schoolId) return toast.error("School not found");

    setLoading(true);
    try {
      if (editing && student) {
        const { error } = await supabase
          .from("students")
          .update({
            full_name: name,
            admission_number: admission,
            class_id: classId,
            parent_name: parentName,
            parent_phone: parentPhone,
            term_fee: termFee,
          })
          .eq("id", student.id);
        if (error) throw error;
        toast.success("Student updated");
      } else {
        const { data: existing } = await supabase
          .from("students")
          .select("id")
          .eq("school_id", schoolId)
          .eq("admission_number", admission)
          .maybeSingle();
        if (existing) throw new Error("Admission number already exists");

        const { error } = await supabase.from("students").insert({
          school_id: schoolId,
          full_name: name,
          admission_number: admission,
          class_id: classId,
          parent_name: parentName,
          parent_phone: parentPhone,
          term_fee: termFee,
          total_paid: 0,
          status: "active",
        });
        if (error) throw error;
        toast.success("Student added successfully");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <Input value={admission} onChange={(e) => setAdmission(e.target.value)} placeholder="ADM2024999" disabled={editing} />
              {errors.admission && <p className="text-xs text-destructive mt-1">{errors.admission}</p>}
            </div>
            <div>
              <Label>Class *</Label>
              {classes.length === 0 ? (
                <div className="text-xs text-muted-foreground border rounded-md p-2">
                  No classes yet. Click "Create Classes" first.
                </div>
              ) : (
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              {errors.classId && <p className="text-xs text-destructive mt-1">{errors.classId}</p>}
            </div>
          </div>
          {classId && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">{termLabel} fee (from Fees Structure): </span>
              <span className="font-semibold">{KES(termFee)}</span>
              {termFee === 0 && (
                <p className="text-xs text-destructive mt-1">
                  No fee set for this class. Go to Settings → Fees Structure to add one.
                </p>
              )}
            </div>
          )}
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
          <Button onClick={submit} disabled={loading || classes.length === 0}>
            {loading ? "Saving..." : editing ? "Save Changes" : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
