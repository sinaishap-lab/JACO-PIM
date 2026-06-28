"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AppHeader,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Progress,
  Select,
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
  TabsContent,
  Textarea,
  useToast,
} from "@/components/ui";
import { ImageIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { findProduct, STATUS_META } from "../../_data";

export default function ProductDetailPage() {
  const params = useParams<{ sku: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const product = findProduct(params.sku);

  if (!product) {
    return (
      <>
        <AppHeader title="מוצר לא נמצא" />
        <main className="flex-1 overflow-y-auto p-6">
          <EmptyState
            icon={<ImageIcon width={28} height={28} />}
            title="המוצר לא נמצא"
            description={`לא קיים מוצר עם מק״ט ${params.sku}.`}
            action={<Link href="/products"><Button variant="gradient">חזרה למוצרים</Button></Link>}
          />
        </main>
      </>
    );
  }

  const meta = STATUS_META[product.status];

  return (
    <>
      <AppHeader
        title={product.name}
        actions={
          <>
            <Link href="/products"><Button variant="ghost">חזרה</Button></Link>
            <Button
              variant="gradient"
              onClick={() => toast({ title: "נשמר", description: "פרטי המוצר עודכנו", tone: "success" })}
            >
              שמירת שינויים
            </Button>
          </>
        }
      />

      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: "בית", href: "/" },
              { label: "מוצרים", href: "/products" },
              { label: product.name },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-ink-500">{product.sku}</span>
            <Badge tone={meta.tone} dot>{meta.label}</Badge>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">פרטים</TabsTrigger>
            <TabsTrigger value="media">תמונות</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="stock">מלאי</TabsTrigger>
          </TabsList>

          {/* Details */}
          <TabsContent value="details">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>פרטי מוצר</CardTitle></CardHeader>
                <CardBody className="grid gap-5 sm:grid-cols-2">
                  <Field label="שם המוצר" required className="sm:col-span-2">
                    <Input defaultValue={product.name} />
                  </Field>
                  <Field label="מק״ט"><Input defaultValue={product.sku} /></Field>
                  <Field label="קטגוריה">
                    <Select defaultValue={product.category}>
                      <option>קנבסים</option>
                      <option>אלבומים</option>
                      <option>תמונות</option>
                      <option>מסגרות</option>
                      <option>מתנות</option>
                    </Select>
                  </Field>
                  <Field label="מחיר (₪)"><Input type="number" defaultValue={product.price} /></Field>
                  <Field label="מלאי"><Input type="number" defaultValue={product.stock} /></Field>
                  <Field label="תיאור" className="sm:col-span-2">
                    <Textarea defaultValue="תיאור המוצר לקטלוג…" />
                  </Field>
                </CardBody>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>פרסום</CardTitle></CardHeader>
                  <CardBody className="space-y-4">
                    <Switch label="פרסם בקטלוג" defaultChecked={product.status !== "draft"} />
                    <Switch label="מוצר מבצע" />
                    <Switch label="מוצר מומלץ" />
                  </CardBody>
                </Card>
                <Card className="border-danger/30">
                  <CardHeader>
                    <CardTitle className="text-danger">אזור מסוכן</CardTitle>
                    <CardDescription>מחיקת מוצר היא פעולה בלתי הפיכה.</CardDescription>
                  </CardHeader>
                  <CardBody>
                    <Button variant="danger" block leftIcon={<TrashIcon width={16} height={16} />} onClick={() => setConfirmDelete(true)}>
                      מחיקת מוצר
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader><CardTitle>גלריית תמונות</CardTitle></CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="aspect-square rounded-xl bg-brand-gradient opacity-90" style={{ filter: `hue-rotate(${i * 12}deg)` }} />
                  ))}
                  <button className="focus-ring grid aspect-square place-items-center rounded-xl border-2 border-dashed border-ink-200 text-ink-400 transition-colors hover:border-brand-300 hover:text-brand-500">
                    <PlusIcon />
                  </button>
                </div>
              </CardBody>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader><CardTitle>אופטימיזציה למנועי חיפוש</CardTitle></CardHeader>
              <CardBody className="grid gap-5">
                <Field label="כותרת SEO" hint="עד 60 תווים מומלץ">
                  <Input defaultValue={`${product.name} | JACO PRINT`} />
                </Field>
                <Field label="תיאור Meta" hint="עד 160 תווים מומלץ">
                  <Textarea defaultValue={`הזמינו ${product.name} בהדפסה איכותית — מהיר, מקומי, פשוט.`} />
                </Field>
                <Field label="כתובת URL ידידותית">
                  <Input dir="ltr" defaultValue={`/p/${product.sku.toLowerCase()}`} />
                </Field>
              </CardBody>
            </Card>
          </TabsContent>

          {/* Stock */}
          <TabsContent value="stock">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle>מצב מלאי</CardTitle></CardHeader>
                <CardBody className="space-y-3">
                  <div className="text-4xl font-black text-brand-gradient">{product.stock}</div>
                  <Progress value={product.stock} showLabel tone={product.stock === 0 ? "danger" : product.stock < 20 ? "warning" : "success"} />
                </CardBody>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>תנועות מלאי</CardTitle></CardHeader>
                <CardBody className="p-0">
                  <Table className="border-0 shadow-none">
                    <THead>
                      <TR><TH>תאריך</TH><TH>פעולה</TH><TH>כמות</TH></TR>
                    </THead>
                    <TBody>
                      {[
                        { d: "12/06", a: "קליטת מלאי", q: "+50", t: "success" as const },
                        { d: "08/06", a: "מכירה", q: "-12", t: "danger" as const },
                        { d: "01/06", a: "ספירת מלאי", q: "±0", t: "info" as const },
                      ].map((r, i) => (
                        <TR key={i}>
                          <TD className="font-mono text-ink-500">{r.d}</TD>
                          <TD>{r.a}</TD>
                          <TD><Badge tone={r.t}>{r.q}</Badge></TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="מחיקת מוצר"
        description={`האם למחוק את "${product.name}"? פעולה זו אינה הפיכה.`}
        confirmLabel="מחק מוצר"
        destructive
        onConfirm={() => {
          setConfirmDelete(false);
          toast({ title: "המוצר נמחק", description: product.name, tone: "danger" });
          router.push("/products");
        }}
      />
    </>
  );
}
