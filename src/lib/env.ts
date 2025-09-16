export type TursoEnv = {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
};

export function readTursoEnv(platform?: { env?: Record<string, string> }): TursoEnv {
  const pe = platform?.env ?? {};
  return {
    TURSO_DATABASE_URL: pe.TURSO_DATABASE_URL ?? process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: pe.TURSO_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN,
  };
}
