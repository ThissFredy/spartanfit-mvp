import Image from "next/image";
import { logoutAction } from "@/actions/auth.actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AppNavItem } from "./NavItemLink";
import { NavItemLink } from "./NavItemLink";

interface SidebarProps {
  items: AppNavItem[];
  userName: string;
  userEmail: string;
}

export function Sidebar({ items, userName, userEmail }: SidebarProps) {
  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-soft backdrop-blur md:flex md:flex-col">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5">
        <Image src="/icon.png" alt="Logo SpartanFit" width={36} height={36} className="rounded-lg" />
        <div>
          <p className="text-sm font-semibold text-zinc-100">SpartanFit</p>
          <p className="text-xs text-zinc-400">Coach de rendimiento</p>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <NavItemLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
        <div className="mb-3 flex items-center gap-3">
          <Avatar name={userName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">{userName}</p>
            <p className="truncate text-xs text-zinc-400">{userEmail}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" className="w-full">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
