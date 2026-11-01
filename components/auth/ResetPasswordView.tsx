"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import AuthShell, { cardClass, inputClass, inputWrap, submitClass } from "./AuthShell";

export default function ResetPasswordView({ token }: { token: string }) {
  const router = useRouter();
  const [f, setF] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...f }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Erro inesperado.");
    setDone(true);
    setTimeout(() => router.replace("/login"), 2500);
  }

  return (
    <AuthShell>
      <section className={`${cardClass} max-w-md`}>
        <h1 className="mb-6 text-center text-3xl font-medium text-purple-100">Nova senha</h1>
        {!token ? (
          <p className="text-purple-100">Link inválido. Peça um novo na tela de login.</p>
        ) : done ? (
          <p className="text-purple-100">Senha alterada. Redirecionando para o login…</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="np" className="mb-1.5 block text-white">Nova senha</label>
              <div className={inputWrap}>
                <Lock className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
                <input id="np" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                  value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })}
                  className={inputClass} required />
              </div>
            </div>
            <div>
              <label htmlFor="cp" className="mb-1.5 block text-white">Confirmar nova senha</label>
              <div className={inputWrap}>
                <Lock className="h-5 w-5 text-purple-300" strokeWidth={1.5} />
                <input id="cp" type="password" autoComplete="new-password"
                  value={f.confirmPassword} onChange={(e) => setF({ ...f, confirmPassword: e.target.value })}
                  className={inputClass} required />
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
            <button disabled={busy} className={submitClass}>{busy ? "Salvando…" : "Salvar nova senha"}</button>
          </form>
        )}
      </section>
      <Link href="/login" className="text-purple-300 hover:underline">Voltar ao login</Link>
    </AuthShell>
  );
}
