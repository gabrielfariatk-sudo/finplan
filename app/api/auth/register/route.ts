import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, type UserRow } from "@/lib/db";
import { COOKIE_NAME, sessionCookieOptions, signSession } from "@/lib/session";
import { toSessionUser } from "@/lib/auth";
import { EMAIL_RE, GENDERS, USER_RE } from "@/lib/validation";
import { seedNewUser } from "@/lib/seed";


const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const firstName = str(b.firstName);
  const lastName = str(b.lastName);
  const username = str(b.username);
  const email = str(b.email).toLowerCase();
  const password = typeof b.password === "string" ? b.password : "";
  const confirmPassword = typeof b.confirmPassword === "string" ? b.confirmPassword : "";
  const gender = str(b.gender);

  const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

  if (!firstName || !lastName || !username || !email || !password)
    return bad("Preencha todos os campos.");
  if (!GENDERS.includes(gender)) return bad("Selecione uma opção de sexo.");
  if (!EMAIL_RE.test(email)) return bad("E-mail inválido.");
  if (!USER_RE.test(username))
    return bad("Usuário: 3 a 30 caracteres (letras, números, ponto, hífen ou _).");
  if (password.length < 8) return bad("A senha deve ter pelo menos 8 caracteres.");
  if (password !== confirmPassword) return bad("As senhas não coincidem.");

  const exists = db
    .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .get(username, email);
  if (exists) return bad("Usuário ou e-mail já cadastrado.", 409);

  const hash = await bcrypt.hash(password, 12); // senha criptografada (bcrypt + salt)
  const info = db
    .prepare(
      "INSERT INTO users (first_name,last_name,gender,username,email,password_hash) VALUES (?,?,?,?,?,?)",
    )
    .run(firstName, lastName, gender, username, email, hash);

  seedNewUser(Number(info.lastInsertRowid)); // categorias padrão + Base de Cálculo

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as UserRow;
  const res = NextResponse.json({ user: toSessionUser(row) }, { status: 201 });
  res.cookies.set(COOKIE_NAME, await signSession(row.id), sessionCookieOptions());
  return res;
}
