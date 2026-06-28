import {
  AppHeader,
  Button,
  Card,
  CardBody,
} from "@/components/ui";
import { ImageIcon, DownloadIcon } from "@/components/icons";

const MEDIA = Array.from({ length: 12 }, (_, i) => i);

export default function MediaPage() {
  return (
    <>
      <AppHeader
        title="מדיה"
        actions={
          <button className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 font-display text-[0.95rem] font-semibold text-white shadow-brand transition hover:brightness-105">
            <DownloadIcon width={18} height={18} />
            העלאת קבצים
          </button>
        }
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Dropzone */}
        <Card className="border-2 border-dashed border-ink-200 bg-surface-muted shadow-none">
          <CardBody className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
              <ImageIcon />
            </span>
            <p className="font-bold text-ink-800">גרור קבצים לכאן או לחץ להעלאה</p>
            <p className="text-sm text-muted-foreground">PNG · JPG · עד 20MB לקובץ</p>
            <Button variant="subtle" size="sm" className="mt-2">בחר קבצים</Button>
          </CardBody>
        </Card>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {MEDIA.map((i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-xl bg-brand-gradient shadow-sm ring-1 ring-border"
              style={{ filter: `hue-rotate(${i * 18}deg)` }}
            >
              <div className="absolute inset-0 grid place-items-center text-white/70">
                <ImageIcon width={28} height={28} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
