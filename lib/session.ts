// Sessão via JWT (cookie httpOnly). Este arquivo NÃO importa o banco,
// para poder ser usado também pelo proxy.ts.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "finplan_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

let cachedKey: Uint8Array | null = null;

function getSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  // Sem AUTH_SECRET no .env.local: gera um segredo e guarda na pasta data/ (local)
  const dir = path.join(process.cwd(), "data");
  const file = path.join(dir, "auth-secret.key");
  fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, crypto.randomBytes(48).toString("hex"), { mode: 0o600 });
  }
  return fs.readFileSync(file, "utf8");
}

function key() {
  return (cachedKey ??= new TextEncoder().encode(getSecret()));
}

export async function signSession(userId: number) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(key());
}

/** Retorna o id do usuário se o token for válido, senão null. */
export async function verifySession(token: string | undefined): Promise<number | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "true", // use true só se servir via HTTPS
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}
