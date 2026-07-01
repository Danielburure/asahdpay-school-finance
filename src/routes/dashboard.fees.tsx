import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { buildFeeStructureHtml } from "@/components/FeeStructureView";
import { Eye, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMySchoolId } from "@/lib/supabase-api";

export const Route = createFileRoute("/dashboard/fees")({
  head: () => ({ meta: [{ title: "Fee Structure — AsahdPay" }] }),
  component: FeesPage,
});

type Draft = { term1: string; term2: string; term3: string };

function FeesPage() {
  const school = useStore((s) => s.schoolProfile);
  const classFees = useStore((s) => s.classFees);
  const setClassFee = useStore((s) => s.setClassFee);
  const [classes, setClasses] = useState<string[]>([]);
  const [draftFees, setDraftFees] = useState<Record<string, Draft>>({});

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

  return (
    <div>
      <PageHeader
        title="Fee Structure"
        subtitle="Set Term 1, Term 2 and Term 3 fees for each class"
        actions={
          <Button onClick={viewFeeStructure} variant="outline">
            <Eye className="h-4 w-4 mr-1" /> View Fee Structure
          </Button>
        }
      />
      <Card className="p-6 space-y-4">
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
      </Card>
    </div>
  );
}
