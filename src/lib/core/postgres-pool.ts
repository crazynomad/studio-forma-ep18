import { supabaseCA } from "./supabase-ca";

export function postgresPoolOptions(connectionString: string, max: number) {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(
      "Configure DATABASE_URL or the integration's POSTGRES_URL.",
    );
  }
  if (
    !url.hostname.endsWith(".supabase.com") &&
    !url.hostname.endsWith(".supabase.co")
  ) {
    return { connectionString, max };
  }

  // pg's URL SSL parameters replace the explicit ssl object, so remove them
  // before supplying Supabase's public CA with full verification enabled.
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey", "ssl"]) {
    url.searchParams.delete(key);
  }
  return {
    connectionString: url.href,
    max,
    ssl: { ca: supabaseCA, rejectUnauthorized: true },
  };
}
