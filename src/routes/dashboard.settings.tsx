import { useEffect, useRef, useState } from "react";
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
import { buildFeeStructureHtml } from "@/components/FeeStructureView";
import { Eye, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMySchoolId } from "@/lib/supabase-api";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

type Draft = { term1: string; term2: string; term3: string };

function SettingsPage() {
  const school = useStore((s) => s.schoolProfile);
  const update = useStore((s) => s.updateSchoolProfile);
  const classFees = useStore((s) => s.classFees);
  const setClassFee = useStore((s) => s.setClassFee);
  const [classes, setClasses] = useState<string[]>([]);
  const [draftFees, setDraftFees] = useState<Record<string, Draft>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Load classes from Supabase (same source as student form)
  useEffect(() => {
    (async () => {
      const schoolId = await getMySchoolId();
      if (!schoolId) return;
      const { data } = await supabase
        .from("classes").select("name").eq("school_id", schoolId).order("name");
      setClasses((data ?? []).map((c) => c.name));
    })();
  }, []);

  const getDraft = (c: string): Draft => {
    if (draftFees[c]) return draftFees[c];
    const f = classFees[c];
    return {
      term1: f?.term1?.toString() ?? "",
      term2: f?.term2?.toString() ?? "",
      term3: f?.term3?.toString() ?? "",
    };
  };

  const setDraft = (c: string, key: keyof Draft, value: string) =>
    setDraftFees((p) => ({ ...p, [c]: { ...getDraft(c), [key]: value } }));

  const saveClass = (c: string) => {
    const d = getDraft(c);
    const t1 = parseFloat(d.term1 || "0");
    const t2 = parseFloat(d.term2 || "0");
    const t3 = parseFloat(d.term3 || "0");
    if ([t1, t2, t3].some((v) => isNaN(v) || v < 0)) {
      toast.error("Enter valid amounts");
      return;
    }
    setClassFee(c, { term1: t1, term2: t2, term3: t3 });
    toast.success(`Saved fees for ${c}`);
  };

  const viewFeeStructure = () => {
    const html = buildFeeStructureHtml(school, classes, classFees);
    const w = window.open("", "_blank", "width=960,height=820");
    if (!w) { toast.error("Pop-up blocked"); return; }
    w.document.write(html);
    w.document.close();
  };

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
            <TabsTrigger value="fees">Fees Structure</TabsTrigger>
            <TabsTrigger value="paybill">Paybill</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="term">Academic term</TabsTrigger>
            <TabsTrigger value="notif">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="fees" className="mt-6 space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Class Fees (per term)</h3>
                <p className="text-sm text-muted-foreground">Set Term 1, Term 2 and Term 3 fees for each class. Classes come from "Create Classes" in the Students page.</p>
              </div>
              <Button onClick={viewFeeStructure} variant="outline">
                <Eye className="h-4 w-4 mr-1" /> View Fee Structure
              </Button>
            </div>

            {classes.length === 0 ? (
              <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                No classes yet. Go to Students → Create Classes to add some.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="hidden sm:grid grid-cols-[1fr_repeat(3,7rem)_auto] gap-3 px-3 text-xs font-medium text-muted-foreground">
                  <div>Class</div><div>Term 1 (KES)</div><div>Term 2 (KES)</div><div>Term 3 (KES)</div><div></div>
                </div>
                {classes.map((c) => {
                  const d = getDraft(c);
                  return (
                    <div key={c} className="grid sm:grid-cols-[1fr_repeat(3,7rem)_auto] gap-3 items-center rounded-lg border p-3">
                      <div className="font-medium">{c}</div>
                      <Input type="number" placeholder="0" value={d.term1} onChange={(e) => setDraft(c, "term1", e.target.value)} />
                      <Input type="number" placeholder="0" value={d.term2} onChange={(e) => setDraft(c, "term2", e.target.value)} />
                      <Input type="number" placeholder="0" value={d.term3} onChange={(e) => setDraft(c, "term3", e.target.value)} />
                      <Button size="sm" onClick={() => saveClass(c)}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

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
