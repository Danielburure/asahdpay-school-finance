import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { students } from "@/lib/mock";
import { KES } from "@/lib/format";
import { Search, Plus, Upload, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dashboard/students")({
  component: StudentsPage,
});

const PAGE = 10;

function StudentsPage() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("all");
  const [bal, setBal] = useState("all");
  const [page, setPage] = useState(1);

  const classes = useMemo(() => Array.from(new Set(students.map((s) => s.className))), []);

  const filtered = students.filter((s) => {
    if (q && !`${s.name} ${s.admission} ${s.parentName}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (cls !== "all" && s.className !== cls) return false;
    if (bal === "with" && s.balance === 0) return false;
    if (bal === "cleared" && s.balance > 0) return false;
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} students`}
        actions={
          <>
            <Button variant="outline"><Upload className="h-4 w-4 mr-2" /> Import Excel</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Student</Button>
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
                <TableHead>Student</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.map((s) => (
                <TableRow key={s.id} className="cursor-pointer">
                  <TableCell><Link to="/dashboard/students/$id" params={{ id: s.id }} className="font-medium hover:text-primary">{s.name}</Link></TableCell>
                  <TableCell className="font-mono text-xs">{s.admission}</TableCell>
                  <TableCell>{s.className}</TableCell>
                  <TableCell>{s.parentName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.parentPhone}</TableCell>
                  <TableCell className="text-right font-semibold">{KES(s.balance)}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                </TableRow>
              ))}
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
    </div>
  );
}
