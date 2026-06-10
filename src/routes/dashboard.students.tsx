import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { KES } from "@/lib/format";
import { Search, Plus, Upload, Download, ChevronLeft, ChevronRight, Pencil, Trash2, ArrowUpDown, GraduationCap } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Student } from "@/lib/mock";
import { StudentFormDialog } from "@/components/modals/StudentFormDialog";
import { CreateClassesDialog } from "@/components/modals/CreateClassesDialog";
import { ConfirmDeleteDialog } from "@/components/modals/ConfirmDeleteDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/students")({
  component: StudentsPage,
});

const PAGE = 10;
type SortKey = "name" | "admission" | "className" | "balance";

function StudentsPage() {
  const students = useStore((s) => s.students);
  const deleteStudent = useStore((s) => s.deleteStudent);

  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [bal, setBal] = useState("all");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.className))), [students]);

  const filtered = useMemo(() => {
    const list = students.filter((s) => {
      if (q && !`${s.name} ${s.admission} ${s.parentName}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cls !== "all" && s.className !== cls) return false;
      if (bal === "with" && s.balance === 0) return false;
      if (bal === "cleared" && s.balance > 0) return false;
      return true;
    });
    return list.sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [students, q, cls, bal, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const SortBtn = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
      {children} <ArrowUpDown className="h-3 w-3 opacity-60" />
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} students`}
        actions={
          <>
            <Button variant="outline" onClick={() => setClassesOpen(true)}><GraduationCap className="h-4 w-4 mr-2" /> Create Classes</Button>
            <Button variant="outline" onClick={() => toast.success("Import dialog opened")}><Upload className="h-4 w-4 mr-2" /> Import Excel</Button>
            <Button variant="outline" onClick={() => toast.success("Exported to CSV")}><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, admission, parent..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={cls} onValueChange={(v) => { setCls(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={bal} onValueChange={(v) => { setBal(v); setPage(1); }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Balance" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All balances</SelectItem>
              <SelectItem value="with">With balance</SelectItem>
              <SelectItem value="cleared">Fully paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead><SortBtn k="name">Student</SortBtn></TableHead>
                <TableHead><SortBtn k="admission">Admission</SortBtn></TableHead>
                <TableHead><SortBtn k="className">Class</SortBtn></TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right"><SortBtn k="balance">Balance</SortBtn></TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Link to="/dashboard/students/$id" params={{ id: s.id }} className="font-medium hover:text-primary">{s.name}</Link></TableCell>
                  <TableCell className="font-mono text-xs">{s.admission}</TableCell>
                  <TableCell>{s.className}</TableCell>
                  <TableCell>{s.parentName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.parentPhone}</TableCell>
                  <TableCell className="text-right font-semibold">{KES(s.balance)}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleting(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {slice.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No students match the current filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      <StudentFormDialog open={formOpen} onOpenChange={setFormOpen} student={editing} />
      <CreateClassesDialog open={classesOpen} onOpenChange={setClassesOpen} />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete student?"
        description={deleting ? `${deleting.name} will be removed from records.` : ""}
        onConfirm={() => {
          if (deleting) { deleteStudent(deleting.id); toast.success("Student deleted"); setDeleting(null); }
        }}
      />
    </div>
  );
}
