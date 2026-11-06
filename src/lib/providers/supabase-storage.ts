import { readFile } from "node:fs/promises";

import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { createClient } from "@supabase/supabase-js";

import type { Adapter } from "@payloadcms/plugin-cloud-storage/types";

import appConfig from "@/lib/core/config";

// This module is only loaded by the server-side Payload configuration.
// The Marketplace integration supplies the secret directly to Vercel.
export function supabaseStorage() {
  if (!appConfig.SUPABASE_URL || !appConfig.SUPABASE_SECRET_KEY) {
    throw new Error(
      "Connect the Supabase integration to this Vercel environment first.",
    );
  }
  const client = createClient(
    appConfig.SUPABASE_URL,
    appConfig.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  const bucket = client.storage.from(appConfig.SUPABASE_STORAGE_BUCKET);
  const publicUrl = (key: string) => bucket.getPublicUrl(key).data.publicUrl;
  const adapter: Adapter = ({ prefix = "" }) => ({
    name: "supabase",
    generateURL: ({ filename, prefix: storedPrefix }) =>
      publicUrl(`${storedPrefix || prefix}/${filename}`),
    async handleUpload({ data, file, storageFilePath }) {
      const bytes = file.tempFilePath
        ? await readFile(file.tempFilePath)
        : file.buffer;
      const { error } = await bucket.upload(storageFilePath, bytes, {
        contentType: file.mimeType,
        cacheControl: "3600",
        upsert: true,
      });
      if (error)
        throw new Error(`Supabase media upload failed: ${error.message}`);
      return data;
    },
    async handleDelete({ storageFilePath }) {
      const { error } = await bucket.remove([storageFilePath]);
      if (error)
        throw new Error(`Supabase media deletion failed: ${error.message}`);
    },
    staticHandler: (_req, { params }) =>
      Response.redirect(
        publicUrl(`${params.prefix || prefix}/${params.filename}`),
      ),
  });

  return cloudStoragePlugin({
    collections: Object.fromEntries(
      ["media", "seo-media", "gallery-media"].map((slug) => [
        slug,
        {
          adapter,
          prefix: `${appConfig.BUCKET_PREFIX}/${slug}`,
          disableLocalStorage: true,
          disablePayloadAccessControl: true,
        },
      ]),
    ),
  });
}
