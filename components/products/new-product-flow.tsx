"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Sparkles, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductForm } from "./product-form";
import {
  analyzeImageAction,
  createProductAction,
  type AnalyzeImageResult,
} from "@/app/(dashboard)/products/actions";

type Analyzed = Extract<AnalyzeImageResult, { ok: true }>;

/** Downscale a photo client-side before upload (smaller, faster, cheaper). */
function resizeImage(file: File, max = 1280): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > max || height > max) {
        const scale = Math.min(max / width, max / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas לא נתמך"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("נכשלה המרת התמונה"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("טעינת התמונה נכשלה"));
    };
    img.src = url;
  });
}

export function NewProductFlow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analyzed | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    try {
      const blob = await resizeImage(file);
      const formData = new FormData();
      formData.append(
        "image",
        new File([blob], "product.jpg", { type: "image/jpeg" })
      );
      const res = await analyzeImageAction(formData);
      if (res.ok) {
        setResult(res);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעיבוד התמונה");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />

          {result?.url && (
            <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-lg border">
              <Image
                src={result.url}
                alt={result.name}
                fill
                sizes="320px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => inputRef.current?.click()}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <Loader2 className="animate-spin" />
                מנתח את התמונה…
              </>
            ) : result ? (
              <>
                <RefreshCw />
                צילום מחדש
              </>
            ) : (
              <>
                <Camera />
                צלם או העלה תמונה
              </>
            )}
          </Button>

          {!result && !analyzing && (
            <p className="text-muted-foreground text-center text-sm">
              צלמו את המוצר והמערכת תמלא את הפרטים אוטומטית. אפשר גם למלא ידנית
              למטה.
            </p>
          )}

          {error && (
            <p className="text-destructive text-center text-sm">{error}</p>
          )}

          {result && (result.category || result.attributes.length > 0) && (
            <div className="space-y-2 border-t pt-4">
              <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <Sparkles className="size-3.5" />
                הצעות AI (יחוברו לקטגוריות ומאפיינים בהמשך)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.category && (
                  <Badge variant="secondary">{result.category}</Badge>
                )}
                {result.attributes.map((attr) => (
                  <Badge key={attr} variant="outline">
                    {attr}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductForm
        key={result?.mediaId ?? "empty"}
        action={createProductAction}
        defaults={
          result ? { name: result.name, description: result.description } : undefined
        }
        mediaId={result?.mediaId}
      />
    </div>
  );
}
