import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { smsMessages } from "@/lib/mock";
import { dateTime } from "@/lib/format";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/sms")({
  component: SmsPage,
});

const templates = [
  "Dear Parent, kindly clear the outstanding balance of KES {balance} for {student}. Paybill 522533.",
  "Dear Parent, school reopens on {date}. Please ensure fees are settled before reporting.",
  "Receipt confirmation: KES {amount} received for {student}. Thank you.",
];

function SmsPage() {
  const [msg, setMsg] = useState(templates[0]);

  return (
    <div>
      <PageHeader title="SMS Reminders" subtitle="Bulk and targeted messages to parents" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Compose</h3>
          <div>
            <Label>Send to</Label>
            <Select defaultValue="overdue">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All unpaid students</SelectItem>
                <SelectItem value="overdue">Overdue balances only</SelectItem>
                <SelectItem value="class">Specific class</SelectItem>
                <SelectItem value="single">Single parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Template</Label>
            <Select onValueChange={(v) => setMsg(v)}>
              <SelectTrigger><SelectValue placeholder="Pick a template" /></SelectTrigger>
              <SelectContent>
                {templates.map((t, i) => <SelectItem key={i} value={t}>Template {i + 1}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">{msg.length} characters · ~{Math.ceil(msg.length / 160)} SMS</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => toast.success("SMS queued for delivery")}><Send className="h-4 w-4 mr-2" /> Send SMS</Button>
            <Button variant="outline">Save as template</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Preview</h3>
          <div className="rounded-2xl bg-foreground text-background p-4 text-sm">
            {msg.replace("{balance}", "12,500").replace("{student}", "Joy Achieng").replace("{date}", "5 May").replace("{amount}", "10,000")}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Sent today</p>
              <p className="font-bold text-lg">142</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="font-bold text-lg text-destructive">3</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 mt-6">
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">SMS history</h3>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="mt-4 space-y-2">
            {smsMessages.map((m) => <SmsRow key={m.id} m={m} />)}
          </TabsContent>
          <TabsContent value="failed" className="mt-4 space-y-2">
            {smsMessages.filter((m) => m.status === "Failed").map((m) => <SmsRow key={m.id} m={m} />)}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function SmsRow({ m }: { m: typeof smsMessages[number] }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{m.parent} <span className="text-muted-foreground font-normal">· {m.to}</span></p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.message}</p>
        </div>
        <div className="text-right ml-4 shrink-0">
          <StatusBadge status={m.status} />
          <p className="text-xs text-muted-foreground mt-1">{dateTime(m.date)}</p>
        </div>
      </div>
    </div>
  );
}
