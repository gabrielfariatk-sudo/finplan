import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// Visual base dos blocos do dashboard (escuro, translúcido, borda roxa)
export const DASH_CARD =
  "rounded-xl border border-purple-400/30 bg-[#0c0533]/80 text-white " +
  "shadow-[0_0_24px_rgba(124,58,237,0.22)] backdrop-blur-md";

type Props = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export default function Card({
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
  children,
}: Props) {
  return (
    <section className={`flex flex-col p-4 ${DASH_CARD} ${className}`}>
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/25 text-purple-200">
            <Icon className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-[11px] leading-snug text-white/60">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <p className="flex flex-1 items-center justify-center py-8 text-center text-xs text-white/55">
      {text}
    </p>
  );
}