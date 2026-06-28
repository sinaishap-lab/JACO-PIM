import Link from "next/link";
import {
  AppHeader,
  IconButton,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardFooter,
  Progress,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Tooltip,
} from "@/components/ui";
import { BellIcon, ImageIcon, PlusIcon } from "@/components/icons";
import { PRODUCTS, STATUS_META } from "./_data";

const SALES = [
  { m: "ינו", v: 62 },
  { m: "פבר", v: 48 },
  { m: "מרץ", v: 75 },
  { m: "אפר", v: 58 },
  { m: "מאי", v: 88 },
  { m: "יונ", v: 96 },
];

const ACTIVITY = [
  { who: "סיני שפירא", what: "הוסיף מוצר", target: "קנבס משפחתי 40×60", tone: "success" as const, when: "לפני 5 דק׳" },
  { who: "בארי שפירא", what: "עדכן מחיר", target: "אלבום קלאסי 30 עמ׳", tone: "info" as const, when: "לפני שעה" },
  { who: "דנה כהן", what: "סימנה כאזל", target: "מגנט תמונה 10×10", tone: "danger" as const, when: "לפני 3 שעות" },
  { who: "סיני שפירא", what: "פרסם בקטלוג", target: "ספר תמונות יוקרתי", tone: "success" as const, when: "אתמול" },
];

export default function DashboardPage() {
  return (
    <>
      <AppHeader
        title="דשבורד"
        actions={
          <>
            <Tooltip label="התראות">
              <IconButton label="התראות">
                <BellIcon />
                <span className="absolute end-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-surface" />
              </IconButton>
            </Tooltip>
            <Link
              href="/products"
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 font-display text-[0.95rem] font-semibold text-white shadow-brand transition hover:brightness-105"
            >
              <PlusIcon width={18} height={18} />
              מוצר חדש
            </Link>
          </>
        }
      />

      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-ink-900">שלום, סיני 👋</h2>
          <p className="mt-1 text-muted-foreground">הנה סקירה מהירה של הקטלוג שלך היום.</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="סך מוצרים" value="1,248" delta="+24" tone="brand" />
          <Stat label="הזמנות החודש" value="312" delta="+8%" tone="success" />
          <Stat label="מלאי נמוך" value="37" delta="דורש טיפול" tone="warning" />
          <Stat label="הכנסה (₪)" value="48,920" delta="+12%" tone="info" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>מכירות — 6 חודשים אחרונים</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex h-52 items-end justify-between gap-3">
                {SALES.map((s) => (
                  <div key={s.m} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-brand-gradient transition-all"
                      style={{ height: `${s.v * 1.7}px` }}
                      title={`${s.v}`}
                    />
                    <span className="text-xs font-semibold text-ink-500">{s.m}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Activity feed */}
          <Card>
            <CardHeader>
              <CardTitle>פעילות אחרונה</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Avatar name={a.who} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink-800">
                      <span className="font-bold">{a.who}</span> {a.what}{" "}
                      <span className="font-semibold text-brand-600">{a.target}</span>
                    </p>
                    <span className="text-xs text-muted-foreground">{a.when}</span>
                  </div>
                  <Badge tone={a.tone} className="shrink-0" />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Recent products */}
        <Card>
          <CardHeader>
            <CardTitle>מוצרים אחרונים</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <Table className="border-0 shadow-none">
              <THead>
                <TR>
                  <TH>שם מוצר</TH>
                  <TH>קטגוריה</TH>
                  <TH>מחיר</TH>
                  <TH className="w-40">מלאי</TH>
                  <TH>סטטוס</TH>
                </TR>
              </THead>
              <TBody>
                {PRODUCTS.slice(0, 5).map((p) => {
                  const meta = STATUS_META[p.status];
                  return (
                    <TR key={p.sku}>
                      <TD>
                        <Link href={`/products/${p.sku}`} className="flex items-center gap-3 hover:text-brand-600">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white">
                            <ImageIcon width={16} height={16} />
                          </span>
                          <span className="font-semibold text-ink-900">{p.name}</span>
                        </Link>
                      </TD>
                      <TD><Badge tone="neutral">{p.category}</Badge></TD>
                      <TD className="font-semibold">₪{p.price}</TD>
                      <TD>
                        <Progress value={p.stock} tone={p.stock === 0 ? "danger" : p.stock < 20 ? "warning" : "success"} />
                      </TD>
                      <TD><Badge tone={meta.tone} dot>{meta.label}</Badge></TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardBody>
          <CardFooter className="justify-center">
            <Link href="/products">
              <Button variant="subtle" size="sm">לכל המוצרים ←</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}

function Stat({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "brand" | "success" | "warning" | "info" }) {
  const accent = { brand: "text-brand-gradient", success: "text-success", warning: "text-accent-500", info: "text-info" }[tone];
  return (
    <Card>
      <CardBody>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className={`mt-1 text-3xl font-black ${accent}`}>{value}</div>
        <div className="mt-1 text-xs font-semibold text-ink-400">{delta}</div>
      </CardBody>
    </Card>
  );
}
