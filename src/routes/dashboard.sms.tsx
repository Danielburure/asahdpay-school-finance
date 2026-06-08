import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { dateTime } from "@/lib/format";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useStore, type Sms } from "@/lib/store";
import { SendSmsDialog } from "@/components/modals/SendSmsDialog";

export const Route = createFileRoute("/dashboard/sms")({
  component: SmsPage,
});

function SmsPage() {
  const sms = useStore((s) => s.sms);
  const [open, setOpen] = useState(false);
  const sentToday = sms.filter((m) => new Date(m.date).toDateString() === new Date().toDateString()).length;
  const failed = sms.filter((m) => m.status === "Failed").length;

  return (
    <div>
      <PageHeader
        title="SMS Reminders"
        subtitle="Bulk and targeted messages to parents"
        actions={<Button onClick={() => setOpen(true)}><Send className="h-4 w-4 mr-2" /> Send SMS</Button>}
      />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5"><p className="text-xs text-muted-foreground">Total sent</p><p className="text-2xl font-bold mt-1">{sms.length}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Sent today</p><p className="text-2xl font-bold mt-1 text-success">{sentToday}</p></Card>
        <Card className="p-5"><p className="text-xs text-muted-foreground">Failed</p><p className="text-2xl font-bold mt-1 text-destructive">{failed}</p></Card>
      </div>

      <Card className="p-5">
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> SMS history</h3>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="all" className="mt-4 space-y-2">
            {sms.slice(0, 50).map((m) => <SmsRow key={m.id} m={m} />)}
          </TabsContent>
          <TabsContent value="failed" className="mt-4 space-y-2">
            {sms.filter((m) => m.status === "Failed").map((m) => <SmsRow key={m.id} m={m} />)}
          </TabsContent>
        </Tabs>
      </Card>

      <SendSmsDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function SmsRow({ m }: { m: Sms }) {
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
