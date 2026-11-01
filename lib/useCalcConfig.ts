"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_CALC_CONFIG,
  DEFAULT_VERSIONS,
  type CalcConfig,
  type CalcConfigInput,
  type ConfigScope,
  type ConfigVersion,
} from "@/lib/calcConfig";

type Payload = {
  versions: ConfigVersion[];
  current: CalcConfig; // vale hoje
  latest: CalcConfig; // o que o formulário edita (pode ser a alteração agendada)
  pendingFrom: string | null; // "yyyy-mm" da alteração agendada
};

const INITIAL: Payload = {
  versions: DEFAULT_VERSIONS,
  current: DEFAULT_CALC_CONFIG,
  latest: DEFAULT_CALC_CONFIG,
  pendingFrom: null,
};

async function call(method: string, body?: unknown): Promise<Payload> {
  const res = await fetch("/api/config", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Não foi possível salvar a Base de Cálculo.");
  return data as Payload;
}

/** Base de Cálculo do usuário (com versões por mês). Começa com os valores padrão até carregar. */
export function useCalcConfig() {
  const [state, setState] = useState<Payload>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    call("GET")
      .then((d) => alive && setState(d))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const save = useCallback(async (values: CalcConfigInput, scope: ConfigScope) => {
    const d = await call("PUT", { values, scope }); // lança erro se a API recusar
    setState(d);
  }, []);

  const cancelPending = useCallback(async () => {
    setState(await call("DELETE"));
  }, []);

  return { ...state, loading, error, save, cancelPending };
}
