"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WithId = { id: string };

async function request<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: init?.method,
    headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (res.status === 401) {
    // Navegação completa de propósito: limpa o estado e leva ao login
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login"; // sessão expirou
    throw new Error("Sessão expirada.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Não foi possível salvar. Tente novamente.");
  return data as T;
}

/**
 * Lê e grava uma lista de registros do usuário logado no banco local.
 * kind = nome da coleção: "rendas", "categorias", "gastos-fixos", ...
 */
export function useUserData<T extends WithId>(kind: string) {
  const base = `/api/data/${kind}`;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef<T[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let alive = true;
    request<T[]>(base)
      .then((d) => alive && setItems(d))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [base]);

  const create = useCallback(
    async (input: Omit<T, "id">) => {
      setError(null);
      try {
        const created = await request<T>(base, { method: "POST", body: input });
        setItems((prev) => [...prev, created]);
        return created;
      } catch (e) {
        setError((e as Error).message);
        return null;
      }
    },
    [base],
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<T, "id">>) => {
      const current = itemsRef.current.find((i) => i.id === id);
      if (!current) return;
      setError(null);
      const next = { ...current, ...patch } as T;
      setItems((prev) => prev.map((i) => (i.id === id ? next : i))); // atualiza na hora
      try {
        const body: Record<string, unknown> = { ...next };
        delete body.id;
        await request(`${base}/${id}`, { method: "PUT", body });
      } catch (e) {
        setItems((prev) => prev.map((i) => (i.id === id ? current : i))); // desfaz
        setError((e as Error).message);
      }
    },
    [base],
  );

  const remove = useCallback(
    async (id: string) => {
      const current = itemsRef.current.find((i) => i.id === id);
      setError(null);
      setItems((prev) => prev.filter((i) => i.id !== id));
      try {
        await request(`${base}/${id}`, { method: "DELETE" });
      } catch (e) {
        if (current) setItems((prev) => [...prev, current]);
        setError((e as Error).message);
      }
    },
    [base],
  );

  return { items, loading, error, create, update, remove };
}
