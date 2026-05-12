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

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
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
              <div className="h-16 w-16 rounded-2xl bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground font-bold text-xl">M</div>
              <Button variant="outline">Upload Logo</Button>
            </div>
            <div><Label>School name</Label><Input defaultValue="Mang'u High School" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Email</Label><Input defaultValue="bursar@manguhigh.ac.ke" /></div>
              <div><Label>Phone</Label><Input defaultValue="+254 700 123 456" /></div>
            </div>
            <div><Label>Address</Label><Textarea defaultValue="P.O. Box 1, Thika, Kenya" rows={2} /></div>
            <Button onClick={() => toast.success("Saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="paybill" className="mt-6 space-y-4 max-w-2xl">
            <div><Label>Paybill Number</Label><Input defaultValue="522533" /></div>
            <div><Label>Account Format</Label><Input defaultValue="ADMNO" /></div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">Auto-reconcile incoming M-Pesa</span>
              <Switch defaultChecked />
            </div>
            <Button onClick={() => toast.success("Saved")}>Save</Button>
          </TabsContent>

          <TabsContent value="sms" className="mt-6 space-y-4 max-w-2xl">
            <div><Label>SMS Sender ID</Label><Input defaultValue="MANGUHIGH" /></div>
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
