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
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { buildFeeStructureHtml } from "@/components/FeeStructureView";
import { Printer, Eye } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const school = useStore((s) => s.schoolProfile);
  const update = useStore((s) => s.updateSchoolProfile);
  const classes = useStore((s) => s.classes);
  const classFees = useStore((s) => s.classFees);
  const setClassFee = useStore((s) => s.setClassFee);
  const [draftFees, setDraftFees] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const viewFeeStructure = () => {
    const html = buildFeeStructureHtml(school, classes, classFees);
    const w = window.open("", "_blank", "width=900,height=800");
    if (!w) { toast.error("Pop-up blocked"); return; }
    w.document.write(html);
    w.document.close();
  };


  const handleLogo = (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({ logo: reader.result as string });
      toast.success("Logo updated");
    };
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
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogo(e.target.files?.[0] ?? null)}
              />
              <Button variant="outline" onClick={() => fileRef.current?.click()}>Upload Logo</Button>
              {school.logo && (
                <Button variant="ghost" onClick={() => { update({ logo: "" }); toast.success("Logo removed"); }}>
                  Remove
                </Button>
              )}
            </div>
            <div>
              <Label>School name</Label>
              <Input value={school.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input value={school.email} onChange={(e) => update({ email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={school.phone} onChange={(e) => update({ phone: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Address (P.O. Box, town)</Label>
              <Textarea value={school.address} onChange={(e) => update({ address: e.target.value })} rows={2} />
            </div>
            <Button onClick={() => toast.success("School profile saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="paybill" className="mt-6 space-y-4 max-w-2xl">
            <div>
              <Label>Paybill Number</Label>
              <Input value={school.paybill} onChange={(e) => update({ paybill: e.target.value })} />
            </div>
            <div><Label>Account Format</Label><Input defaultValue="ADMNO" /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Auto-reconcile incoming M-Pesa</span>
              <Switch defaultChecked />
            </div>
            <Button onClick={() => toast.success("Saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="sms" className="mt-6 space-y-4 max-w-2xl">
            <div><Label>SMS Sender ID</Label><Input defaultValue="SCHOOL" /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Auto SMS on payment receipt</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Weekly balance reminders</span>
              <Switch />
            </div>
            <Button onClick={() => toast.success("Saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="term" className="mt-6 space-y-4 max-w-2xl">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Current term</Label><Input defaultValue="Term 2, 2025" /></div>
              <div><Label>Next term starts</Label><Input type="date" /></div>
            </div>
            <Button onClick={() => toast.success("Saved")}>Save</Button>
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
