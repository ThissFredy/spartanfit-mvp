import { Activity, Bot, LayoutDashboard, Shield, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import type { AppNavItem } from "./NavItemLink";

interface AppShellProps {
  children: ReactNode;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  title: string;
  description?: string;
}

export function AppShell({
  children,
  userName,
  userEmail,
  isAdmin,
  title,
  description,
}: AppShellProps) {
  const navItems: AppNavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/profile", label: "Perfil", icon: <UserRound className="h-4 w-4" /> },
    { href: "/progress", label: "Progreso", icon: <Activity className="h-4 w-4" /> },
    { href: "/chat", label: "Chat IA", icon: <Bot className="h-4 w-4" /> },
  ];

  if (isAdmin) {
    navItems.push({
      href: "/admin/users",
      label: "Admin",
      icon: <Shield className="h-4 w-4" />,
    });
  }

  return (
    <div className="min-h-screen bg-page-gradient p-3 text-zinc-100 sm:p-4">
      <div className="mx-auto flex w-full max-w-7xl gap-4">
        <Sidebar items={navItems} userName={userName} userEmail={userEmail} />

        <main className="w-full">
          <MobileNav items={navItems} userName={userName} userEmail={userEmail} />
          <Card className="mb-4 border-zinc-800/90 bg-zinc-900/55">
            <CardHeader>
              <CardTitle className="text-2xl">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
          </Card>
          {children}
        </main>
      </div>
    </div>
  );
}
