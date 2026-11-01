import { cookies } from "next/headers";
import { db, type UserRow } from "@/lib/db";
import { COOKIE_NAME, verifySession } from "@/lib/session";
import type { SessionUser } from "@/lib/welcome";

export function toSessionUser(u: UserRow): SessionUser {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    gender: u.gender,
    username: u.username,
    email: u.email,
  };
}

/** Linha completa do usuário logado (inclui o hash da senha). Só para uso no servidor. */
export async function getCurrentUserRow(): Promise<UserRow | null> {
  const store = await cookies();
  const id = await verifySession(store.get(COOKIE_NAME)?.value);
  if (!id) return null;
  return (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined) ?? null;
}

/** Usuário logado (ou null). Use em Server Components e Route Handlers. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const row = await getCurrentUserRow();
  return row ? toSessionUser(row) : null;
}
