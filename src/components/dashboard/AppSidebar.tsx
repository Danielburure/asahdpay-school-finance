import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, CreditCard, FilePlus2, Receipt, MessageSquare,
  BarChart3, UserCog, ScrollText, Settings, Wallet, LifeBuoy, Sparkles, AlertTriangle, FileSignature
} from "lucide-react";

const groups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Students", url: "/dashboard/students", icon: Users },
      { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
      { title: "Record Payment", url: "/dashboard/payments/record", icon: FilePlus2 },
      { title: "Manual Receipt", url: "/dashboard/payments/manual-receipt", icon: FileSignature },
      { title: "Unmatched", url: "/dashboard/payments/unmatched", icon: AlertTriangle },
      { title: "Receipts", url: "/dashboard/receipts", icon: Receipt },
    ],
  },
  {
    label: "Communications",
    items: [
      { title: "SMS Reminders", url: "/dashboard/sms", icon: MessageSquare },
      { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Staff", url: "/dashboard/staff", icon: UserCog },
      { title: "Audit Logs", url: "/dashboard/audit", icon: ScrollText },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
      { title: "Billing", url: "/dashboard/billing", icon: Wallet },
      { title: "Support", url: "/dashboard/support", icon: LifeBuoy },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/dashboard" ? path === "/dashboard" : path.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-1 py-1.5">
          <div className="h-8 w-8 rounded-xl bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground shrink-0 shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && <span className="font-bold text-sidebar-foreground">AsahdPay</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel>{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <p className="text-xs font-semibold text-sidebar-foreground">Trial: 14 days left</p>
            <p className="text-[10px] text-sidebar-foreground/60 mt-1">Upgrade to keep all features after trial.</p>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
