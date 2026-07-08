import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  schoolId: string | null;
  onSaved: (classes: { id: string; name: string }[]) => void;
};

export function CreateClassesDialog({ open, onOpenChange, schoolId, onSaved }: Props) {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load existing classes when dialog opens
  useEffect(() => {
    if (open && schoolId) {
      supabase
        .from("classes")
        .select("id, name")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: true })
        .then(({ data }) => setClasses(data ?? []));
    }
  }, [open, schoolId]);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!schoolId) return toast.error("School not found");
    if (classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error("Class already exists");
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("classes")
      .insert({ school_id: schoolId, name: trimmed })
      .select()
      .single();
    setLoading(false);

    if (error) return toast.error("Failed to add class");
    const updated = [...classes, { id: data.id, name: data.name }].sort((a, b) => a.name.localeCompare(b.name));
    setClasses(updated);
    onSaved(updated);
    toast.success(`Class "${trimmed}" added`);
    setName("");
  }

  async function remove(id: string, className: string) {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) return toast.error("Failed to remove class");
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    onSaved(updated);
    toast.success(`Removed ${className}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Classes</DialogTitle>
          <DialogDescription>
            Add the classes used in your school. These will appear when adding students.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Form 1A, Grade 7 Blue"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            />
            <Button onClick={add} type="button" disabled={loading}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Your classes ({classes.length})</p>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes yet. Add one above.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {classes.map((c) => (
                  <Badge key={c.id} variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                    {c.name}
                    <button
                      onClick={() => remove(c.id, c.name)}
                      className="ml-1 rounded hover:bg-destructive/20 p-0.5"
                      aria-label={`Remove ${c.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}