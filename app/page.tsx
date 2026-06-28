import Link from "next/link";
import {
  Logo,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
  Field,
  Input,
  Textarea,
  Select,
  Switch,
  Checkbox,
  Radio,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  Alert,
  Avatar,
  AvatarGroup,
  Progress,
  Skeleton,
  Tooltip,
  Breadcrumbs,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";

/* --- Small presentational helpers (showcase-only) ------------------------- */
function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h2>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="h-16 w-full" style={{ background: `var(${varName})` }} />
      <div className="px-2.5 py-2">
        <div className="text-xs font-bold text-ink-800">{name}</div>
        <div className="font-mono text-[0.65rem] text-ink-400">{varName}</div>
      </div>
    </div>
  );
}

const brandScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

/* --- Page ----------------------------------------------------------------- */
export default function DesignSystemPage() {
  return (
    <div className="min-h-full">
      {/* Top bar — black strip like the brand site */}
      <header className="bg-ink-950 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="font-display text-sm font-medium text-ink-200">
            מערכת ניהול מוצרים · PIM
          </span>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="gradient">
              התחברות
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 text-center md:flex-row md:justify-between md:text-start">
          <div className="max-w-xl">
            <Badge tone="accent" dot className="mb-4">
              חבילת עיצוב v1.0
            </Badge>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-ink-950 md:text-5xl">
              מערכת העיצוב של{" "}
              <span className="text-brand-gradient">JACO PIM</span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              טוקנים, צבעים, טיפוגרפיה ורכיבים — נגזרים ישירות מהמותג של JACO
              PRINT. מהיר, מקומי, פשוט.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/products"
                className="focus-ring inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand-gradient px-8 font-display text-base font-semibold text-white shadow-brand transition-[filter] hover:brightness-105"
              >
                צפה במסך לדוגמה
              </Link>
              <a
                href="#colors"
                className="focus-ring inline-flex h-13 items-center justify-center rounded-full border border-ink-200 bg-surface px-8 font-display text-base font-semibold text-ink-800 transition-colors hover:bg-ink-50"
              >
                קטלוג רכיבים
              </a>
            </div>
          </div>
          <Logo size="lg" />
        </div>
      </div>

      {/* Body */}
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16">
        {/* Colors */}
        <Section
          id="colors"
          title="צבעים"
          subtitle="ורוד־מגנטה ראשי, כתום־ענבר משני, וגרדיאנט החתימה כתום→ורוד."
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-700">Brand · ורוד ראשי</h3>
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                {brandScale.map((n) => (
                  <Swatch key={n} name={`brand-${n}`} varName={`--color-brand-${n}`} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-700">Accent · כתום (אמצע הגרדיאנט)</h3>
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                {brandScale.map((n) => (
                  <Swatch key={n} name={`accent-${n}`} varName={`--color-accent-${n}`} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-bold text-ink-700">Gold · זהב (&quot;PRINT&quot;)</h3>
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                {brandScale.map((n) => (
                  <Swatch key={n} name={`gold-${n}`} varName={`--color-gold-${n}`} />
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-brand-gradient flex h-28 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-brand">
                גרדיאנט המותג
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Swatch name="success" varName="--color-success" />
                <Swatch name="warning" varName="--color-warning" />
                <Swatch name="danger" varName="--color-danger" />
                <Swatch name="info" varName="--color-info" />
              </div>
            </div>
          </div>
        </Section>

        {/* Typography */}
        <Section
          id="type"
          title="טיפוגרפיה"
          subtitle="Rubik לכותרות (מעוגל, כבד) · Heebo לטקסט גוף."
        >
          <Card>
            <CardBody className="space-y-4">
              <p className="font-display text-5xl font-black tracking-tight text-ink-950">
                הדפסת תמונות בקליק
              </p>
              <p className="font-display text-3xl font-bold text-ink-900">
                כותרת משנה · Rubik Bold
              </p>
              <p className="text-lg text-ink-800">
                פסקת גוף ב־Heebo. מערכת הטיפוגרפיה נבחרה כך שתשקף את התחושה
                המעוגלת והידידותית של המותג, תוך שמירה על קריאות גבוהה בעברית.
              </p>
              <p className="text-sm text-muted-foreground">
                טקסט משני וקטן · muted-foreground
              </p>
              <p className="font-mono text-sm text-ink-600">
                מק&quot;ט: JP-1024-PINK · קוד מק&quot;ט מונוספייס
              </p>
            </CardBody>
          </Card>
        </Section>

        {/* Buttons */}
        <Section id="buttons" title="כפתורים" subtitle="pill מעוגל לחלוטין, בשלל וריאנטים.">
          <Card>
            <CardBody className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">ראשי</Button>
                <Button variant="gradient">גרדיאנט</Button>
                <Button variant="accent">כתום</Button>
                <Button variant="outline">מתאר</Button>
                <Button variant="ghost">שקוף</Button>
                <Button variant="subtle">עדין</Button>
                <Button variant="danger">מחיקה</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="gradient">קטן</Button>
                <Button size="md" variant="gradient">בינוני</Button>
                <Button size="lg" variant="gradient">גדול</Button>
                <Button variant="gradient" disabled>מושבת</Button>
                <Button
                  variant="primary"
                  leftIcon={<span aria-hidden>＋</span>}
                >
                  מוצר חדש
                </Button>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Badges */}
        <Section id="badges" title="תוויות סטטוס" subtitle="לסימון מצב מוצר, מלאי ותגיות.">
          <Card>
            <CardBody className="flex flex-wrap gap-2.5">
              <Badge tone="brand" dot>פעיל</Badge>
              <Badge tone="success" dot>במלאי</Badge>
              <Badge tone="warning" dot>מלאי נמוך</Badge>
              <Badge tone="danger" dot>אזל</Badge>
              <Badge tone="info">טיוטה</Badge>
              <Badge tone="accent">מבצע</Badge>
              <Badge tone="neutral">ארכיון</Badge>
            </CardBody>
          </Card>
        </Section>

        {/* Forms */}
        <Section id="forms" title="טפסים" subtitle="שדות קלט, בחירה, אזור טקסט ומתג.">
          <Card>
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <Field label="שם המוצר" required htmlFor="f-name">
                <Input id="f-name" placeholder="לדוגמה: קנבס משפחתי 40×60" />
              </Field>
              <Field label="קטגוריה" htmlFor="f-cat">
                <Select id="f-cat" defaultValue="">
                  <option value="" disabled>בחר קטגוריה…</option>
                  <option>תמונות</option>
                  <option>קנבסים</option>
                  <option>אלבומים</option>
                  <option>מסגרות</option>
                </Select>
              </Field>
              <Field
                label="מק&quot;ט"
                htmlFor="f-sku"
                error="מק&quot;ט זה כבר קיים במערכת"
              >
                <Input id="f-sku" defaultValue="JP-1024" invalid />
              </Field>
              <Field label="מחיר (₪)" hint="כולל מע&quot;מ" htmlFor="f-price">
                <Input id="f-price" type="number" placeholder="0.00" />
              </Field>
              <Field label="תיאור" className="sm:col-span-2" htmlFor="f-desc">
                <Textarea id="f-desc" placeholder="תיאור המוצר לקטלוג…" />
              </Field>
              <div className="flex items-center gap-6 sm:col-span-2">
                <Switch label="פרסם בקטלוג" defaultChecked />
                <Switch label="מוצר מבצע" />
              </div>
            </CardBody>
            <CardFooter className="justify-end">
              <Button variant="ghost">ביטול</Button>
              <Button variant="gradient">שמירת מוצר</Button>
            </CardFooter>
          </Card>
        </Section>

        {/* Cards */}
        <Section id="cards" title="כרטיסים" subtitle="משטחים מעוגלים עם כותרת, גוף ופוטר.">
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>סך מוצרים</CardTitle>
                <CardDescription>בקטלוג הפעיל</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="text-4xl font-black text-brand-gradient">1,248</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>מלאי נמוך</CardTitle>
                <CardDescription>דורש תשומת לב</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="text-4xl font-black text-accent-500">37</div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>טיוטות</CardTitle>
                <CardDescription>ממתינות לפרסום</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="text-4xl font-black text-ink-400">12</div>
              </CardBody>
              <CardFooter>
                <Button size="sm" variant="subtle" block>
                  צפה בטיוטות
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Table */}
        <Section id="table" title="טבלת מוצרים" subtitle="הרכיב המרכזי של מערכת PIM.">
          <Table>
            <THead>
              <TR>
                <TH>מק&quot;ט</TH>
                <TH>שם מוצר</TH>
                <TH>קטגוריה</TH>
                <TH>מחיר</TH>
                <TH>סטטוס</TH>
              </TR>
            </THead>
            <TBody>
              {[
                { sku: "JP-1024", name: "קנבס משפחתי 40×60", cat: "קנבסים", price: "₪149", tone: "success" as const, status: "במלאי" },
                { sku: "JP-2087", name: "אלבום קלאסי 30 עמ׳", cat: "אלבומים", price: "₪89", tone: "warning" as const, status: "מלאי נמוך" },
                { sku: "JP-3310", name: "מגנט תמונה 10×10", cat: "תמונות", price: "₪12", tone: "danger" as const, status: "אזל" },
                { sku: "JP-4501", name: "מסגרת עץ A4", cat: "מסגרות", price: "₪65", tone: "info" as const, status: "טיוטה" },
              ].map((r) => (
                <TR key={r.sku}>
                  <TD className="font-mono text-ink-500">{r.sku}</TD>
                  <TD className="font-semibold text-ink-900">{r.name}</TD>
                  <TD>{r.cat}</TD>
                  <TD className="font-semibold">{r.price}</TD>
                  <TD>
                    <Badge tone={r.tone} dot>
                      {r.status}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Section>

        {/* Navigation */}
        <Section id="nav" title="ניווט" subtitle="פירורי לחם וטאבים.">
          <Card>
            <CardBody className="space-y-6">
              <Breadcrumbs
                items={[
                  { label: "בית", href: "#" },
                  { label: "קטלוג", href: "#" },
                  { label: "מוצרים" },
                ]}
              />
              <Tabs defaultValue="info">
                <TabsList>
                  <TabsTrigger value="info">פרטים</TabsTrigger>
                  <TabsTrigger value="media">תמונות</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>
                <TabsContent value="info">
                  <p className="text-sm text-muted-foreground">
                    תוכן הטאב &quot;פרטים&quot; — שדות המוצר הבסיסיים.
                  </p>
                </TabsContent>
                <TabsContent value="media">
                  <p className="text-sm text-muted-foreground">
                    תוכן הטאב &quot;תמונות&quot; — גלריית מדיה של המוצר.
                  </p>
                </TabsContent>
                <TabsContent value="seo">
                  <p className="text-sm text-muted-foreground">
                    תוכן הטאב &quot;SEO&quot; — כותרות ותיאורים למנועי חיפוש.
                  </p>
                </TabsContent>
              </Tabs>
            </CardBody>
          </Card>
        </Section>

        {/* Feedback */}
        <Section id="feedback" title="הודעות ומשוב" subtitle="באנרים, התראות וטעינה.">
          <div className="grid gap-3">
            <Alert tone="success" title="המוצר נשמר">
              כל השינויים סונכרנו לקטלוג בהצלחה.
            </Alert>
            <Alert tone="warning" title="מלאי נמוך">
              ל-37 מוצרים נותרו פחות מ-10 יחידות במלאי.
            </Alert>
            <Alert tone="danger" title="שגיאה בשמירה">
              מק&quot;ט זה כבר קיים במערכת. בחר מק&quot;ט אחר.
            </Alert>
            <Alert tone="info" title="טיפ">
              ניתן לייבא מוצרים בכמות גדולה דרך קובץ CSV.
            </Alert>
          </div>
        </Section>

        {/* Avatars, progress, choices */}
        <Section id="misc" title="רכיבים נוספים" subtitle="אווטארים, התקדמות, בחירה וטעינה.">
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>אווטארים</CardTitle>
              </CardHeader>
              <CardBody className="flex items-center gap-4">
                <Avatar name="סיני שפירא" size="lg" />
                <Avatar name="בארי שפירא" />
                <Avatar name="דנה כהן" size="sm" />
                <AvatarGroup>
                  <Avatar name="א ב" size="sm" />
                  <Avatar name="ג ד" size="sm" />
                  <Avatar name="ה ו" size="sm" />
                  <span className="inline-grid size-8 place-items-center rounded-full bg-ink-200 text-xs font-bold text-ink-600 ring-2 ring-surface">
                    +5
                  </span>
                </AvatarGroup>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>התקדמות</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <Progress value={82} showLabel tone="success" />
                <Progress value={45} showLabel tone="brand" />
                <Progress value={15} showLabel tone="warning" />
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>תיבות סימון ובחירה</CardTitle>
              </CardHeader>
              <CardBody className="flex flex-wrap gap-x-8 gap-y-3">
                <Checkbox label="פעיל בקטלוג" defaultChecked />
                <Checkbox label="מוצר מבצע" />
                <Checkbox label="אזל מהמלאי" disabled />
                <div className="flex gap-6">
                  <Radio name="vis" label="ציבורי" defaultChecked />
                  <Radio name="vis" label="פרטי" />
                </div>
                <Tooltip label="מידע נוסף על המוצר">
                  <Badge tone="brand">רחף עליי</Badge>
                </Tooltip>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>מצב טעינה</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* Live demo CTA */}
        <Section id="demo" title="מסך אפליקציה חי" subtitle="כל הרכיבים יחד במסך PIM אמיתי.">
          <Card className="overflow-hidden">
            <CardBody className="flex flex-col items-center justify-between gap-4 bg-brand-gradient sm:flex-row">
              <div className="text-white">
                <h3 className="text-xl font-black">מסך ניהול מוצרים</h3>
                <p className="mt-1 text-white/90">
                  Sidebar · Header · טבלה · מודאל · התראות · תפריטים — חי ואינטראקטיבי.
                </p>
              </div>
              <Link
                href="/products"
                className="focus-ring inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-7 font-display font-bold text-brand-700 shadow-sm transition hover:bg-white/90"
              >
                פתח את המסך ←
              </Link>
            </CardBody>
          </Card>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <Logo variant="wordmark" size="sm" />
          <p className="text-sm text-muted-foreground">
            מערכת עיצוב JACO PIM · נבנתה עם Next.js 16 · Tailwind v4
          </p>
        </div>
      </footer>
    </div>
  );
}
