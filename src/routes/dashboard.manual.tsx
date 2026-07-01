import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { BookOpen, Users, CreditCard, Receipt, MessageSquare, Settings, BarChart3, FileText } from "lucide-react";

export const Route = createFileRoute("/dashboard/manual")({
  head: () => ({ meta: [{ title: "User Manual — AsahdPay" }] }),
  component: ManualPage,
});

const sections = [
  {
    icon: Settings,
    title: "1. Initial Setup",
    steps: [
      "Go to Settings and enter your school name, contact details, address and paybill.",
      "Upload your school logo — it appears on receipts and the fee structure.",
      "Under Settings → Academic term, set the current TERM (1, 2 or 3) and the academic year, then click Save.",
    ],
  },
  {
    icon: FileText,
    title: "2. Classes & Fee Structure",
    steps: [
      "Open Students and click Create Classes to add every class in your school (e.g. Grade 1, Form 2A).",
      "Open Fee Structure from the sidebar and enter Term 1, Term 2 and Term 3 fees for each class, then click Save on each row.",
      "The active term (from Settings) is used as the default balance for every student.",
    ],
  },
  {
    icon: Users,
    title: "3. Adding Students",
    steps: [
      "Open Students and click Add Student.",
      "Enter the student's name, admission number, class, and parent contact.",
      "You do NOT enter fees here — the term fee is picked automatically from the Fee Structure of the student's class.",
    ],
  },
  {
    icon: CreditCard,
    title: "4. Recording Payments",
    steps: [
      "Open Payments and click Record Payment.",
      "Type the admission number — the student's name, class and current balance appear automatically.",
      "Enter the amount, choose the payment method. If M-Pesa, enter the M-Pesa transaction code.",
      "Click Save Payment. A receipt is generated instantly and the student's balance is reduced.",
    ],
  },
  {
    icon: Receipt,
    title: "5. Receipts",
    steps: [
      "Every recorded payment produces a printable receipt with your school logo and paybill.",
      "Open Receipts to view or reprint any previous receipt.",
    ],
  },
  {
    icon: MessageSquare,
    title: "6. SMS Reminders",
    steps: [
      "Open SMS Reminders to send fee balance reminders to parents.",
      "You can send to a single parent, an entire class, or all students with an outstanding balance.",
      "Use {student} and {balance} placeholders — they are replaced per recipient.",
    ],
  },
  {
    icon: BarChart3,
    title: "7. Reports",
    steps: [
      "Open Reports to see daily, weekly and term collection totals.",
      "Export reports to PDF or Excel for board meetings and audits.",
    ],
  },
];

function ManualPage() {
  return (
    <div>
      <PageHeader title="User Manual" subtitle="How to use AsahdPay — step by step" />
      <Card className="p-6 mb-6 flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">Getting Started</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Follow the sections below in order the first time you set up the system.
            Once your school profile, classes and fee structure are in place, day-to-day
            work is just recording payments and sending SMS reminders.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
            </div>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
              {s.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </Card>
        ))}
      </div>

      <Card className="p-6 mt-6">
        <h3 className="font-semibold mb-2">Need more help?</h3>
        <p className="text-sm text-muted-foreground">
          Open the Support page from the sidebar to contact the AsahdPay team.
        </p>
      </Card>
    </div>
  );
}
