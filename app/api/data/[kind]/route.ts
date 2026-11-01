import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureDefaultCategories } from "@/lib/seed";
import { onCreate } from "@/lib/dataRules";

const KIND_RE = /^[a-z0-9_-]{1,40}$/;
type Ctx = { params: Promise<{ kind: string }> };

// GET /api/data/rendas  -> lista só os registros do usuário logado
export async function GET(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { kind } = await params;
  if (!KIND_RE.test(kind)) return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });

  if (kind === "categorias") ensureDefaultCategories(user.id);

  const rows = db
    .prepare("SELECT id, payload FROM user_data WHERE user_id = ? AND kind = ? ORDER BY id")
    .all(user.id, kind) as { id: number; payload: string }[];
  return NextResponse.json(rows.map((r) => ({ ...JSON.parse(r.payload), id: String(r.id) })));
}

// POST /api/data/rendas  (corpo = objeto JSON)
export async function POST(req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const { kind } = await params;
  if (!KIND_RE.test(kind)) return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  const rule = onCreate(kind, body, user.id);
  if ("error" in rule) return NextResponse.json({ error: rule.error }, { status: rule.status });
  const payload = JSON.stringify(rule.body);
  if (payload.length > 100_000)
    return NextResponse.json({ error: "Registro grande demais." }, { status: 413 });

  const info = db
    .prepare("INSERT INTO user_data (user_id, kind, payload) VALUES (?,?,?)")
    .run(user.id, kind, payload);
  return NextResponse.json({ ...rule.body, id: String(info.lastInsertRowid) }, { status: 201 });
}
