import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Mail, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/support")({
  component: Support,
});

const faqs = [
  { q: "How do I import students from Excel?", a: "Go to Students → Import Excel and upload our template. We map columns automatically." },
  { q: "Can I link multiple paybill numbers?", a: "Yes, on the Enterprise plan. Contact support to enable additional paybill numbers." },
  { q: "What happens to unmatched M-Pesa payments?", a: "They appear in Payments → Unmatched. You can assign them to the right student in one click." },
  { q: "How fast are SMS messages delivered?", a: "Most SMS arrive within 5 seconds via our partner Safaricom routes." },
];

function Support() {
  return (
    <div>
      <PageHeader title="Support" subtitle="We typically reply in under 1 hour during business hours" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <MessageCircle className="h-6 w-6 text-success" />
          <h3 className="font-semibold mt-3">WhatsApp support</h3>
          <p className="text-sm text-muted-foreground mt-1">Chat with us directly</p>
          <Button className="mt-4 w-full" onClick={() => toast.success("Opening WhatsApp...")}>+254720485988</Button>
        </Card>
        <Card className="p-6">
          <Mail className="h-6 w-6 text-primary" />
          <h3 className="font-semibold mt-3">Email support</h3>
          <p className="text-sm text-muted-foreground mt-1">asahd010@gmail.com</p>
          <Button variant="outline" className="mt-4 w-full">Send email</Button>
        </Card>
        <Card className="p-6">
          <Phone className="h-6 w-6 text-warning" />
          <h3 className="font-semibold mt-3">Phone support</h3>
          <p className="text-sm text-muted-foreground mt-1">Mon–sunday · 24/7 support</p>
          <Button variant="outline" className="mt-4 w-full">+254720485988</Button>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Report an issue</h3>
          <form
            className="space-y-3"
            onSubmit={(e) => { e.preventDefault(); toast.success("Issue reported, ticket #4821 created"); }}
          >
            <div><Label>Subject</Label><Input required /></div>
            <div><Label>Describe the issue</Label><Textarea rows={5} required /></div>
            <Button>Submit Complain</Button>
          </form>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-3">System status</h3>
          <div className="space-y-2">
            {["API","M-Pesa Integration","SMS Gateway","Dashboard"].map((s) => (
              <div key={s} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">{s}</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> Operational</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h3 className="font-semibold mb-3">FAQ</h3>
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`i-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
