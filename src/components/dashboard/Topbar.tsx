import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Search, Moon, Sun } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Topbar() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();
  const school = useStore((s) => s.schoolProfile);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur flex items-center gap-3 px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-2 px-2">
        {school.logo ? (
          <img src={school.logo} alt={school.name} className="h-8 w-8 rounded-md object-cover border" />
        ) : (
          <div className="h-8 w-8 rounded-md bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground font-bold text-sm">
            {school.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-semibold text-sm">{school.name}</span>
      </div>

      <div className="relative ml-2 hidden md:block w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search students, payments, receipts..." className="pl-9 bg-muted/50 border-0" />
      </div>
      <div className="flex-1" />
      <Button variant="ghost" size="icon" onClick={() => setDark((v) => !v)} aria-label="Toggle theme">
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">GW</AvatarFallback></Avatar>
            <span className="hidden sm:inline text-sm font-medium">Grace W.</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Grace Wambui · Bursar</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
