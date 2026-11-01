// Banco SQLite local: arquivo data/finplan.db na máquina de quem roda o app.
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const globalForDb = globalThis as unknown as { __finplanDb?: Database.Database };

function open() {
  const file = process.env.DB_PATH || path.join(process.cwd(), "data", "finplan.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      gender TEXT NOT NULL CHECK (gender IN ('masculino','feminino','nao_informado')),
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0
    );
    -- Tudo que o usuário inserir (rendas, categorias, metas...) fica aqui, isolado por user_id
    CREATE TABLE IF NOT EXISTS user_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_user_data ON user_data(user_id, kind);
    -- Base de Cálculo do usuário: lista de versões com o mês em que cada uma passa a valer
    CREATE TABLE IF NOT EXISTS calc_config (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      versions TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    -- Marcas por usuário (ex.: categorias padrão já criadas)
    CREATE TABLE IF NOT EXISTS user_flags (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      flag TEXT NOT NULL,
      PRIMARY KEY (user_id, flag)
    );
  `);
  return db;
}

export const db = (globalForDb.__finplanDb ??= open());

export type Gender = "masculino" | "feminino" | "nao_informado";

export type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  gender: Gender;
  username: string;
  email: string;
  password_hash: string;
};
