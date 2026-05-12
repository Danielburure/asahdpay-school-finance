import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
};

export function StatCard({ label, value, delta, trend = "up", icon: Icon, accent = "primary" }: Props) {
  const tone = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
  }[accent];

  return (
    <Card className="p-5 border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p className={cn("mt-1 text-xs font-medium",
              trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
              {delta}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", tone)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
