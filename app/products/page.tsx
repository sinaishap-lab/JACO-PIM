"use client";

import { useMemo, useState } from "react";
import {
  AppHeader,
  IconButton,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  Checkbox,
  Dialog,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  EmptyState,
  Field,
  Input,
  Pagination,
  Progress,
  Select,
  Sidebar,
  SidebarSection,
  SidebarItem,
  Switch,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  ToastProvider,
  Tooltip,
  useToast,
} from "@/components/ui";
import {
  BellIcon,
  BoxIcon,
  GridIcon,
  ImageIcon,
  LayersIcon,
  MoreIcon,
  PencilIcon,
  PlusIcon,
  CopyIcon,
  SearchIcon,
  SettingsIcon,
  TagIcon,
  TrashIcon,
  FilterIcon,
  DownloadIcon,
} from "@/components/icons";

type Status = "active" | "low" | "out" | "draft";

interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: Status;
}

const STATUS_META: Record<Status, { label: string; tone: "success" | "warning" | "danger" | "info" }> = {
  active: { label: "פעיל", tone: "success" },
  low: { label: "מלאי נמוך", tone: "warning" },
  out: { label: "אזל", tone: "danger" },
  draft: { label: "טיוטה", tone: "info" },
};

const PRODUCTS: Product[] = [
  { sku: "JP-1024", name: "קנבס משפחתי 40×60", category: "קנבסים", price: 149, stock: 84, status: "active" },
  { sku: "JP-2087", name: "אלבום קלאסי 30 עמ׳", category: "אלבומים", price: 89, stock: 12, status: "low" },
  { sku: "JP-3310", name: "מגנט תמונה 10×10", category: "תמונות", price: 12, stock: 0, status: "out" },
  { sku: "JP-4501", name: "מסגרת עץ A4", category: "מסגרות", price: 65, stock: 40, status: "draft" },
  { sku: "JP-5120", name: "ספר תמונות יוקרתי", category: "אלבומים", price: 199, stock: 67, status: "active" },
  { sku: "JP-6044", name: "כוס קרמיקה מודפסת", category: "מתנות", price: 39, stock: 8, status: "low" },
  { sku: "JP-7788", name: "פאזל תמונה 500 חלקים", category: "מתנות", price: 79, stock: 23, status: "active" },
];

