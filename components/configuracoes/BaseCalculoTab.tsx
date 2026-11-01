"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Calculator, CalendarClock, Database, RotateCcw, X } from "lucide-react";
import {
  CARD_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/components/planejamento/formStyles";
import {
  configToInput,
  DEFAULT_CALC_CONFIG,
  nextMonthKey,
  type CalcConfig,
  type CalcConfigInput,
  type ConfigScope,
} from "@/lib/calcConfig";
import { useCalcConfig } from "@/lib/useCalcConfig";

type Key = keyof CalcConfigInput;
type Draft = Record<Key, string>;

const LABELS: Record<Key, string> = {
  necessidades_pct: "Necessidades",
  desejos_pct: "Desejos",
  investimento_pct: "Poupança e Investimento",
  meses_minimo: "Reserva (mínimo de meses)",
  meses_maximo: "Reserva (máximo de meses)",
  curto_max: "Curto prazo (até)",
  medio_max: "Médio prazo (até)",
};
const KEYS = Object.keys(LABELS) as Key[];

const toDraft = (i: CalcConfigInput): Draft =>
  Object.fromEntries(KEYS.map((k) => [k, String(i[k])])) as Draft;

const WHOLE = /^\d+$/; // só inteiros: sem vírgula, ponto, sinal ou letras
const fmtMonth = (key: string) => `${key.slice(5, 7)}/${key.slice(0, 4)}`;

export default function BaseCalculoTab() {
  const calc = useCalcConfig();

  return (
    <section className={`${CARD_CLASS} flex flex-col gap-3`}>
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#6d4fd6]">
          <Calculator className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#2a1d78]">Base de Cálculo</h2>
          <p className="text-[11px] leading-snug text-[#4c3a9e]/85">
            São as regras que a API usa para avaliar a sua vida financeira e gerar as dicas. Cada pessoa
            tem uma realidade: ajuste os valores como quiser. Percentuais e prazos aceitam apenas números
            inteiros.
          </p>
        </div>
      </div>

      {calc.loading ? (
        <p className="py-6 text-center text-xs text-[#4c3a9e]/80">Carregando…</p>
      ) : (
        <Form
          // recria o formulário quando os valores salvos mudam
          key={JSON.stringify(calc.latest)}
          config={calc.latest}
          pendingFrom={calc.pendingFrom}
          loadError={calc.error}
          onSave={calc.save}
          onCancelPending={calc.cancelPending}
        />
      )}
    </section>
  );
}

function Form({
  config,
  pendingFrom,
  loadError,
  onSave,
  onCancelPending,
}: {
  config: CalcConfig;
  pendingFrom: string | null;
  loadError: string | null;
  onSave: (values: CalcConfigInput, scope: ConfigScope) => Promise<void>;
  onCancelPending: () => Promise<void>;
}) {
  const saved = configToInput(config);
  const [d, setD] = useState<Draft>(toDraft(saved));
  const [askScope, setAskScope] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // valores válidos (todos inteiros) ou null
  const values: CalcConfigInput | null = KEYS.every((k) => WHOLE.test(d[k]))
    ? (Object.fromEntries(KEYS.map((k) => [k, Number(d[k])])) as CalcConfigInput)
    : null;
  const changed = values !== null && KEYS.some((k) => values[k] !== saved[k]);

  const fieldError = (k: Key) =>
    d[k].trim() === "" ? "obrigatório" : /[.,]/.test(d[k]) ? "use número inteiro" : !WHOLE.test(d[k]) ? "só dígitos" : "";
  const errors = KEYS.filter((k) => fieldError(k));

  const set = (k: Key) => (v: string) => {
    setD((p) => ({ ...p, [k]: v }));
    setOk("");
  };

  // avisos leves (não bloqueiam nada por enquanto)
  const sum = values ? values.necessidades_pct + values.desejos_pct + values.investimento_pct : null;
  const notes: string[] = [];
  if (sum !== null && sum !== 100) notes.push(`A soma dos percentuais é ${sum}%. Não precisa fechar 100%, mas a regra clássica soma 100.`);
  if (values && values.meses_maximo < values.meses_minimo) notes.push("O máximo da reserva está menor que o mínimo.");
  if (values && values.medio_max <= values.curto_max) notes.push("O limite do médio prazo deve ser maior que o do curto prazo; senão a faixa de médio prazo fica vazia.");

  // Função (não componente): o <input> mantém o foco enquanto o usuário digita
  const num = (k: Key) => (
    <input
      value={d[k]}
      onChange={(e) => set(k)(e.target.value)}
      inputMode="numeric"
      aria-label={LABELS[k]}
      aria-invalid={fieldError(k) !== ""}
      className={`w-16 rounded-md border bg-white px-2 py-1 text-center text-xs font-semibold text-[#2a1d78]
                  outline-none transition-colors focus:border-purple-500 ${
                    fieldError(k) ? "border-rose-400 bg-rose-50" : "border-purple-200"
                  }`}
    />
  );

  const curto = values?.curto_max;
  const medio = values?.medio_max;

  type Row = { cat: string; span: number; param: string; value: ReactNode; rule: string; fixed?: boolean };
  const rows: Row[] = [
    { cat: "Orçamento Pessoal", span: 3, param: "Necessidades (Gastos Essenciais)", value: <span className="flex items-center gap-1.5">{num("necessidades_pct")} % da Renda Líquida</span>, rule: "Teto recomendado para despesas fixas (moradia, transporte, alimentação)." },
    { cat: "", span: 0, param: "Desejos (Gastos Discricionários)", value: <span className="flex items-center gap-1.5">{num("desejos_pct")} % da Renda Líquida</span>, rule: "Teto recomendado para despesas variáveis e estilo de vida (lazer, compras)." },
    { cat: "", span: 0, param: "Poupança e Investimento", value: <span className="flex items-center gap-1.5">{num("investimento_pct")} % da Renda Líquida</span>, rule: "Piso recomendado para aporte mensal em investimentos e patrimônio." },
    { cat: "Reserva de Emergência", span: 2, param: "Meta de Cobertura (Tempo)", value: <span className="flex flex-wrap items-center gap-1.5">{num("meses_minimo")} a {num("meses_maximo")} meses</span>, rule: "Multiplicador aplicado sobre o total de Despesas Fixas Mensais." },
    { cat: "", span: 0, param: "Marcos da Reserva", value: <span className="font-semibold">6 meses · 2 anos · 5 anos</span>, rule: "Metas da reserva. Ao concluir cada marco, a API mostra um aviso em Dicas da API & Análise Inteligente.", fixed: true },
    { cat: "Horizonte Temporal", span: 3, param: "Curto Prazo", value: <span className="flex items-center gap-1.5">até {num("curto_max")} meses</span>, rule: "Validação de prazo para metas de amortização de dívidas e reserva." },
    { cat: "", span: 0, param: "Médio Prazo", value: <span className="flex flex-wrap items-center gap-1.5">de {curto !== undefined ? curto + 1 : "…"} até {num("medio_max")} meses</span>, rule: "Validação de prazo para metas intermediárias (estudos, bens)." },
    { cat: "", span: 0, param: "Longo Prazo", value: <span>acima de {medio ?? "…"} meses</span>, rule: "Validação de prazo para aposentadoria e independência financeira.", fixed: true },
  ];

  async function confirm(scope: ConfigScope) {
    if (!values) return;
    setError("");
    try {
      await onSave(values, scope);
      setAskScope(false);
      setOk(
        scope === "all"
          ? "Salvo. Os novos valores valem para todas as informações."
          : `Salvo. Os novos valores valem a partir de ${fmtMonth(nextMonthKey(new Date()))}.`,
      );
    } catch (e) {
      setAskScope(false);
      setError((e as Error).message);
    }
  }

  async function cancelPending() {
    setError("");
    try {
      await onCancelPending();
      setOk("Alteração agendada cancelada.");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      {pendingFrom && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            Há uma alteração agendada para <strong>{fmtMonth(pendingFrom)}</strong>. Os valores abaixo já a incluem; até lá continuam valendo os anteriores.
          </span>
          <button onClick={cancelPending} className="shrink-0 font-semibold underline">Cancelar agendamento</button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-purple-200 bg-white/80">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs text-[#2a1d78]">
          <thead>
            <tr className="bg-purple-100 text-[11px] font-semibold uppercase tracking-wide text-[#4c3a9e]">
              <th className="px-3 py-2">Categoria da Lógica</th>
              <th className="px-3 py-2">Parâmetro / Indicador</th>
              <th className="px-3 py-2">Valor / Regra</th>
              <th className="px-3 py-2">Aplicação na API / Regra de Negócio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.param} className="border-t border-purple-100 align-middle">
                {r.span > 0 && (
                  <th rowSpan={r.span} scope="rowgroup" className="border-r border-purple-100 bg-purple-50/70 px-3 py-2 align-top font-semibold">
                    {r.cat}
                  </th>
                )}
                <td className="px-3 py-2 font-medium">{r.param}</td>
                <td className="px-3 py-2">
                  {r.value}
                  {r.fixed && <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-medium text-[#4c3a9e]">fixo</span>}
                </td>
                <td className="px-3 py-2 text-[11px] leading-snug text-[#4c3a9e]">{r.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="space-y-0.5 text-[11px] font-medium text-rose-700">
          {errors.map((k) => (
            <li key={k}>{LABELS[k]}: {fieldError(k)}. Use apenas números inteiros (sem vírgula ou ponto).</li>
          ))}
        </ul>
      )}
      {notes.map((n) => (
        <p key={n} className="text-[11px] text-amber-800">⚠ {n}</p>
      ))}
      {(error || loadError) && <p role="alert" className="text-xs font-medium text-rose-700">{error || loadError}</p>}
      {ok && <p role="status" className="text-xs font-medium text-emerald-700">{ok}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => { setD(toDraft(configToInput(DEFAULT_CALC_CONFIG))); setOk(""); }}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-[#4c3a9e] transition-colors hover:bg-purple-100"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar padrão
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] text-[#4c3a9e]/80 sm:block">
            Nada é gravado até você clicar em Base de Dados.
          </span>
          <button
            type="button"
            disabled={!changed}
            onClick={() => setAskScope(true)}
            className={PRIMARY_BUTTON_CLASS}
          >
            <Database className="h-3.5 w-3.5" /> Base de Dados
          </button>
        </div>
      </div>

      {askScope && values && (
        <ScopeModal
          before={saved}
          after={values}
          onClose={() => setAskScope(false)}
          onConfirm={confirm}
        />
      )}
    </>
  );
}

/* ---------- Decide como aplicar a mudança ---------- */
function ScopeModal({
  before,
  after,
  onClose,
  onConfirm,
}: {
  before: CalcConfigInput;
  after: CalcConfigInput;
  onClose: () => void;
  onConfirm: (scope: ConfigScope) => Promise<void>;
}) {
  const [scope, setScope] = useState<ConfigScope | null>(null);
  const [busy, setBusy] = useState(false);
  const next = nextMonthKey(new Date());
  const diffs = KEYS.filter((k) => before[k] !== after[k]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const option = (value: ConfigScope, title: string, text: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={scope === value}
      onClick={() => setScope(value)}
      className={`rounded-lg border p-3 text-left transition-colors ${
        scope === value ? "border-purple-500 bg-purple-100" : "border-purple-200 bg-white hover:bg-purple-50"
      }`}
    >
      <span className="block text-xs font-semibold">{title}</span>
      <span className="mt-0.5 block text-[11px] leading-snug text-[#4c3a9e]">{text}</span>
    </button>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#2a1d78]/50 px-4 py-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label="Como aplicar as mudanças" className="w-full max-w-md rounded-xl border border-purple-200 bg-white p-4 text-[#2a1d78] shadow-[0_10px_40px_rgba(91,63,191,0.35)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Database className="h-4 w-4 text-[#6d4fd6]" /> Base de Dados</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-1 text-[#4c3a9e] hover:bg-purple-100"><X className="h-4 w-4" /></button>
        </div>

        <p className="mb-2 text-xs font-medium">Você alterou:</p>
        <ul className="mb-3 space-y-0.5 rounded-lg bg-purple-50 px-3 py-2 text-[11px]">
          {diffs.map((k) => (
            <li key={k}>{LABELS[k]}: <span className="line-through opacity-60">{before[k]}</span> → <strong>{after[k]}</strong></li>
          ))}
        </ul>

        <p className="mb-2 text-xs font-medium">Como aplicar essas mudanças?</p>
        <div className="grid gap-2" role="radiogroup" aria-label="Como aplicar">
          {option("all", "Todas as informações", "Os novos valores passam a valer para todo o histórico: os meses anteriores e o atual são reavaliados.")}
          {option("next-month", `A partir do mês seguinte (${fmtMonth(next)})`, "Até o fim do mês atual continuam valendo os valores anteriores. O histórico não muda.")}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-xs text-[#4c3a9e] hover:bg-purple-100">Cancelar</button>
          <button
            disabled={!scope || busy}
            onClick={async () => { if (!scope) return; setBusy(true); await onConfirm(scope); setBusy(false); }}
            className={PRIMARY_BUTTON_CLASS}
          >
            {busy ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
