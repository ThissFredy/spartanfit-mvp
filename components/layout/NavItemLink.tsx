"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface AppNavItem {
  href: string;
  label: string;
  icon?: ReactNode;
}

export function NavItemLink({ item, mobile = false }: { item: AppNavItem; mobile?: boolean }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "border-spartan/30 bg-spartan/12 text-zinc-50"
          : "border-transparent text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/70 hover:text-zinc-100",
        mobile && "text-base",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {item.icon && <span className="text-zinc-400 group-hover:text-zinc-200">{item.icon}</span>}
      {item.label}
    </Link>
  );
}
