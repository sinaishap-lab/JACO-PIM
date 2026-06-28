"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems, isActive } from "./nav";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-sidebar text-sidebar-foreground border-b md:hidden print:!hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="flex items-center gap-2 font-semibold">
          <Package className="size-5" />
          JACO-PIM
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="תפריט"
          aria-expanded={open}
          className="hover:bg-sidebar-accent/60 rounded-md p-2"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
