"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleUser,
  LogIn,
  LogOut,
  Settings,
  SlidersHorizontal,
  LayoutDashboard,
  Telescope,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useLogout } from "@/components/auth/useLogout";
import type { SessionUser } from "@/lib/welcome";

type PageTitle = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

// Título de cada página. A home ("/") não aparece aqui, então fica sem título.
const PAGE_TITLES: Record<string, PageTitle> = {
  "/planejamento": {
    icon: SlidersHorizontal,
    title: "Planejamento Financeiro",
    subtitle:
      "Organize seus gastos, cadastre suas categorias e mantenha o controle da sua vida financeira.",
  },
  "/planejamento/renda": {
    icon: Wallet,
    title: "Inserir Renda",
    subtitle:
      "Cadastre suas rendas para o FinPlan considerar nas projeções e no seu planejamento financeiro.",
  },
  "/dashboard": {
    icon: LayoutDashboard,
    title: "Dashboard",
    subtitle: "Visualize seu cenário financeiro em tempo real.",
  },
  "/configuracoes": {
    icon: Settings,
    title: "Configurações",
    subtitle:
      "Atualize seus dados e consulte as regras que o FinPlan usa nas análises.",
  },
  "/previsoes": {
    icon: Telescope,
    title: "Previsões Financeiras",
    subtitle:
      "Planeje a destinação da sua renda, simule metas futuras e quitação de pendências com insights de inteligência artificial.",
  },
};

function Logo() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#6d28d9" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="3" y="22" width="9" height="15" rx="2.5" fill="url(#logo-grad)" />
      <rect x="15.5" y="13" width="9" height="24" rx="2.5" fill="url(#logo-grad)" />
      <rect x="28" y="3" width="9" height="34" rx="2.5" fill="url(#logo-grad)" />
    </svg>
  );
}

const AUTH_PAGES = ["/login", "/redefinir-senha"];

export default function Navbar({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const logout = useLogout();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Remove barra final e busca o título da rota atual (undefined na home)
  const normalized =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const page = PAGE_TITLES[normalized];
  const isAuthPage = AUTH_PAGES.includes(normalized);
  const PageIcon = page?.icon;

  // Fecha o menu ao clicar fora ou apertar Esc
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      className="relative z-20 flex w-full items-center justify-between gap-6
                 border-b border-white/10 px-6 py-3 sm:px-10
                 bg-linear-to-r from-[#05010f] via-[#120637] to-[#2a0f8f]"
    >
      {/* Marca */}
      <Link href="/" className="flex shrink-0 items-center gap-3">
        <Logo />
        <div className="leading-tight">
          <p className="text-2xl font-semibold tracking-tight text-white">
            Fin<span className="text-purple-400">Plan</span>
          </p>
          <p className="hidden text-[11px] text-white/70 sm:block">
            Seu futuro financeiro em boas mãos
          </p>
        </div>
      </Link>

      {/* Título da página (some na home) */}
      {page && PageIcon && (
        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <PageIcon
            className="h-8 w-8 shrink-0 text-purple-300"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-2xl font-semibold text-white">
              {page.title}
            </h1>
            <p className="truncate text-sm text-white/70">{page.subtitle}</p>
          </div>
        </div>
      )}

      {/* Menu do usuário (escondido nas telas de login) */}
      {!isAuthPage && !user && (
        <Link
          href="/login"
          className="flex shrink-0 items-center gap-2 rounded-full border border-purple-300/60
                     px-5 py-2 text-white transition-colors hover:bg-white/10"
        >
          <LogIn className="h-4 w-4" /> Entrar
        </Link>
      )}

      {!isAuthPage && user && (
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-3 rounded-full px-2 py-1
                       text-white transition-colors hover:bg-white/10"
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full
                         border border-purple-300/60"
            >
              <CircleUser className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span className="hidden max-w-40 truncate text-base sm:block">
              {user.firstName}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl
                         border border-white/15 bg-[#120637]/95 py-1
                         shadow-[0_0_25px_rgba(168,85,247,0.35)] backdrop-blur-md"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  router.push("/configuracoes");
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm
                           text-white/90 hover:bg-white/10"
              >
                <Settings className="h-4 w-4" /> Configurações
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm
                           text-white/90 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}