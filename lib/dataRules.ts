// Regras de negócio aplicadas no SERVIDOR antes de gravar (o cliente não pode burlar).
import { db } from "@/lib/db";
import { isCategoryGroup } from "@/lib/categoryGroups";
import { validateReserve } from "@/lib/reserve";

type Body = Record<string, unknown>;
export type RuleOk = { body: Body };
export type RuleErr = { error: string; status: number };

const err = (error: string, status = 400): RuleErr => ({ error, status });
const HEX = /^#[0-9a-fA-F]{6}$/;

function checkCategory(body: Body, existing: Body | null): RuleOk | RuleErr {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const icon = typeof body.icon === "string" ? body.icon : "";
  const color = typeof body.color === "string" ? body.color : "";
  if (!name || name.length > 24) return err("Informe um nome de até 24 caracteres.");
  if (!icon || icon.length > 30) return err("Ícone inválido.");
  if (!HEX.test(color)) return err("Cor inválida.");

  // Categoria padrão: o grupo e a marca "system" são sempre os do banco
  if (existing?.system === true) {
    return { body: { name, icon, color, group: existing.group, system: true } };
  }
  if (!isCategoryGroup(body.group)) return err("Escolha o grupo da categoria: Necessidade, Desejo ou Investimento.");
  return { body: { name, icon, color, group: body.group } };
}

export function onCreate(kind: string, body: Body, userId: number): RuleOk | RuleErr {
  if (kind === "categorias") return checkCategory(body, null);
  if (kind === "reserva") {
    const exists = db.prepare("SELECT 1 FROM user_data WHERE user_id = ? AND kind = 'reserva'").get(userId);
    if (exists) return err("A reserva de emergência já existe. Edite a atual.", 409);
    const v = validateReserve(body);
    return v.ok ? { body: v.value } : err(v.error);
  }
  return { body };
}

export function onUpdate(kind: string, body: Body, existing: Body): RuleOk | RuleErr {
  if (kind === "categorias") return checkCategory(body, existing);
  if (kind === "reserva") {
    const v = validateReserve(body);
    return v.ok ? { body: v.value } : err(v.error);
  }
  return { body };
}

export function onDelete(kind: string, existing: Body): RuleErr | null {
  if (kind === "categorias" && existing.system === true)
    return err("Categorias padrão não podem ser apagadas: a API usa elas para avaliar o seu orçamento.", 403);
  return null;
}
