"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarCheck, ChartNoAxesCombined, Eye, Home } from "lucide-react";

const LINKS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/planejamento", label: "Planejamento", icon: CalendarCheck },
  { href: "/previsoes", label: "Previsões", icon: ChartNoAxesCombined },
];

const BUTTON =
  "flex h-12 w-12 items-center justify-center rounded-full border border-white/25 " +
  "bg-[#1a0a5c]/85 text-purple-200 shadow-[0_6px_20px_rgba(0,0,0,0.35)] " +
  "backdrop-blur-md transition-colors hover:border-purple-300 hover:bg-purple-600 " +
  "hover:text-white focus-visible:outline-2 focus-visible:outline-purple-300";

function Tip({ side, children }: { side: "left" | "right"; children: ReactNode }) {
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2
                  whitespace-nowrap rounded-lg border border-purple-300/40 bg-[#120a45]
                  px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg
                  transition-opacity duration-150 group-hover:opacity-100
                  group-focus-within:opacity-100 md:block ${
                    side === "right" ? "left-full ml-3" : "right-full mr-3"
                  }`}
    >
      {children}
    </span>
  );
}

type Props = {
  specificOpen: boolean;
  onToggleSpecific: () => void;
};

export default function FloatingNav({ specificOpen, onToggleSpecific }: Props) {
  return (
    <>
      {/* Navegação (esquerda) */}
      <nav
        aria-label="Navegação entre páginas"
        className="fixed bottom-4 left-4 z-30 flex gap-3 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:flex-col"
      >
        {LINKS.map(({ href, label, icon: Icon }) => (
          <div key={href} className="group relative">
            <Link href={href} aria-label={label} className={BUTTON}>
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Tip side="right">{label}</Tip>
          </div>
        ))}
      </nav>

      {/* Visualização de gastos específicos (direita) */}
      <div className="fixed bottom-4 right-4 z-30 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
        <div className="group relative">
          <button
            type="button"
            onClick={onToggleSpecific}
            aria-label="Visualização de gastos específicos"
            aria-pressed={specificOpen}
            className={`${BUTTON} ${
              specificOpen ? "border-purple-300 bg-purple-600 text-white" : ""
            }`}
          >
            <Eye className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Tip side="left">Visualização de gastos específicos</Tip>
        </div>
      </div>
    </>
  );
}