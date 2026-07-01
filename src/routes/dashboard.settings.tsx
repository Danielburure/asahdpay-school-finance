import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useStore, type TermKey } from "@/lib/store";
import { Save } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const school = useStore((s) => s.schoolProfile);
  const update = useStore((s) => s.updateSchoolProfile);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { update({ logo: reader.result as string }); toast.success("Logo updated"); };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="School profile, integrations and notifications" />
      <Card className="p-6">
        <Tabs defaultValue="school">
          <TabsList>
            <TabsTrigger value="school">School</TabsTrigger>
            <TabsTrigger value="paybill">Paybill</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="term">Academic term</TabsTrigger>
            <TabsTrigger value="notif">Notifications</TabsTrigger>
          </TabsList>



          <TabsContent value="school" className="mt-6 space-y-4 max-w-2xl">
            <div className="flex items-center gap-4">
              {school.logo ? (
                <img src={school.logo} alt={school.name} className="h-16 w-16 rounded-2xl object-cover border" />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {school.name.charAt(0).toUpperCase()}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files?.[0] ?? null)} />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>Upload Logo</Button>
              {school.logo && (
                <Button variant="ghost" onClick={() => { update({ logo: "" }); toast.success("Logo removed"); }}>Remove</Button>
              )}
            </div>
            <div><Label>School name</Label><Input value={school.name} onChange={(e) => update({ name: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Email</Label><Input value={school.email} onChange={(e) => update({ email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={school.phone} onChange={(e) => update({ phone: e.target.value })} /></div>
            </div>
            <div><Label>Address (P.O. Box, town)</Label><Textarea value={school.address} onChange={(e) => update({ address: e.target.value })} rows={2} /></div>
            <Button onClick={() => toast.success("School profile saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="paybill" className="mt-6 space-y-4 max-w-2xl">
            <div><Label>Paybill Number</Label><Input value={school.paybill} onChange={(e) => update({ paybill: e.target.value })} /></div>
            <div><Label>Account Format</Label><Input defaultValue="ADMNO" /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Auto-reconcile incoming M-Pesa</span><Switch defaultChecked />
            </div>
            <Button onClick={() => toast.success("Saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="sms" className="mt-6 space-y-4 max-w-2xl">
            <div><Label>SMS Sender ID</Label><Input defaultValue="SCHOOL" /></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Auto SMS on payment receipt</span><Switch defaultChecked /></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">Weekly balance reminders</span><Switch /></div>
            <Button onClick={() => toast.success("Saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="term" className="mt-6 space-y-6 max-w-2xl">
            <TermYearSection />
          </TabsContent>

          <TabsContent value="notif" className="mt-6 space-y-3 max-w-2xl">
            {["Daily collection summary","Unmatched payment alerts","Failed SMS alerts","New staff invitation"].map((n) => (
              <div key={n} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{n}</span><Switch defaultChecked />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function TermYearSection() {
  const currentTerm = useStore((s) => s.currentTerm);
  const setCurrentTerm = useStore((s) => s.setCurrentTerm);
  const academicYear = useStore((s) => s.academicYear);
  const setAcademicYear = useStore((s) => s.setAcademicYear);

  const [term, setTerm] = useState<TermKey>(currentTerm);
  const [year, setYear] = useState<number>(academicYear);

  const years = Array.from({ length: 30 }, (_, i) => 2024 + i); // 2024..2053

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold">Term</h3>
        <p className="text-sm text-muted-foreground">
          Selecting a term sets the default fee balance for every student from the Fees Structure.
        </p>
        <Select value={term} onValueChange={(v) => setTerm(v as TermKey)}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="term1">TERM 1</SelectItem>
            <SelectItem value="term2">TERM 2</SelectItem>
            <SelectItem value="term3">TERM 3</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => { setCurrentTerm(term); toast.success("Term saved"); }}>
          <Save className="h-4 w-4 mr-1" /> Save Term
        </Button>
      </div>

      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold">Academic Year</h3>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-72">
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { setAcademicYear(year); toast.success("Academic year saved"); }}>
          <Save className="h-4 w-4 mr-1" /> Save Year
        </Button>
      </div>
    </div>
  );
}
