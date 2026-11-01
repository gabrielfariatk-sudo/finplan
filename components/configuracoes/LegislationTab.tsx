import { ExternalLink, Scale } from "lucide-react";
import { CARD_CLASS } from "@/components/planejamento/formStyles";
import { LAWS } from "@/lib/legislation";

export default function LegislationTab() {
  return (
    <section className={`${CARD_CLASS} flex flex-col gap-3`}>
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[#6d4fd6]">
          <Scale className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#2a1d78]">Legislação</h2>
          <p className="text-[11px] leading-snug text-[#4c3a9e]/85">
            Leis que dão base às análises e às dicas do FinPlan. São resumos informativos: não
            substituem a leitura da lei nem a orientação de um profissional.
          </p>
        </div>
      </div>

      {LAWS.map((law) => (
        <article key={law.id} className="rounded-lg border border-purple-200 bg-white/80 p-3 text-[#2a1d78]">
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">{law.name}</h3>
              <p className="text-[11px] text-[#4c3a9e]">{law.number}</p>
            </div>
            <a
              href={law.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-purple-300 bg-white px-2.5 py-1.5
                         text-xs font-medium text-[#4c3a9e] transition-colors hover:bg-purple-50"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Ler a lei completa
            </a>
          </header>

          <p className="mt-2 text-xs leading-relaxed">{law.scope}</p>

          <h4 className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#4c3a9e]">Pontos principais</h4>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed marker:text-[#6d4fd6]">
            {law.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <h4 className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#4c3a9e]">
            Como se relaciona com o FinPlan
          </h4>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed marker:text-[#6d4fd6]">
            {law.relation.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
