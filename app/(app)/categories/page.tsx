import Link from "next/link";
import {
  AppHeader,
  Card,
  CardBody,
  Badge,
} from "@/components/ui";
import { TagIcon, PlusIcon } from "@/components/icons";
import { CATEGORIES } from "../_data";

export default function CategoriesPage() {
  return (
    <>
      <AppHeader
        title="קטגוריות"
        actions={
          <Link
            href="#"
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 font-display text-[0.95rem] font-semibold text-white shadow-brand transition hover:brightness-105"
          >
            <PlusIcon width={18} height={18} />
            קטגוריה חדשה
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Card key={c.slug} className="group transition-shadow hover:shadow-md">
              <CardBody className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-white shadow-brand">
                  <TagIcon />
                </span>
                <div className="flex-1">
                  <div className="font-bold text-ink-900">{c.name}</div>
                  <div className="text-sm text-muted-foreground">קטגוריית מוצרים</div>
                </div>
                <Badge tone="brand">{c.count}</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
