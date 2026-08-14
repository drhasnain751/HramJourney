import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/**
 * Uploads an image to the private `media` bucket, registers it in the media
 * library and returns a long-lived signed URL that can be stored on any record.
 */
export async function uploadImage(file: File, folder = "general"): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be smaller than 10MB.");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) throw upErr;

  const { data: signed, error: signErr } = await supabase.storage
    .from("media")
    .createSignedUrl(path, TEN_YEARS);
  if (signErr) throw signErr;

  const { error: insErr } = await supabase.from("media").insert({
    file_path: path,
    public_url: signed.signedUrl,
    file_name: file.name,
    folder,
    file_size: file.size,
    mime_type: file.type,
  });
  if (insErr) throw insErr;

  return signed.signedUrl;
}

export async function uploadImages(files: FileList | File[], folder = "general") {
  const urls: string[] = [];
  for (const file of Array.from(files)) urls.push(await uploadImage(file, folder));
  return urls;
}
