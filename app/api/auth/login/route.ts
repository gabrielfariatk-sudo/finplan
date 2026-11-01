import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, type UserRow } from "@/lib/db";
import { COOKIE_NAME, sessionCookieOptions, signSession } from "@/lib/session";
import { toSessionUser } from "@/lib/auth";
import { createLimiter } from "@/lib/rateLimit";

// 5 erros por usuário+IP a cada 10 minutos
const limiter = createLimiter(5);

// Hash falso para gastar o mesmo tempo quando o usuário não existe
const DUMMY = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5pQe0iXqW2j8zq4G8bW9r5m2uY1lX1y";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const login = typeof b.login === "string" ? b.login.trim() : "";
  const password = typeof b.password === "string" ? b.password : "";
  if (!login || !password)
    return NextResponse.json({ error: "Informe usuário e senha." }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const key = `${login.toLowerCase()}|${ip}`;
  if (limiter.blocked(key))
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    );

  const row = db
    .prepare("SELECT * FROM users WHERE username = ? OR email = ?")
    .get(login, login) as UserRow | undefined;

  const ok = await bcrypt.compare(password, row?.password_hash ?? DUMMY);
  if (!row || !ok) {
    limiter.fail(key);
    return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
  }

  limiter.reset(key);
  const res = NextResponse.json({ user: toSessionUser(row) });
  res.cookies.set(COOKIE_NAME, await signSession(row.id), sessionCookieOptions());
  return res;
}
