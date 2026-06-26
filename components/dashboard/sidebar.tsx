"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems, isActive } from "./nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar text-sidebar-foreground hidden w-60 shrink-0 flex-col border-l md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-5 font-semibold">
        <Package className="size-5" />
        JACO-PIM
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="text-muted-foreground border-t p-4 text-xs">
        גרסה 0.1.0 · שלד ראשוני
      </div>
    </aside>
  );
}
