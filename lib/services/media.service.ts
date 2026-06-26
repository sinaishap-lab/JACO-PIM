import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Media service — uploads product images to Supabase Storage and records them
 * in `media_assets`. Server-only (uses the service-role admin client).
 */

const BUCKET = "product-media";

/** Uploads an image buffer and creates its media_assets row. */
export async function uploadProductImage(
  buffer: Buffer,
  contentType: string
): Promise<{ mediaId: string; url: string }> {
  const supabase = createAdminClient();

  // Ensure the bucket exists (idempotent — ignore "already exists").
  await supabase.storage.createBucket(BUCKET, { public: true });

  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      bucket_path: path,
      url: publicUrl,
      mime_type: contentType,
      size_bytes: buffer.length,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  return { mediaId: data.id as string, url: publicUrl };
}

/** Links a media asset to a product. */
export async function linkProductMedia(
  productId: string,
  mediaId: string
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_media")
    .insert({ product_id: productId, media_id: mediaId, position: 0 });
  if (error) throw new Error(error.message);
}
