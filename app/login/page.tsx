"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Field,
  Input,
  Logo,
} from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:flex">
        <Logo variant="wordmark" size="md" className="[&_*]:!text-white" />
        <div>
          <h2 className="text-4xl font-black leading-tight">ניהול מוצרים,<br />פשוט יותר.</h2>
          <p className="mt-4 max-w-sm text-white/90">
            מערכת ה‑PIM של JACO PRINT — כל המידע על המוצרים שלך במקום אחד. מהיר, מקומי, פשוט.
          </p>
        </div>
        <p className="text-sm text-white/70">© JACO PRINT · LOCAL · FAST · SIMPLE</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-surface-muted p-6">
        <Card className="w-full max-w-sm">
          <CardBody className="space-y-6 p-8">
            <div className="flex flex-col items-center gap-2 text-center lg:hidden">
              <Logo size="md" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-ink-900">ברוכים השבים</h1>
              <p className="mt-1 text-sm text-muted-foreground">התחבר לחשבון JACO PIM שלך</p>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/");
              }}
            >
              <Field label="אימייל" htmlFor="email">
                <Input id="email" type="email" dir="ltr" placeholder="you@jacoprint.com" />
              </Field>
              <Field label="סיסמה" htmlFor="pw">
                <Input id="pw" type="password" dir="ltr" placeholder="••••••••" />
              </Field>
              <div className="flex items-center justify-between">
                <Checkbox label="זכור אותי" defaultChecked />
                <a href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-700">שכחת סיסמה?</a>
              </div>
              <Button type="submit" variant="gradient" size="lg" block>
                התחברות
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
