import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getCurrentUserRow, toSessionUser } from "@/lib/auth";
import { createLimiter } from "@/lib/rateLimit";
import { EMAIL_RE, GENDERS, USER_RE } from "@/lib/validation";
import type { UserRow } from "@/lib/db";

const limiter = createLimiter(5);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Atualiza os dados da conta. Exige a SENHA ATUAL para autenticar a alteração.
export async function PATCH(req: Request) {
  const me = await getCurrentUserRow();
  if (!me) return bad("Não autenticado.", 401);

  const b = await req.json().catch(() => ({}));
  const currentPassword = typeof b.currentPassword === "string" ? b.currentPassword : "";
  if (!currentPassword) return bad("Digite sua senha atual para salvar as alterações.");

  const key = `account:${me.id}`;
  if (limiter.blocked(key)) return bad("Muitas tentativas. Tente novamente em alguns minutos.", 429);
  if (!(await bcrypt.compare(currentPassword, me.password_hash))) {
    limiter.fail(key);
    return bad("Senha atual incorreta.", 403);
  }
  limiter.reset(key);

  const firstName = str(b.firstName);
  const lastName = str(b.lastName);
  const username = str(b.username);
  const email = str(b.email).toLowerCase();
  const gender = str(b.gender);
  const newPassword = typeof b.newPassword === "string" ? b.newPassword : "";
  const confirmNewPassword = typeof b.confirmNewPassword === "string" ? b.confirmNewPassword : "";

  if (!firstName || !lastName || !username || !email) return bad("Preencha todos os campos.");
  if (!GENDERS.includes(gender)) return bad("Selecione uma opção de sexo.");
  if (!EMAIL_RE.test(email)) return bad("E-mail inválido.");
  if (!USER_RE.test(username))
    return bad("Usuário: 3 a 30 caracteres (letras, números, ponto, hífen ou _).");

  if (newPassword) {
    if (newPassword.length < 8) return bad("A nova senha deve ter pelo menos 8 caracteres.");
    if (newPassword !== confirmNewPassword) return bad("As novas senhas não coincidem.");
  }

  const taken = db
    .prepare("SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?")
    .get(username, email, me.id);
  if (taken) return bad("Usuário ou e-mail já está em uso por outra conta.", 409);

  const hash = newPassword ? await bcrypt.hash(newPassword, 12) : me.password_hash;
  db.prepare(
    "UPDATE users SET first_name=?, last_name=?, gender=?, username=?, email=?, password_hash=? WHERE id=?",
  ).run(firstName, lastName, gender, username, email, hash, me.id);

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(me.id) as UserRow;
  return NextResponse.json({ user: toSessionUser(row), passwordChanged: Boolean(newPassword) });
}
