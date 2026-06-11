import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/site/SiteShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — AsahdPay" },
      { name: "description", content: "Talk to our team about bringing AsahdPay to your school." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Let's talk</h1>
            <p className="mt-4 text-muted-foreground">Book a demo or ask anything about AsahdPay.</p>
            <div className="mt-8 space-y-4">
              {[
                { icon: Mail, label: "Email", value: "asahd010@gmail.com" },
                { icon: Phone, label: "Phone", value: "+254 720485988" },
                { icon: MessageCircle, label: "WhatsApp", value: "+254720485988" },
                { icon: MapPin, label: "Office", value: "Westlands, Nairobi" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="font-medium">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message sent — we'll get back within 24 hours.");
              }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label htmlFor="n">Your name</Label><Input id="n" required /></div>
                <div><Label htmlFor="s">School</Label><Input id="s" required /></div>
              </div>
              <div><Label htmlFor="e">Email</Label><Input id="e" type="email" required /></div>
              <div><Label htmlFor="p">Phone</Label><Input id="p" type="tel" /></div>
              <div><Label htmlFor="m">Message</Label><Textarea id="m" rows={5} /></div>
              <Button className="w-full" size="lg">Send message</Button>
            </form>
          </Card>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
