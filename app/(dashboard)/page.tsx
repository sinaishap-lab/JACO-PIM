import Link from "next/link";
import {
  Package,
  Boxes,
  Truck,
  FolderTree,
  SlidersHorizontal,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/products",
    title: "מוצרים",
    description: "מוצרי הקצה למכירה — יצירה, עריכה וניהול",
    icon: Package,
  },
  {
    href: "/materials",
    title: "חומרי גלם",
    description: "החומרים שמהם מורכבים המוצרים",
    icon: Boxes,
  },
  {
    href: "/suppliers",
    title: "ספקים",
    description: "ניהול ספקים ומחירי עלות",
    icon: Truck,
  },
  {
    href: "/classification",
    title: "סיווג",
    description: "מחלקה ← תת-מחלקה ← דגם",
    icon: FolderTree,
  },
  {
    href: "/attributes",
    title: "מאפיינים",
    description: "מאפיינים דינמיים — הלב של ה-PIM",
    icon: SlidersHorizontal,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">סקירה כללית</h1>
        <p className="text-muted-foreground">
          ברוך הבא ל-JACO-PIM — מערכת לניהול מידע על מוצרים.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <Icon className="text-muted-foreground size-6" />
                <CardTitle className="mt-2">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
