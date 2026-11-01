import {
  Utensils,
  Car,
  House,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  Shirt,
  Settings,
  Database,
  Ellipsis,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

import type { CategoryGroup } from "@/lib/categoryGroups";

export type Category = {
  id: string;
  name: string;
  icon: string; // chave do ICONS (é isso que vai para o banco)
  color: string; // hex
  group: CategoryGroup; // necessidade | desejo | investimento (regra 50/30/20)
  system?: boolean; // categoria padrão: não pode ser apagada nem trocar de grupo
};

export const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  house: House,
  heart: HeartPulse,
  graduation: GraduationCap,
  gamepad: Gamepad2,
  shirt: Shirt,
  settings: Settings,
  database: Database,
  ellipsis: Ellipsis,
  trending: TrendingUp,
};

// Paleta pastel
export const COLORS = [
  "#a78bfa",
  "#7fa8f5",
  "#6fd6aa",
  "#f593a8",
  "#f5c677",
  "#76d4e0",
  "#ee98c8",
  "#a3b1c9",
  "#97a3f2",
  "#bde374",
];

// Categorias iniciais: copiadas para o banco de cada usuário no primeiro acesso
export { DEFAULT_CATEGORY_DATA } from "@/lib/categoryDefaults";
export { CATEGORY_GROUPS, groupMeta, isCategoryGroup, type CategoryGroup } from "@/lib/categoryGroups";
