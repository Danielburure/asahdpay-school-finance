import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function CreateClassesDialog({ open, onOpenChange }: Props) {
  const classes = useStore((s) => s.classes);
  const addClass = useStore((s) => s.addClass);
  const deleteClass = useStore((s) => s.deleteClass);
  const [name, setName] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (classes.includes(trimmed)) {
      toast.error("Class already exists");
      return;
    }
    addClass(trimmed);
    toast.success(`Class "${trimmed}" added`);
    setName("");
  };

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
            <Button onClick={add} type="button"><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Your classes ({classes.length})</p>
            {classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes yet. Add one above.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {classes.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1 pl-3 pr-1 py-1">
                    {c}
                    <button
                      onClick={() => { deleteClass(c); toast.success(`Removed ${c}`); }}
                      className="ml-1 rounded hover:bg-destructive/20 p-0.5"
                      aria-label={`Remove ${c}`}
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
