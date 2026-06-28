import Link from "next/link";
import { Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-muted p-6 text-center">
      <Logo size="lg" />
      <div>
        <div className="text-7xl font-black text-brand-gradient">404</div>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">הדף לא נמצא</h1>
        <p className="mt-1 text-muted-foreground">הדף שחיפשת אינו קיים או הוסר.</p>
      </div>
      <Link
        href="/"
        className="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-brand-gradient px-8 font-display font-semibold text-white shadow-brand transition hover:brightness-105"
      >
        חזרה לדשבורד
      </Link>
    </div>
  );
}
