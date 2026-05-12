import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: "bg-success/15 text-success border-success/30",
    Delivered: "bg-success/15 text-success border-success/30",
    Active: "bg-success/15 text-success border-success/30",
    Partial: "bg-warning/15 text-warning border-warning/30",
    Trial: "bg-warning/15 text-warning border-warning/30",
    Pending: "bg-warning/15 text-warning border-warning/30",
    Overdue: "bg-destructive/15 text-destructive border-destructive/30",
    Failed: "bg-destructive/15 text-destructive border-destructive/30",
    Suspended: "bg-destructive/15 text-destructive border-destructive/30",
    Disabled: "bg-muted text-muted-foreground border-border",
  };
  const cls = map[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", cls)}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
