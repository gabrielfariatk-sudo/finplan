import { db } from "@/lib/db";
import { DEFAULT_CATEGORY_DATA, normalizeName } from "@/lib/categoryDefaults";
import { isCategoryGroup } from "@/lib/categoryGroups";
import { getVersions } from "@/lib/calcConfigStore";

const DEFAULT_BY_NAME = new Map(DEFAULT_CATEGORY_DATA.map((c) => [normalizeName(c.name), c]));

/**
 * Garante as categorias padrão (classificadas em Necessidade, Desejo e Investimento).
 *  - conta nova: cria todas, marcadas como "system" (não podem ser apagadas);
 *  - conta antiga (criada antes dos grupos): classifica as existentes, devolve as que
 *    faltam e define um grupo para as personalizadas (Desejo).
 * É síncrono, então não duplica mesmo com requisições simultâneas.
 */
export function ensureDefaultCategories(userId: number) {
  db.transaction(() => {
    const flag = db.prepare("INSERT OR IGNORE INTO user_flags (user_id, flag) VALUES (?, ?)");
    const isNew = flag.run(userId, "categorias-padrao").changes === 1;
    const needsMigration = flag.run(userId, "categorias-grupos-v2").changes === 1;
    const insert = db.prepare("INSERT INTO user_data (user_id, kind, payload) VALUES (?,?,?)");
    const addDefault = (c: (typeof DEFAULT_CATEGORY_DATA)[number]) =>
      insert.run(userId, "categorias", JSON.stringify({ ...c, system: true }));

    if (isNew) {
      DEFAULT_CATEGORY_DATA.forEach(addDefault);
      return;
    }
    if (!needsMigration) return;

    const rows = db
      .prepare("SELECT id, payload FROM user_data WHERE user_id = ? AND kind = 'categorias' ORDER BY id")
      .all(userId) as { id: number; payload: string }[];
    const update = db.prepare("UPDATE user_data SET payload = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    const adopted = new Set<string>();

    for (const row of rows) {
      const p = JSON.parse(row.payload) as Record<string, unknown>;
      const key = normalizeName(String(p.name ?? ""));
      const def = DEFAULT_BY_NAME.get(key);
      if (def) {
        p.group = def.group;
        if (!adopted.has(key)) {
          p.system = true;
          adopted.add(key);
        } else delete p.system;
      } else {
        if (!isCategoryGroup(p.group)) p.group = "desejo";
        delete p.system;
      }
      update.run(JSON.stringify(p), row.id);
    }
    DEFAULT_CATEGORY_DATA.filter((c) => !adopted.has(normalizeName(c.name))).forEach(addDefault);
  })();
}

/** Tudo que uma conta recebe ao ser criada. */
export function seedNewUser(userId: number) {
  ensureDefaultCategories(userId);
  getVersions(userId); // cria a Base de Cálculo padrão
}
