import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Images,
  Truck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Shared navigation items for the desktop sidebar and the mobile nav. */
export const navItems: NavItem[] = [
  { href: "/", label: "סקירה", icon: LayoutDashboard },
  { href: "/products", label: "מוצרים", icon: Package },
  { href: "/materials", label: "חומרי גלם", icon: Boxes },
  { href: "/suppliers", label: "ספקים", icon: Truck },
  { href: "/classification", label: "סיווג", icon: FolderTree },
  { href: "/media", label: "מדיה", icon: Images },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
