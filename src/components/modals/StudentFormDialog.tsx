import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [admission, setAdmission] = useState("");
  const [classId, setClassId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real fee lookup from fee_structures (replaces the old local Zustand
  // classFees store), scoped to the school's current term/year.
  const [termFee, setTermFee] = useState<number | null>(null);
  const [termLabel, setTermLabel] = useState("");
  const [feeLoading, setFeeLoading] = useState(false);

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

  useEffect(() => {
    if (!classId || !schoolId) {
      setTermFee(null);
      return;
    }
    let cancelled = false;
    setFeeLoading(true);
    (async () => {
      const { data: school } = await supabase
        .from("schools")
        .select("current_term, academic_year")
        .eq("id", schoolId)
        .single();

      if (!school || cancelled) return;

      const labelMap: Record<string, string> = { term1: "Term 1", term2: "Term 2", term3: "Term 3" };
      setTermLabel(labelMap[school.current_term] ?? school.current_term);

      const { data: fee } = await supabase
        .from("fee_structures")
        .select("amount")
        .eq("class_id", classId)
        .eq("term", school.current_term)
        .eq("academic_year", school.academic_year)
        .eq("school_id", schoolId)
        .maybeSingle();

      if (!cancelled) {
        setTermFee(fee?.amount ?? 0);
        setFeeLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [classId, schoolId]);

  const selectedClassName = useMemo(
    () => classes.find((c) => c.id === classId)?.name ?? "",
    [classId, classes],
  );

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
        const { error } = await supabase.rpc("correct_student", {
          p_student_id: student.id,
          p_school_id: schoolId,
          p_full_name: name,
          p_class_id: classId,
          p_parent_name: parentName,
          p_parent_phone: parentPhone,
        });
        if (error) throw error;
        toast.success("Student updated");
      } else {
        const { error } = await supabase.rpc("enroll_student", {
          p_school_id: schoolId,
          p_full_name: name,
          p_admission_number: admission,
          p_class_id: classId,
          p_parent_name: parentName,
          p_parent_phone: parentPhone,
        });
        if (error) {
          console.error("enroll_student error", error);
          throw new Error(error.message);
        }
        toast.success("Student added successfully");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error("student save failed", err);
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
              {feeLoading ? (
                <span className="text-muted-foreground">Looking up fee…</span>
              ) : (
                <>
                  <span className="text-muted-foreground">{termLabel} fee (from Fees Structure): </span>
                  <span className="font-semibold">{KES(termFee ?? 0)}</span>
                  {termFee === 0 && (
                    <p className="text-xs text-destructive mt-1">
                      No fee set for {selectedClassName} this term. Go to Settings → Fees Structure to add one.
                    </p>
                  )}
                </>
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