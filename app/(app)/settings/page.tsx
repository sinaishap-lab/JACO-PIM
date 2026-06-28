"use client";

import {
  AppHeader,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  Field,
  Input,
  Logo,
  Select,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useToast,
} from "@/components/ui";

const BRAND_SWATCHES = [
  { name: "ורוד", varName: "--color-brand-500" },
  { name: "כתום", varName: "--color-accent-500" },
  { name: "זהב", varName: "--color-gold-500" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  return (
    <>
      <AppHeader
        title="הגדרות"
        actions={
          <Button variant="gradient" onClick={() => toast({ title: "ההגדרות נשמרו", tone: "success" })}>
            שמירה
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="general" className="max-w-3xl">
          <TabsList>
            <TabsTrigger value="general">כללי</TabsTrigger>
            <TabsTrigger value="brand">מיתוג</TabsTrigger>
            <TabsTrigger value="notify">התראות</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader><CardTitle>פרטי העסק</CardTitle></CardHeader>
              <CardBody className="grid gap-5 sm:grid-cols-2">
                <Field label="שם העסק" className="sm:col-span-2"><Input defaultValue="JACO PRINT" /></Field>
                <Field label="אימייל"><Input type="email" dir="ltr" defaultValue="info@jacoprint.com" /></Field>
                <Field label="טלפון"><Input dir="ltr" defaultValue="02-000-0000" /></Field>
                <Field label="שפה">
                  <Select defaultValue="he"><option value="he">עברית</option><option value="en">English</option></Select>
                </Field>
                <Field label="מטבע">
                  <Select defaultValue="ils"><option value="ils">₪ שקל</option><option value="usd">$ דולר</option></Select>
                </Field>
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="brand">
            <Card>
              <CardHeader>
                <CardTitle>זהות מותג</CardTitle>
                <CardDescription>הצבעים והלוגו של JACO PRINT.</CardDescription>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center justify-between rounded-xl bg-surface-muted p-5">
                  <Logo layout="horizontal" size="md" showTagline={false} />
                  <Button variant="outline" size="sm">החלף לוגו</Button>
                </div>
                <div>
                  <div className="mb-3 text-sm font-bold text-ink-700">צבעי מותג</div>
                  <div className="flex gap-4">
                    {BRAND_SWATCHES.map((s) => (
                      <div key={s.varName} className="flex items-center gap-2">
                        <span className="size-9 rounded-lg ring-1 ring-border" style={{ background: `var(${s.varName})` }} />
                        <span className="text-sm font-semibold text-ink-700">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </TabsContent>

          <TabsContent value="notify">
            <Card>
              <CardHeader><CardTitle>העדפות התראות</CardTitle></CardHeader>
              <CardBody className="space-y-4">
                <Switch label="התראה על מלאי נמוך" defaultChecked />
                <Switch label="סיכום הזמנות יומי" defaultChecked />
                <Switch label="עדכוני מערכת במייל" />
                <Switch label="התראות שיווקיות" />
              </CardBody>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
