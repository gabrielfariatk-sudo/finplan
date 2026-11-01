"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Lock,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { groupMeta, ICONS, type Category } from "@/lib/categories";
import CategoryModal, { type CategoryInput } from "./CategoryModal";

type Props = {
  categories: Category[];
  onCreate: (data: CategoryInput) => void;
  onUpdate: (id: string, data: CategoryInput) => void;
  onDelete: (id: string) => void;
};

export default function CategoriesCard({
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  // undefined = modal fechado | null = criando | Category = editando
  const [editing, setEditing] = useState<Category | null | undefined>(
    undefined,
  );

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows, categories.length]);

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  function handleDelete(cat: Category) {
    if (window.confirm(`Apagar a categoria "${cat.name}"?`)) {
      onDelete(cat.id);
    }
  }

  function handleSave(data: CategoryInput) {
    if (editing) onUpdate(editing.id, data);
    else onCreate(data);
    setEditing(undefined);
  }

  return (
    <section
      className="rounded-xl border border-purple-300/60 bg-white/70 p-3
                 shadow-[0_8px_30px_rgba(91,63,191,0.22)] backdrop-blur-md"
    >
      {/* Cabeçalho do card */}
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 h-4 w-4 text-[#6d4fd6]" strokeWidth={1.5} />
          <div>
            <h2 className="text-sm font-semibold text-[#2a1d78]">Categorias</h2>
            <p className="text-[10px] leading-snug text-[#4c3a9e]/80">
              Cada categoria pertence a um grupo (Necessidade, Desejo ou
              Investimento), que a API usa para avaliar o seu orçamento. As
              categorias padrão (com cadeado) não podem ser apagadas.
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditing(null)}
          className="flex shrink-0 items-center gap-1.5 rounded-md
                     bg-linear-to-r from-purple-600 to-violet-600 px-2.5 py-1.5
                     text-xs font-medium text-white
                     shadow-[0_4px_12px_rgba(109,40,217,0.35)]
                     transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Adicionar Categoria</span>
        </button>
      </div>

      {/* Carrossel */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => scrollByPage(-1)}
          disabled={!canLeft}
          aria-label="Categorias anteriores"
          className="flex h-6 w-6 shrink-0 items-center justify-center
                     rounded-full border border-purple-300 bg-white text-[#4c3a9e]
                     shadow-sm transition-opacity hover:bg-purple-50
                     disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <div
          ref={trackRef}
          onScroll={updateArrows}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2
                     overflow-x-auto scroll-smooth
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.length === 0 && (
            <p className="w-full py-2 text-center text-xs text-[#4c3a9e]/80">
              Nenhuma categoria cadastrada.
            </p>
          )}

          {categories.map((cat) => {
            const Icon = ICONS[cat.icon] ?? ICONS.ellipsis;
            return (
              <div
                key={cat.id}
                className="flex w-[calc((100%-0.5rem)/2)] shrink-0 snap-start
                           items-center gap-2 rounded-lg border border-purple-200
                           bg-white/90 px-2 py-1.5 shadow-sm
                           md:w-[calc((100%-1.5rem)/4)]
                           xl:w-[calc((100%-2rem)/5)]"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: cat.color }}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-[#2a1d78]">
                    {cat.name}
                  </span>
                  <span className="block truncate text-[9px] text-[#4c3a9e]/75">
                    {cat.group ? groupMeta(cat.group).label : "—"}
                  </span>
                </span>

                <button
                  onClick={() => setEditing(cat)}
                  aria-label={`Editar ${cat.name}`}
                  className="shrink-0 rounded p-0.5 text-[#6d4fd6]
                             transition-colors hover:bg-purple-100"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                {cat.system ? (
                  <span
                    title="Categoria padrão: não pode ser apagada"
                    aria-label="Categoria padrão, não pode ser apagada"
                    className="shrink-0 p-0.5 text-[#4c3a9e]/60"
                  >
                    <Lock className="h-3 w-3" />
                  </span>
                ) : (
                  <button
                    onClick={() => handleDelete(cat)}
                    aria-label={`Apagar ${cat.name}`}
                    className="shrink-0 rounded p-0.5 text-rose-500
                               transition-colors hover:bg-rose-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scrollByPage(1)}
          disabled={!canRight}
          aria-label="Próximas categorias"
          className="flex h-6 w-6 shrink-0 items-center justify-center
                     rounded-full border border-purple-300 bg-white text-[#4c3a9e]
                     shadow-sm transition-opacity hover:bg-purple-50
                     disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {editing !== undefined && (
        <CategoryModal
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}