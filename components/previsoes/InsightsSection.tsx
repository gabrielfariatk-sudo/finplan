import {
  Bot,
  Calendar,
  Check,
  Clock,
  Cpu,
  HeartPulse,
  Info,
  PieChart,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Forecast, FooterIcon, Insight, Part, Tone } from "@/lib/forecast";

const TONES: Record<
  Tone,
  { border: string; title: string; icon: string; badge: string; strong: string }
> = {
  danger: {
    border: "border-l-rose-500",
    title: "text-rose-400",
    icon: "bg-rose-500/20 text-rose-400",
    badge: "border-rose-500/50 bg-rose-500/10 text-rose-300",
    strong: "text-white",
  },
  warning: {
    border: "border-l-amber-500",
    title: "text-amber-400",
    icon: "bg-amber-500/20 text-amber-400",
    badge: "border-amber-500/50 bg-amber-500/10 text-amber-300",
    strong: "text-white",
  },
  purple: {
    border: "border-l-violet-500",
    title: "text-violet-300",
    icon: "bg-violet-500/20 text-violet-300",
    badge: "border-violet-500/50 bg-violet-500/10 text-violet-300",
    strong: "text-violet-300",
  },
  success: {
    border: "border-l-emerald-500",
    title: "text-emerald-400",
    icon: "bg-emerald-500/20 text-emerald-400",
    badge: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    strong: "text-white",
  },
  info: {
    border: "border-l-cyan-500",
    title: "text-cyan-400",
    icon: "bg-cyan-500/20 text-cyan-300",
    badge: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300",
    strong: "text-cyan-300",
  },
};

const FOOTER_ICONS: Record<FooterIcon, LucideIcon> = {
  info: Info,
  calendar: Calendar,
  target: Target,
  check: Check,
};

const INSIGHT_ICONS: Partial<Record<Insight["id"], LucideIcon>> = {
  trend: TrendingUp,
  top: PieChart,
  budget: Scale,
  reserve: ShieldCheck,
  milestone: Trophy,
  horizon: Clock,
};

function Text({ parts, strongClass }: { parts: Part[]; strongClass: string }) {
  return (
    <p className="mt-3 text-[13px] leading-relaxed text-white/80">
      {parts.map((p, i) =>
        p.strong ? (
          <strong key={i} className={`font-semibold ${strongClass}`}>
            {p.text}
          </strong>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </p>
  );
}

function InsightCard({ insight, onAction }: { insight: Insight; onAction?: (key: string) => void }) {
  const tone = TONES[insight.tone];
  const Icon =
    insight.id === "health"
      ? insight.tone === "success"
        ? HeartPulse
        : TriangleAlert
      : (INSIGHT_ICONS[insight.id] ?? Sparkles);
  const FooterIconCmp = insight.footer ? FOOTER_ICONS[insight.footer.icon] : null;

  return (
    <article
      className={`flex flex-col rounded-xl border border-l-4 border-white/10 bg-[#0c0533]/80
                  p-4 backdrop-blur-md ${tone.border} ${insight.wide ? "md:col-span-2" : ""}`}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone.icon}`}>
            <Icon className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <h3 className={`text-xs font-bold uppercase tracking-wide ${tone.title}`}>
            {insight.title}
          </h3>
        </div>
        <span className={`rounded border px-2 py-0.5 text-[10px] ${tone.badge}`}>
          {insight.badge}
        </span>
      </header>

      <Text parts={insight.parts} strongClass={tone.strong} />

      {(insight.footer || insight.action) && (
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[11px]">
          {insight.footer && FooterIconCmp ? (
            <p className="flex items-center gap-1.5 text-white/55">
              <FooterIconCmp className="h-3.5 w-3.5" />
              {insight.footer.text}
            </p>
          ) : (
            <span />
          )}
          {insight.action && (
            <button
              type="button"
              onClick={() => onAction?.(insight.action!.key)}
              className={`shrink-0 rounded-lg border px-3 py-1 font-semibold transition-colors hover:bg-white/10 ${tone.badge}`}
            >
              {insight.action.label}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default function InsightsSection({
  forecast,
  onAction,
}: {
  forecast: Forecast;
  onAction?: (key: string) => void;
}) {
  const { insights, recommendation } = forecast;
  const info = TONES.info;

  return (
    <section
      id="insights"
      className="scroll-mt-4 rounded-2xl border border-purple-400/20 bg-[#080325]/80 p-5 text-white backdrop-blur-md"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/25 text-purple-200">
            <Bot className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <h2 className="text-base font-semibold">Dicas da API &amp; Análise Inteligente</h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-purple-300">
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizado agora
        </span>
      </header>

      {insights.length === 0 && !recommendation ? (
        <p className="py-8 text-center text-xs text-white/55">
          Cadastre rendas e gastos para receber análises.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((i) => (
            <InsightCard key={i.id} insight={i} onAction={onAction} />
          ))}

          {recommendation && (
            <article
              className={`flex flex-col rounded-xl border border-l-4 border-white/10 bg-[#0c0533]/80
                          p-4 backdrop-blur-md md:col-span-2 ${info.border}`}
            >
              <header className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${info.icon}`}>
                    <Cpu className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <h3 className={`text-xs font-bold uppercase tracking-wide ${info.title}`}>
                    Recomendação estratégica FinPlan API
                  </h3>
                </div>
                <span className={`rounded-full border px-3 py-0.5 text-[10px] ${info.badge}`}>
                  {recommendation.badge}
                </span>
              </header>

              <Text parts={recommendation.parts} strongClass={info.strong} />

              <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
                <span className="text-white/55">{recommendation.footer}</span>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: aplicar a recomendação ao plano do usuário
                  }}
                  className="font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Aplicar no Plano →
                </button>
              </div>
            </article>
          )}
        </div>
      )}
    </section>
  );
}