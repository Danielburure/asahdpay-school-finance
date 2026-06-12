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
import { useMemo, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StudentFormDialog } from "@/components/modals/StudentFormDialog";
import { CreateClassesDialog } from "@/components/modals/CreateClassesDialog";
import { ConfirmDeleteDialog } from "@/components/modals/ConfirmDeleteDialog";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/dashboard/students")({
  component: StudentsPage,
});

const PAGE = 10;
type SortKey = "full_name" | "admission_number" | "className" | "balance";

type Student = {
  id: string;
  full_name: string;
  admission_number: string;
  className: string;
  class_id: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  term_fee: number;
  total_paid: number;
  balance: number | null;
  status: string;
};

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [bal, setBal] = useState("all");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("full_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Use the secure RPC function instead of querying staff table directly
        const { data: sid, error: rpcError } = await supabase.rpc("my_school_id");
        if (rpcError || !sid) {
          toast.error("Could not find your school. Please log in again.");
          return;
        }
        setSchoolId(sid);

        const { data: classData } = await supabase
          .from("classes")
          .select("id, name")
          .eq("school_id", sid)
          .order("name");
        const classList = classData ?? [];
        setClasses(classList);
        await loadStudents(sid, classList);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function loadStudents(sid: string, classList: { id: string; name: string }[]) {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("school_id", sid)
      .eq("status", "active")
      .order("full_name");
    if (error) { toast.error("Failed to load students"); return; }
    const classMap = Object.fromEntries(classList.map((c) => [c.id, c.name]));
    setStudents((data ?? []).map((s) => ({
      ...s,
      className: s.class_id ? classMap[s.class_id] ?? "—" : "—",
    })));
  }

  async function handleDelete() {
    if (!deleting || !schoolId) return;
    const { error } = await supabase
      .from("students")
      .update({ status: "inactive" })
      .eq("id", deleting.id);
    if (error) return toast.error("Failed to delete student");
    setStudents((prev) => prev.filter((s) => s.id !== deleting.id));
    toast.success("Student removed");
    setDeleting(null);
  }

  async function handleExport() {
    const rows = filtered.map((s) => ({
      Name: s.full_name,
      Admission: s.admission_number,
      Class: s.className,
      Parent: s.parent_name ?? "",
      Phone: s.parent_phone ?? "",
      "Term Fee": s.term_fee,
      "Total Paid": s.total_paid,
      Balance: s.balance ?? 0,
      Status: s.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
    toast.success("Exported to Excel");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !schoolId) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        if (rows.length === 0) return toast.error("No data found in file");
        const classMap = Object.fromEntries(classes.map((c) => [c.name.toLowerCase(), c.id]));
        const toInsert = rows.map((r) => ({
          school_id: schoolId,
          full_name: r["Name"] ?? r["full_name"] ?? "",
          admission_number: String(r["Admission"] ?? r["admission_number"] ?? ""),
          class_id: classMap[(r["Class"] ?? r["class"] ?? "").toLowerCase()] ?? null,
          parent_name: r["Parent"] ?? r["parent_name"] ?? null,
          parent_phone: String(r["Phone"] ?? r["parent_phone"] ?? ""),
          term_fee: Number(r["Term Fee"] ?? r["term_fee"] ?? 45000),
          total_paid: Number(r["Total Paid"] ?? r["total_paid"] ?? 0),
          status: "active" as const,
        })).filter((s) => s.full_name && s.admission_number);
        const { error } = await supabase
          .from("students")
          .upsert(toInsert, { onConflict: "school_id,admission_number" });
        if (error) throw error;
        toast.success(`${toInsert.length} students imported`);
        await loadStudents(schoolId, classes);
      } catch (err: any) {
        toast.error(err.message ?? "Import failed");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  }

  const filtered = useMemo(() => {
    const list = students.filter((s) => {
      if (q && !`${s.full_name} ${s.admission_number} ${s.parent_name ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cls !== "all" && s.className !== cls) return false;
      if (bal === "with" && (s.balance ?? 0) === 0) return false;
      if (bal === "cleared" && (s.balance ?? 0) > 0) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sortKey === "balance") return sortDir === "asc" ? (a.balance ?? 0) - (b.balance ?? 0) : (b.balance ?? 0) - (a.balance ?? 0);
      if (sortKey === "className") return sortDir === "asc" ? a.className.localeCompare(b.className) : b.className.localeCompare(a.className);
      const av = String(a[sortKey]); const bv = String(b[sortKey]);
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
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

  const getStatus = (balance: number | null) => {
    const b = balance ?? 0;
    if (b === 0) return "Paid";
    if (b > 30000) return "Overdue";
    return "Partial";
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} students`}
        actions={
          <>
            <Button variant="outline" onClick={() => setClassesOpen(true)}><GraduationCap className="h-4 w-4 mr-2" /> Create Classes</Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" /> Import Excel</Button>
            <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export</Button>
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
              {classes.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
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
                <TableHead><SortBtn k="full_name">Student</SortBtn></TableHead>
                <TableHead><SortBtn k="admission_number">Admission</SortBtn></TableHead>
                <TableHead><SortBtn k="className">Class</SortBtn></TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right"><SortBtn k="balance">Balance</SortBtn></TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading students...</TableCell></TableRow>
              ) : slice.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link to="/dashboard/students/$id" params={{ id: s.id }} className="font-medium hover:text-primary">{s.full_name}</Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.admission_number}</TableCell>
                  <TableCell>{s.className}</TableCell>
                  <TableCell>{s.parent_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.parent_phone}</TableCell>
                  <TableCell className="text-right font-semibold">{KES(s.balance ?? 0)}</TableCell>
                  <TableCell><StatusBadge status={getStatus(s.balance)} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleting(s)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && slice.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No students found.</TableCell></TableRow>
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

      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        classes={classes}
        schoolId={schoolId}
        onSaved={() => schoolId && loadStudents(schoolId, classes)}
      />
      <CreateClassesDialog
        open={classesOpen}
        onOpenChange={setClassesOpen}
        schoolId={schoolId}
        onSaved={(updated) => setClasses(updated)}
      />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete student?"
        description={deleting ? `${deleting.full_name} will be removed from records.` : ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}