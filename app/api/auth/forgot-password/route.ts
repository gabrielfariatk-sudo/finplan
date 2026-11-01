import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, type UserRow } from "@/lib/db";
import { sendResetEmail } from "@/lib/mailer";

const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";

  const user = email
    ? (db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined)
    : undefined;

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    db.prepare("INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?,?,?)").run(
      user.id,
      sha256(token),
      Date.now() + 60 * 60 * 1000,
    );
    const base = process.env.APP_URL || "http://localhost:3000";
    try {
      await sendResetEmail(user.email, user.first_name, `${base}/redefinir-senha?token=${token}`);
    } catch (e) {
      console.error("[FinPlan] Falha ao enviar e-mail:", e);
    }
  }
  // Mesma resposta exista ou não a conta (não revela e-mails cadastrados)
  return NextResponse.json({ ok: true });
}
