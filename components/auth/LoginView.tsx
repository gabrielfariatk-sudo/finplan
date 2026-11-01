"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, User, X } from "lucide-react";
import AuthShell, { cardClass, inputClass, inputWrap, submitClass } from "./AuthShell";
import type { Gender } from "@/lib/welcome";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Erro inesperado. Tente novamente.");
  return data;
}

// Aceita só caminhos internos (evita redirecionar para sites externos)
function safeNext(next?: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function LoginView({ next }: { next?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<null | "register" | "forgot">(null);

  function done() {
    router.replace(safeNext(next));
    router.refresh();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await post("/api/auth/login", { login: form.login.trim(), password: form.password });
      done();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <section className={`${cardClass} max-w-md`}>
        <h1 className="mb-6 text-center text-3xl font-medium text-purple-100">Entrar na sua Conta</h1>

        <form onSubmit={submit} noValidate>
          <label htmlFor="login" className="mb-1.5 block text-white">Usuário</label>
          <div className={inputWrap}>
            <User className="h-5 w-5 shrink-0 text-purple-300" strokeWidth={1.5} />
            <input
              id="login"
              autoComplete="username"
              placeholder="Ex.: joao.silva ou joao@email.com"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <label htmlFor="password" className="mb-1.5 mt-4 block text-white">Senha</label>
          <div className={inputWrap}>
            <Lock className="h-5 w-5 shrink-0 text-purple-300" strokeWidth={1.5} />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <button
            type="button"
            onClick={() => setModal("forgot")}
            className="ml-auto mt-3 block text-sm text-purple-300 hover:underline"
          >
            Esqueceu a senha?
          </button>

          {error && (
            <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>
          )}

          <button disabled={busy} className={submitClass}>
            <LogIn className="h-5 w-5" strokeWidth={1.5} />
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </section>

      <p className="text-white">
        Não tem uma conta?{" "}
        <button
          type="button"
          onClick={() => setModal("register")}
          className="text-purple-300 hover:underline"
        >
          Cadastre-se
        </button>
      </p>

      {modal === "register" && <RegisterModal onClose={() => setModal(null)} onDone={done} />}
      {modal === "forgot" && <ForgotModal onClose={() => setModal(null)} />}
    </AuthShell>
  );
}

/* ---------- Modal genérico ---------- */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#05010f]/80 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className={`${cardClass} relative max-w-lg bg-[#150c3d]`}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-purple-200 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-5 text-center text-2xl font-medium text-purple-100">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm text-white">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const plainInput =
  "w-full rounded-xl border border-purple-500/60 bg-[#0a0628]/70 px-4 py-3 text-base text-white " +
  "placeholder:text-purple-200/50 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-400/40";

/* ---------- Cadastro (abre sobre o login, sem trocar de tela) ---------- */
function RegisterModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({
    firstName: "", lastName: "", gender: "" as Gender | "", username: "", email: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (f.password !== f.confirmPassword) return setError("As senhas não coincidem.");
    setBusy(true);
    try {
      await post("/api/auth/register", f);
      onDone();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Modal title="Criar sua Conta" onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primeiro nome">
            <input value={f.firstName} onChange={set("firstName")} autoComplete="given-name" className={plainInput} required />
          </Field>
          <Field label="Último nome">
            <input value={f.lastName} onChange={set("lastName")} autoComplete="family-name" className={plainInput} required />
          </Field>
        </div>

        <Field label="Sexo">
          <select value={f.gender} onChange={set("gender")} className={plainInput} required>
            <option value="" disabled>Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="nao_informado">Prefiro não informar</option>
          </select>
        </Field>

        <Field label="Usuário">
          <input value={f.username} onChange={set("username")} placeholder="Ex.: joao.silva" autoComplete="username" className={plainInput} required />
        </Field>

        <Field label="E-mail">
          <input type="email" value={f.email} onChange={set("email")} placeholder="joao@email.com" autoComplete="email" className={plainInput} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Senha">
            <input type="password" value={f.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" autoComplete="new-password" className={plainInput} required />
          </Field>
          <Field label="Confirmar senha">
            <input type="password" value={f.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" className={plainInput} required />
          </Field>
        </div>

        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button disabled={busy} className={submitClass}>{busy ? "Criando…" : "Criar conta"}</button>
      </form>
    </Modal>
  );
}

/* ---------- Esqueci a senha ---------- */
function ForgotModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await post("/api/auth/forgot-password", { email }).catch(() => {});
    setBusy(false);
    setSent(true);
  }

  return (
    <Modal title="Recuperar senha" onClose={onClose}>
      {sent ? (
        <p className="leading-relaxed text-purple-100">
          Se esse e-mail estiver cadastrado, enviamos um link para você criar uma nova senha.
          O link vale por 1 hora.
        </p>
      ) : (
        <form onSubmit={submit}>
          <Field label="E-mail da conta">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joao@email.com" className={plainInput} required />
          </Field>
          <button disabled={busy} className={submitClass}>{busy ? "Enviando…" : "Enviar link"}</button>
        </form>
      )}
    </Modal>
  );
}
