import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const token = typeof b.token === "string" ? b.token : "";
  const password = typeof b.password === "string" ? b.password : "";
  const confirm = typeof b.confirmPassword === "string" ? b.confirmPassword : "";

  if (password.length < 8)
    return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
  if (password !== confirm)
    return NextResponse.json({ error: "As senhas não coincidem." }, { status: 400 });

  const row = db
    .prepare("SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > ?")
    .get(sha256(token), Date.now()) as { user_id: number } | undefined;
  if (!row)
    return NextResponse.json({ error: "Link inválido ou expirado. Peça um novo." }, { status: 400 });

  const hash = await bcrypt.hash(password, 12);
  db.transaction(() => {
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, row.user_id);
    db.prepare("UPDATE password_resets SET used = 1 WHERE user_id = ?").run(row.user_id);
  })();
  return NextResponse.json({ ok: true });
}
