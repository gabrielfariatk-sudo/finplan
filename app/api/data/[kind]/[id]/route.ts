import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { onDelete, onUpdate } from "@/lib/dataRules";

const KIND_RE = /^[a-z0-9_-]{1,40}$/;
type Ctx = { params: Promise<{ kind: string; id: string }> };

async function guard(params: Ctx["params"]) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const { kind, id } = await params;
  if (!KIND_RE.test(kind) || !/^\d+$/.test(id))
    return { error: NextResponse.json({ error: "Requisição inválida." }, { status: 400 }) };
  return { user, kind, id: Number(id) };
}

function findExisting(userId: number, kind: string, id: number) {
  const row = db
    .prepare("SELECT payload FROM user_data WHERE id = ? AND user_id = ? AND kind = ?")
    .get(id, userId, kind) as { payload: string } | undefined;
  return row ? (JSON.parse(row.payload) as Record<string, unknown>) : null;
}

// PUT /api/data/rendas/12  (substitui o registro; só se for do usuário logado)
export async function PUT(req: Request, { params }: Ctx) {
  const g = await guard(params);
  if (g.error) return g.error;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });

  const existing = findExisting(g.user!.id, g.kind!, g.id!);
  if (!existing) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const rule = onUpdate(g.kind!, body, existing);
  if ("error" in rule) return NextResponse.json({ error: rule.error }, { status: rule.status });

  db.prepare(
    "UPDATE user_data SET payload = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND kind = ?",
  ).run(JSON.stringify(rule.body), g.id, g.user!.id, g.kind);
  return NextResponse.json({ ...rule.body, id: String(g.id) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await guard(params);
  if (g.error) return g.error;

  const existing = findExisting(g.user!.id, g.kind!, g.id!);
  if (existing) {
    const blocked = onDelete(g.kind!, existing);
    if (blocked) return NextResponse.json({ error: blocked.error }, { status: blocked.status });
  }
  db.prepare("DELETE FROM user_data WHERE id = ? AND user_id = ? AND kind = ?").run(
    g.id,
    g.user!.id,
    g.kind,
  );
  return NextResponse.json({ ok: true });
}
