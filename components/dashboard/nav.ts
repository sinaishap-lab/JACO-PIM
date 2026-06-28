import {
  Package,
  Boxes,
  FolderTree,
  Truck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Shared navigation items for the desktop sidebar and the mobile nav. */
export const navItems: NavItem[] = [
  { href: "/products", label: "מוצרים", icon: Package },
  { href: "/materials", label: "חומרי גלם", icon: Boxes },
  { href: "/suppliers", label: "ספקים", icon: Truck },
  { href: "/classification", label: "סיווג", icon: FolderTree },
  { href: "/settings", label: "הגדרות", icon: Settings },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname.startsWith(href);
}
