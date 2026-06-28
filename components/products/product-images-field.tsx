"use client";

import { useRef, useState } from "react";
import { Star, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export interface ProductImageRow {
  url: string;
  isPrimary: boolean;
}

const BUCKET = "product-images";

export function ProductImagesField({
  defaultImages = [],
}: {
  defaultImages?: ProductImageRow[];
}) {
  const [images, setImages] = useState<ProductImageRow[]>(() =>
    defaultImages.length
      ? defaultImages
      : []
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Guarantee exactly one primary image.
  const normalize = (arr: ProductImageRow[]): ProductImageRow[] => {
    if (arr.length === 0) return arr;
    if (arr.some((i) => i.isPrimary)) return arr;
    return arr.map((i, idx) => ({ ...i, isPrimary: idx === 0 }));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    try {
      const added: ProductImageRow[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw new Error(upErr.message);
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        added.push({ url: data.publicUrl, isPrimary: false });
      }
      setImages((prev) => normalize([...prev, ...added]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהעלאת התמונה");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const setPrimary = (url: string) =>
    setImages((prev) => prev.map((i) => ({ ...i, isPrimary: i.url === url })));

  const remove = (url: string) =>
    setImages((prev) => normalize(prev.filter((i) => i.url !== url)));

  return (
    <div className="space-y-3">
      {/* Submitted with the product form. */}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading ? "מעלה…" : "העלאת תמונות"}
        </Button>
        <span className="text-muted-foreground text-xs">
          התמונה הראשית מסומנת בכוכב — תופיע על מדבקת הארגז
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-destructive text-sm">{error}</p>}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div
              key={img.url}
              className={`relative size-28 overflow-hidden rounded-md border ${
                img.isPrimary ? "ring-primary ring-2" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="size-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 p-1">
                <button
                  type="button"
                  aria-label="קבע כתמונה ראשית"
                  title="תמונה ראשית"
                  onClick={() => setPrimary(img.url)}
                >
                  <Star
                    className={`size-4 ${
                      img.isPrimary
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-white"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  aria-label="מחיקת תמונה"
                  title="מחיקה"
                  onClick={() => remove(img.url)}
                >
                  <Trash2 className="size-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
