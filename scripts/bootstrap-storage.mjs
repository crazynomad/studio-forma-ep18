// Only uploads bundled, public demo images. Never imports credentials or resets a database.
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

if (process.env.STORAGE_PROVIDER !== "supabase") {
  console.log("Supabase demo-media bootstrap skipped (provider not selected).");
  process.exit(0);
}
const client = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const name = process.env.SUPABASE_STORAGE_BUCKET || "studio-media";
const { data: buckets, error: listError } = await client.storage.listBuckets();
if (listError)
  throw new Error("Cannot inspect Storage; check the server-side integration.");
const existing = buckets.find((b) => b.id === name);
if (existing && !existing.public)
  throw new Error("Target bucket is private; refusing to change access.");
if (!existing) {
  const { error } = await client.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 6 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  });
  if (error) throw new Error("Cannot create the demo image bucket.");
}
const manifest = JSON.parse(
  await readFile(new URL("../deployment-media/manifest.json", import.meta.url)),
);
let uploaded = 0,
  skipped = 0;
for (const item of manifest) {
  const bytes = await readFile(
    new URL(`../deployment-media/${item.path}`, import.meta.url),
  );
  if (createHash("sha256").update(bytes).digest("hex") !== item.sha256) {
    throw new Error("Bundled demo image checksum failed.");
  }
  const { error } = await client.storage.from(name).upload(item.key, bytes, {
    contentType: item.mimeType,
    cacheControl: "3600",
    upsert: false,
  });
  if (!error) uploaded++;
  else if (
    String(error.statusCode) === "409" ||
    error.message === "The resource already exists"
  )
    skipped++;
  else throw new Error(`Demo image upload failed: ${error.message}`);
}
console.log(
  JSON.stringify({
    demoMedia: { uploaded, alreadyPresent: skipped },
    bucket: name,
  }),
);
