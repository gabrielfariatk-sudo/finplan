import { db } from "@/lib/db";
import { DEFAULT_VERSIONS, type ConfigVersion } from "@/lib/calcConfig";

/** Versões da Base de Cálculo do usuário. Se ainda não existir, cria com os valores padrão. */
export function getVersions(userId: number): ConfigVersion[] {
  const row = db.prepare("SELECT versions FROM calc_config WHERE user_id = ?").get(userId) as
    | { versions: string }
    | undefined;

  if (!row) {
    db.prepare("INSERT OR IGNORE INTO calc_config (user_id, versions) VALUES (?, ?)").run(
      userId,
      JSON.stringify(DEFAULT_VERSIONS),
    );
    return DEFAULT_VERSIONS;
  }
  try {
    const parsed = JSON.parse(row.versions) as ConfigVersion[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_VERSIONS;
  } catch {
    return DEFAULT_VERSIONS;
  }
}

export function saveVersions(userId: number, versions: ConfigVersion[]) {
  db.prepare(
    `INSERT INTO calc_config (user_id, versions) VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET versions = excluded.versions, updated_at = CURRENT_TIMESTAMP`,
  ).run(userId, JSON.stringify(versions));
}
