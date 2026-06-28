"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Sidebar,
  SidebarSection,
  SidebarItem,
  ToastProvider,
} from "@/components/ui";
import {
  GridIcon,
  BoxIcon,
  TagIcon,
  LayersIcon,
  ImageIcon,
  SettingsIcon,
} from "@/components/icons";

const NAV = [
  { href: "/", label: "דשבורד", icon: GridIcon, exact: true },
  { href: "/products", label: "מוצרים", icon: BoxIcon },
  { href: "/categories", label: "קטגוריות", icon: TagIcon },
  { href: "/media", label: "מדיה", icon: ImageIcon, badge: "חדש" },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Shared application shell: brand sidebar (right, RTL) with active-route nav,
 * plus the toast provider. Each screen renders its own <AppHeader> + content.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-surface-muted">
        <Sidebar
          footer={
            <div className="flex items-center gap-3 rounded-xl p-2">
              <Avatar name="סיני שפירא" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-ink-900">סיני שפירא</div>
                <div className="truncate text-xs text-muted-foreground">מנהל מערכת</div>
              </div>
            </div>
          }
        >
          <SidebarSection title="ראשי">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={<Icon />}
                  active={isActive(pathname, item.href, "exact" in item ? item.exact : false)}
                  badge={"badge" in item ? item.badge : undefined}
                >
                  {item.label}
                </SidebarItem>
              );
            })}
          </SidebarSection>
          <SidebarSection title="מערכת">
            <SidebarItem href="/settings" icon={<SettingsIcon />} active={isActive(pathname, "/settings")}>
              הגדרות
            </SidebarItem>
            <SidebarItem href="/design-system" icon={<LayersIcon />}>
              מערכת עיצוב
            </SidebarItem>
          </SidebarSection>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </ToastProvider>
  );
}
