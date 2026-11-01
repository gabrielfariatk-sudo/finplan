import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  applyConfigChange,
  cancelPending,
  configForMonth,
  latestVersion,
  monthKey,
  pendingChange,
  validateCalcInput,
  type ConfigScope,
  type ConfigVersion,
} from "@/lib/calcConfig";
import { getVersions, saveVersions } from "@/lib/calcConfigStore";

const unauth = () => NextResponse.json({ error: "Não autenticado." }, { status: 401 });

function payload(versions: ConfigVersion[]) {
  const now = new Date();
  return {
    versions,
    current: configForMonth(versions, monthKey(now)), // vale hoje
    latest: latestVersion(versions).config, // o que o formulário edita
    pendingFrom: pendingChange(versions, now)?.from ?? null, // alteração agendada, se houver
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauth();
  return NextResponse.json(payload(getVersions(user.id)));
}

// PUT { values: {...7 números inteiros}, scope: "all" | "next-month" }
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauth();

  const body = await req.json().catch(() => ({}));
  const scope = body.scope as ConfigScope;
  if (scope !== "all" && scope !== "next-month")
    return NextResponse.json({ error: "Escolha como aplicar: todas as informações ou a partir do mês seguinte." }, { status: 400 });

  const v = validateCalcInput(body.values);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const versions = applyConfigChange(getVersions(user.id), v.config, scope);
  saveVersions(user.id, versions);
  return NextResponse.json(payload(versions));
}

// Cancela a alteração agendada para o mês seguinte
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return unauth();
  const versions = cancelPending(getVersions(user.id));
  saveVersions(user.id, versions);
  return NextResponse.json(payload(versions));
}
