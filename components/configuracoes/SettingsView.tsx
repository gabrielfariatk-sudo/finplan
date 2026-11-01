"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Scale, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import {
  CARD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON_CLASS,
} from "@/components/planejamento/formStyles";
import BaseCalculoTab from "./BaseCalculoTab";
import LegislationTab from "./LegislationTab";
import type { Gender, SessionUser } from "@/lib/welcome";

type TabKey = "dados" | "legislacao" | "calculo";

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "dados", label: "Meus dados", icon: UserRound },
  { key: "legislacao", label: "Legislação", icon: Scale },
  { key: "calculo", label: "Base de Cálculo", icon: Calculator },
];

export default function SettingsView({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<TabKey>("dados");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      <div role="tablist" aria-label="Seções de configuração" className="flex flex-wrap gap-2">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs
                          font-medium text-[#2a1d78] backdrop-blur-md transition-colors
                          shadow-[0_4px_14px_rgba(91,63,191,0.18)] ${
                            active
                              ? "border-purple-500 bg-purple-100"
                              : "border-purple-300/60 bg-white/75 hover:bg-white"
                          }`}
            >
              <Icon className="h-3.5 w-3.5 text-[#6d4fd6]" strokeWidth={1.5} />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "dados" && <ProfileForm user={user} />}

      {tab === "legislacao" && <LegislationTab />}

      {tab === "calculo" && <BaseCalculoTab />}
    </div>
  );
}

/* ---------- Meus dados ---------- */
function ProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [base, setBase] = useState(user); // últimos dados salvos
  const [f, setF] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender as Gender,
    username: user.username,
    email: user.email,
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => {
    setF({ ...f, [k]: e.target.value });
    setOk("");
  };

  const changed =
    f.firstName !== base.firstName ||
    f.lastName !== base.lastName ||
    f.gender !== base.gender ||
    f.username !== base.username ||
    f.email !== base.email ||
    newPassword !== "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    if (newPassword !== confirmNewPassword) return setError("As novas senhas não coincidem.");

    setBusy(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, newPassword, confirmNewPassword, currentPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) return setError(data.error || "Não foi possível salvar. Tente novamente.");

    setBase(data.user);
    setNewPassword("");
    setConfirmNewPassword("");
    setCurrentPassword("");
    setOk(data.passwordChanged ? "Dados e senha atualizados." : "Dados atualizados.");
    router.refresh(); // atualiza o nome na navbar e na mensagem de boas-vindas
  }

  return (
    <form onSubmit={submit} className={`${CARD_CLASS} flex flex-col gap-3`} noValidate>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[#6d4fd6]">
          <UserRound className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <h2 className="text-sm font-semibold text-[#2a1d78]">Meus dados</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primeiro nome" id="firstName">
          <input id="firstName" value={f.firstName} onChange={set("firstName")} autoComplete="given-name" className={INPUT_CLASS} />
        </Field>
        <Field label="Último nome" id="lastName">
          <input id="lastName" value={f.lastName} onChange={set("lastName")} autoComplete="family-name" className={INPUT_CLASS} />
        </Field>
        <Field label="Sexo" id="gender">
          <select id="gender" value={f.gender} onChange={set("gender")} className={INPUT_CLASS}>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="nao_informado">Prefiro não informar</option>
          </select>
        </Field>
        <Field label="Usuário" id="username">
          <input id="username" value={f.username} onChange={set("username")} autoComplete="username" className={INPUT_CLASS} />
        </Field>
      </div>

      <Field label="E-mail" id="email">
        <input id="email" type="email" value={f.email} onChange={set("email")} autoComplete="email" className={INPUT_CLASS} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nova senha (opcional)" id="newPassword">
          <input id="newPassword" type="password" value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setOk(""); }}
            autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={INPUT_CLASS} />
        </Field>
        <Field label="Confirmar nova senha" id="confirmNewPassword">
          <input id="confirmNewPassword" type="password" value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            autoComplete="new-password" className={INPUT_CLASS} />
        </Field>
      </div>

      {/* Autenticação para salvar */}
      <div className="rounded-lg border border-purple-300/60 bg-purple-50/80 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#2a1d78]">
          <ShieldCheck className="h-4 w-4 text-[#6d4fd6]" strokeWidth={1.5} />
          Confirme sua identidade
        </div>
        <Field label="Senha atual" id="currentPassword">
          <input id="currentPassword" type="password" value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password" placeholder="Digite sua senha atual para salvar" className={INPUT_CLASS} />
        </Field>
      </div>

      {error && <p role="alert" className="text-xs font-medium text-rose-700">{error}</p>}
      {ok && <p role="status" className="text-xs font-medium text-emerald-700">{ok}</p>}

      <div className="flex justify-end">
        <button disabled={busy || !changed || !currentPassword} className={PRIMARY_BUTTON_CLASS}>
          {busy ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>{label}</label>
      {children}
    </div>
  );
}
