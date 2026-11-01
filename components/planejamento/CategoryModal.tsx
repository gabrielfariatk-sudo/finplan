"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CATEGORY_GROUPS, COLORS, ICONS, type Category, type CategoryGroup } from "@/lib/categories";

export type CategoryInput = Omit<Category, "id" | "system">;

type Props = {
  initial: Category | null; // null = criando
  onClose: () => void;
  onSave: (data: CategoryInput) => void;
};

export default function CategoryModal({ initial, onClose, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "ellipsis");
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [group, setGroup] = useState<CategoryGroup | null>(initial?.group ?? null);
  const locked = initial?.system === true; // categoria padrão: o grupo é fixo

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed || !group) return;
    onSave({ name: trimmed, icon, color, group });
  }

  const SelectedIcon = ICONS[icon];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#2a1d78]/50 px-4 py-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-xs rounded-xl border border-purple-200
                   bg-white p-4 text-[#2a1d78]
                   shadow-[0_10px_40px_rgba(91,63,191,0.35)]"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {initial ? "Editar categoria" : "Nova categoria"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full p-1 text-[#4c3a9e] hover:bg-purple-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Prévia */}
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-purple-50 px-3 py-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md"
            style={{ backgroundColor: color }}
          >
            <SelectedIcon className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-xs font-medium">
            {name.trim() || "Nome da categoria"}
          </span>
        </div>

        <label className="mb-1 block text-xs text-[#4c3a9e]" htmlFor="cat-name">
          Nome
        </label>
        <input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          autoFocus
          placeholder="Ex: Pets"
          className="mb-3 w-full rounded-md border border-purple-200 bg-white
                     px-2.5 py-1.5 text-xs text-[#2a1d78] outline-none
                     placeholder:text-[#4c3a9e]/50 focus:border-purple-500"
        />

        <p className="mb-1.5 text-xs text-[#4c3a9e]">Grupo</p>
        <div className="mb-1 grid gap-1.5" role="radiogroup" aria-label="Grupo da categoria">
          {CATEGORY_GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              role="radio"
              aria-checked={group === g.key}
              disabled={locked}
              onClick={() => setGroup(g.key)}
              className={`rounded-md border px-2.5 py-1.5 text-left transition-colors
                          disabled:cursor-not-allowed ${
                            group === g.key
                              ? "border-purple-500 bg-purple-100 text-[#2a1d78]"
                              : "border-purple-200 bg-white text-[#4c3a9e] hover:bg-purple-50 disabled:hover:bg-white"
                          } ${locked && group !== g.key ? "opacity-40" : ""}`}
            >
              <span className="block text-xs font-medium">{g.label}</span>
              <span className="block text-[10px] leading-snug opacity-75">{g.desc}</span>
            </button>
          ))}
        </div>
        <p className="mb-3 text-[10px] leading-snug text-[#4c3a9e]/80">
          {locked
            ? "Categoria padrão: o grupo não pode ser alterado."
            : "A API usa o grupo para avaliar o seu orçamento (regra 50/30/20)."}
        </p>

        <p className="mb-1.5 text-xs text-[#4c3a9e]">Ícone</p>
        <div className="mb-3 grid grid-cols-5 gap-1.5">
          {Object.entries(ICONS).map(([key, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setIcon(key)}
              aria-pressed={icon === key}
              className={`flex h-7 items-center justify-center rounded-md border
                          transition-colors ${
                            icon === key
                              ? "border-purple-500 bg-purple-100 text-[#2a1d78]"
                              : "border-purple-200 bg-white text-[#4c3a9e] hover:bg-purple-50"
                          }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-xs text-[#4c3a9e]">Cor</p>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Cor ${c}`}
              aria-pressed={color === c}
              className={`h-5 w-5 rounded-full border-2 transition-transform ${
                color === c
                  ? "scale-110 border-[#2a1d78]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-[#4c3a9e] hover:bg-purple-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !group}
            className="rounded-md bg-linear-to-r from-purple-600 to-violet-600
                       px-4 py-1.5 text-xs font-medium text-white
                       transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}