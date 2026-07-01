import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, CreditCard, Receipt, MessageSquare,
  BarChart3, UserCog, ScrollText, Settings, Wallet, LifeBuoy, BookOpen, FileText
} from "lucide-react";
import logo from "@/assets/asahdpay-logo.png";

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
      { title: "Fee Structure", url: "/dashboard/fees", icon: FileText },
      { title: "Billing", url: "/dashboard/billing", icon: Wallet },
      { title: "User Manual", url: "/dashboard/manual", icon: BookOpen },
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
        <Link to="/dashboard" className="flex items-center gap-2 px-1 py-1.5" aria-label="AsahdPay dashboard">
          <img src={logo} alt="AsahdPay" className={collapsed ? "h-8 w-8 object-contain" : "h-10 w-auto object-contain"} />
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
