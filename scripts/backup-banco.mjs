// Backup CONSISTENTE do banco SQLite, mesmo com o FinPlan rodando.
//
//   npm run backup:db
//   npm run backup:db -- --dest "D:\Backups\FinPlan" --keep 60
//
// Por padrão salva em ./backups/finplan-AAAA-MM-DD-HH-MM.db e mantém os 30 mais recentes.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

try {
  process.loadEnvFile(".env.local"); // lê DB_PATH, se estiver definido lá
} catch {
  /* sem .env.local: usa o padrão */
}

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const source = process.env.DB_PATH || path.join(process.cwd(), "data", "finplan.db");
const destDir = path.resolve(opt("--dest", path.join(process.cwd(), "backups")));
const keep = Math.max(1, Number(opt("--keep", "30")) || 30);

if (!fs.existsSync(source)) {
  console.error(`Banco não encontrado: ${source}`);
  process.exit(1);
}
fs.mkdirSync(destDir, { recursive: true });

const d = new Date();
const p2 = (n) => String(n).padStart(2, "0");
const stamp = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}-${p2(d.getHours())}-${p2(d.getMinutes())}`;
const dest = path.join(destDir, `finplan-${stamp}.db`);

const db = new Database(source, { fileMustExist: true });
try {
  await db.backup(dest); // API de backup do SQLite: cópia íntegra com o banco em uso
} finally {
  db.close();
}

// Deixa a cópia como UM único arquivo (sem -wal/-shm) e confere se está íntegra
const check = new Database(dest);
check.pragma("journal_mode = DELETE");
const integrity = check.pragma("integrity_check", { simple: true });
const users = check.prepare("SELECT COUNT(*) AS n FROM users").get().n;
check.close();
if (integrity !== "ok") {
  console.error(`A cópia ficou corrompida (${integrity}). Tente novamente.`);
  process.exit(1);
}

// Mantém só os `keep` backups mais recentes desta pasta
const old = fs
  .readdirSync(destDir)
  .filter((f) => /^finplan-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.db$/.test(f))
  .sort()
  .reverse()
  .slice(keep);
for (const f of old) for (const ext of ["", "-wal", "-shm"]) fs.rmSync(path.join(destDir, f + ext), { force: true });

console.log(`Backup criado: ${dest}`);
console.log(`Contas no backup: ${users} · integridade: ${integrity}${old.length ? ` · ${old.length} backup(s) antigo(s) removido(s)` : ""}`);