function PageContent() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"all" | Status>("all");
  const [openNew, setOpenNew] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const rows = useMemo(
    () => (tab === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.status === tab)),
    [tab],
  );

  const toggle = (sku: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.sku));

  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      {/* Navigation rail (right side in RTL) */}
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
          <SidebarItem icon={<GridIcon />}>דשבורד</SidebarItem>
          <SidebarItem icon={<BoxIcon />} active badge={PRODUCTS.length}>
            מוצרים
          </SidebarItem>
          <SidebarItem icon={<TagIcon />}>קטגוריות</SidebarItem>
          <SidebarItem icon={<LayersIcon />}>אוספים</SidebarItem>
          <SidebarItem icon={<ImageIcon />} badge="חדש">
            מדיה
          </SidebarItem>
        </SidebarSection>
        <SidebarSection title="מערכת">
          <SidebarItem icon={<SettingsIcon />}>הגדרות</SidebarItem>
        </SidebarSection>
      </Sidebar>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          title="מוצרים"
          search={
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-ink-400">
                <SearchIcon width={18} height={18} />
              </span>
              <Input placeholder="חיפוש מוצר או מק״ט…" className="ps-10" />
            </div>
          }
          actions={
            <>
              <Tooltip label="התראות">
                <IconButton label="התראות">
                  <BellIcon />
                  <span className="absolute end-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-surface" />
                </IconButton>
              </Tooltip>
              <Button variant="gradient" leftIcon={<PlusIcon width={18} height={18} />} onClick={() => setOpenNew(true)}>
                מוצר חדש
              </Button>
            </>
          }
        />

        <main className="flex-1 space-y-6 overflow-y-auto p-6">
          <Breadcrumbs
            items={[{ label: "בית", href: "/" }, { label: "קטלוג", href: "#" }, { label: "מוצרים" }]}
          />

          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="סך מוצרים" value="1,248" tone="brand" />
            <KpiCard label="פעילים" value="1,156" tone="success" />
            <KpiCard label="מלאי נמוך" value="37" tone="warning" />
            <KpiCard label="טיוטות" value="12" tone="info" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs defaultValue="all" value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(1); }}>
              <TabsList>
                <TabsTrigger value="all">הכל</TabsTrigger>
                <TabsTrigger value="active">פעילים</TabsTrigger>
                <TabsTrigger value="low">מלאי נמוך</TabsTrigger>
                <TabsTrigger value="draft">טיוטות</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={<FilterIcon width={16} height={16} />}>
                סינון
              </Button>
              <Button variant="outline" size="sm" leftIcon={<DownloadIcon width={16} height={16} />}>
                ייצוא
              </Button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <Card className="border-brand-200 bg-brand-50">
              <CardBody className="flex items-center justify-between py-3">
                <span className="text-sm font-semibold text-brand-800">
                  {selected.size} מוצרים נבחרו
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="subtle" onClick={() => setSelected(new Set())}>
                    ביטול בחירה
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      toast({ title: "נמחקו", description: `${selected.size} מוצרים הוסרו`, tone: "danger" });
                      setSelected(new Set());
                    }}
                  >
                    מחיקה
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Products table */}
          {rows.length === 0 ? (
            <EmptyState
              icon={<BoxIcon width={28} height={28} />}
              title="אין מוצרים בתצוגה הזו"
              description="נסה לשנות את הסינון או להוסיף מוצר חדש לקטלוג."
              action={
                <Button variant="gradient" leftIcon={<PlusIcon width={18} height={18} />} onClick={() => setOpenNew(true)}>
                  מוצר חדש
                </Button>
              }
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH className="w-10">
                    <Checkbox
                      checked={allChecked}
                      onChange={() =>
                        setSelected(allChecked ? new Set() : new Set(rows.map((r) => r.sku)))
                      }
                    />
                  </TH>
                  <TH>מק״ט</TH>
                  <TH>שם מוצר</TH>
                  <TH>קטגוריה</TH>
                  <TH>מחיר</TH>
                  <TH className="w-40">מלאי</TH>
                  <TH>סטטוס</TH>
                  <TH className="w-12" />
                </TR>
              </THead>
              <TBody>
                {rows.map((p) => {
                  const meta = STATUS_META[p.status];
                  return (
                    <TR key={p.sku} className={selected.has(p.sku) ? "bg-brand-50/60" : undefined}>
                      <TD>
                        <Checkbox checked={selected.has(p.sku)} onChange={() => toggle(p.sku)} />
                      </TD>
                      <TD className="font-mono text-ink-500">{p.sku}</TD>
                      <TD>
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                            <ImageIcon width={16} height={16} />
                          </span>
                          <span className="font-semibold text-ink-900">{p.name}</span>
                        </div>
                      </TD>
                      <TD>
                        <Badge tone="neutral">{p.category}</Badge>
                      </TD>
                      <TD className="font-semibold">₪{p.price}</TD>
                      <TD>
                        <Progress
                          value={p.stock}
                          showLabel
                          tone={p.stock === 0 ? "danger" : p.stock < 20 ? "warning" : "success"}
                        />
                      </TD>
                      <TD>
                        <Badge tone={meta.tone} dot>
                          {meta.label}
                        </Badge>
                      </TD>
                      <TD>
                        <DropdownMenu
                          trigger={
                            <IconButton label="פעולות" className="size-8">
                              <MoreIcon width={18} height={18} />
                            </IconButton>
                          }
                        >
                          <DropdownItem icon={<PencilIcon width={16} height={16} />} onSelect={() => toast({ title: "עריכה", description: p.name, tone: "info" })}>
                            עריכה
                          </DropdownItem>
                          <DropdownItem icon={<CopyIcon width={16} height={16} />} onSelect={() => toast({ title: "שוכפל", description: p.name, tone: "success" })}>
                            שכפול
                          </DropdownItem>
                          <DropdownSeparator />
                          <DropdownItem tone="danger" icon={<TrashIcon width={16} height={16} />} onSelect={() => toast({ title: "נמחק", description: p.name, tone: "danger" })}>
                            מחיקה
                          </DropdownItem>
                        </DropdownMenu>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}

          {/* Footer: count + pagination */}
          {rows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                מציג {rows.length} מתוך {PRODUCTS.length} מוצרים
              </span>
              <Pagination page={page} pageCount={8} onPageChange={setPage} />
            </div>
          )}
        </main>
      </div>

      {/* New product modal */}
      <Dialog
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="מוצר חדש"
        description="הוסף מוצר לקטלוג JACO PIM"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenNew(false)}>
              ביטול
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                setOpenNew(false);
                toast({ title: "המוצר נשמר", description: "המוצר נוסף לקטלוג בהצלחה", tone: "success" });
              }}
            >
              שמירת מוצר
            </Button>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="שם המוצר" required htmlFor="np-name" className="sm:col-span-2">
            <Input id="np-name" placeholder="לדוגמה: קנבס משפחתי 40×60" />
          </Field>
          <Field label="מק״ט" htmlFor="np-sku">
            <Input id="np-sku" placeholder="JP-…" />
          </Field>
          <Field label="קטגוריה" htmlFor="np-cat">
            <Select id="np-cat" defaultValue="">
              <option value="" disabled>בחר קטגוריה…</option>
              <option>קנבסים</option>
              <option>אלבומים</option>
              <option>תמונות</option>
              <option>מסגרות</option>
              <option>מתנות</option>
            </Select>
          </Field>
          <Field label="מחיר (₪)" htmlFor="np-price">
            <Input id="np-price" type="number" placeholder="0.00" />
          </Field>
          <Field label="מלאי התחלתי" htmlFor="np-stock">
            <Input id="np-stock" type="number" placeholder="0" />
          </Field>
          <Field label="תיאור" htmlFor="np-desc" className="sm:col-span-2">
            <Textarea id="np-desc" placeholder="תיאור המוצר לקטלוג…" />
          </Field>
          <div className="flex items-center gap-6 sm:col-span-2">
            <Switch label="פרסם בקטלוג" defaultChecked />
            <Switch label="מוצר מבצע" />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "brand" | "success" | "warning" | "info";
}) {
  const accent = {
    brand: "text-brand-gradient",
    success: "text-success",
    warning: "text-accent-500",
    info: "text-info",
  }[tone];
  return (
    <Card>
      <CardBody>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className={`mt-1 text-3xl font-black ${accent}`}>{value}</div>
      </CardBody>
    </Card>
  );
}

export default function ProductsPage() {
  return (
    <ToastProvider>
      <PageContent />
    </ToastProvider>
  );
}
