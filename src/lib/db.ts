import type { Client } from "@libsql/client";
import type { TursoEnv } from "./env";

let client: Client | null = null;

export async function getDb(env: TursoEnv): Promise<Client> {
  if (client) return client;

  const url = env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL manquant");
  const authToken = env.TURSO_AUTH_TOKEN;

  const mod =
    typeof process !== "undefined" && process.versions?.node
      ? await import("@libsql/client")
      : await import("@libsql/client/web");

  client = mod.createClient({ url, authToken });
  return client;
}
