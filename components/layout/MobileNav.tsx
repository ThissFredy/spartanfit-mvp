"use client";

import type { AppNavItem } from "./NavItemLink";
import { NavItemLink } from "./NavItemLink";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { logoutAction } from "@/actions/auth.actions";

interface MobileNavProps {
  items: AppNavItem[];
  userName: string;
  userEmail: string;
}

export function MobileNav({ items, userName, userEmail }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 md:hidden">
        <div className="flex items-center gap-2">
          <Image src="/icon.png" alt="Logo SpartanFit" width={32} height={32} className="rounded-lg" />
          <p className="text-sm font-semibold text-zinc-100">SpartanFit</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menú de navegación"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-80 max-w-[90vw] flex-col border-l border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image src="/icon.png" alt="Logo SpartanFit" width={32} height={32} className="rounded-lg" />
                <p className="text-sm font-semibold text-zinc-100">Menú</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cerrar menú"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="space-y-2">
              {items.map((item) => (
                <div key={item.href} onClick={() => setOpen(false)}>
                  <NavItemLink item={item} mobile />
                </div>
              ))}
            </nav>

            <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
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
          </div>
        </div>
      )}
    </>
  );
}
