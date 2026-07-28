"use client";

import * as React from "react";
import {
  LayoutDashboard,
  StickyNote,
  Sparkles,
  Apple,
  Dumbbell,
  Compass,
  Wallet,
  BarChart2,
  LogOut,
  Calendar,
  Settings,
  ChevronRight,
  User
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Quick Notes", url: "/notes", icon: StickyNote },
  { title: "Mindfulness", url: "/mindfulness", icon: Sparkles, color: "text-purple-500" },
  { title: "Health Tracker", url: "/health", icon: Apple, color: "text-sky-500" },
  { title: "Workout Log", url: "/exercise", icon: Dumbbell, color: "text-orange-500" },
  { title: "Travel Goals", url: "/travel", icon: Compass, color: "text-emerald-500" },
  { title: "Expense Wallet", url: "/expenses", icon: Wallet, color: "text-emerald-600" },
  { title: "Analytics", url: "/analytics", icon: BarChart2 },
];

export function AppSidebar() {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const { toast } = useToast();
  const { state } = useSidebar();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    toast({ title: "Signed Out", description: "Successfully logged out." });
  };

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-card">
      <SidebarHeader className="h-16 flex items-center justify-between px-4 border-b border-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <span className={cn("font-black text-primary tracking-tight transition-opacity duration-300", state === "collapsed" ? "opacity-0" : "opacity-100")}>
            DailyTaskTrack
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Core Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 space-y-1">
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      "h-11 rounded-xl transition-all",
                      pathname === item.url ? "bg-primary/5 text-primary" : "hover:bg-primary/5"
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className={cn("w-5 h-5 shrink-0", item.color || "text-primary")} />
                      <span className="font-bold text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-muted/30">
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-primary/5 text-primary font-black">
                {user.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col min-w-0 transition-opacity duration-300", state === "collapsed" ? "opacity-0" : "opacity-100")}>
              <span className="text-xs font-black truncate text-primary">{user.displayName}</span>
              <span className="text-[10px] font-bold text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Sign Out"
                className="h-11 rounded-xl hover:bg-destructive/5 hover:text-destructive text-muted-foreground"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
