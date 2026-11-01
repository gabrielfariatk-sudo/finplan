"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  CalendarCheck,
  ChartNoAxesCombined,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useLogout } from "@/components/auth/useLogout";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planejamento", label: "Planejamento", icon: CalendarCheck },
  { href: "/previsoes", label: "Previsões", icon: ChartNoAxesCombined },
];

export default function Sidebar() {
  const pathname = usePathname();
  const handleLogout = useLogout();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className="hidden w-56 shrink-0 flex-col justify-between border-r
                 border-white/10 bg-linear-to-b from-[#07011a] to-[#1a0a5c]
                 px-3 py-6 md:flex"
    >
      <nav aria-label="Menu principal" className="flex flex-col gap-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5
                          text-sm transition-colors ${
                            active
                              ? "bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.45)]"
                              : "text-white/80 hover:bg-white/10"
                          }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-white" : "text-purple-300"}`}
                strokeWidth={1.5}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm
                   text-white/80 transition-colors hover:bg-white/10"
      >
        <LogOut className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
        Sair
      </button>
    </aside>
  );
}