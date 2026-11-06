import type { CollectionConfig } from "payload";

import { adminOnlyAccess } from "@/lib/collections/fields/base-fields";
import appConfig from "@/lib/core/config";

export const Users: CollectionConfig = {
  slug: "users",
  access: adminOnlyAccess,
  admin: {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
  },
  auth: {
    cookies: {
      secure: appConfig.BASE_URL?.startsWith("https://") ?? false,
      sameSite: "Lax",
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
  timestamps: true,
};
