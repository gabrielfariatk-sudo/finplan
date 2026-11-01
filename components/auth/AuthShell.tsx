import Image from "next/image";
import type { ReactNode } from "react";

// Fundo + área rolável centralizada, reaproveitado por login e redefinição de senha
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-0 w-full flex-1 overflow-hidden">
      <Image src="/Fundo1.jpg" alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-[#05010f]/70" />
      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center gap-5 px-4 py-8">
          {children}
        </div>
      </div>
    </main>
  );
}

export const cardClass =
  "w-full rounded-2xl border border-purple-300/50 bg-[#1a0f4d]/60 p-7 " +
  "backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.3)]";

export const inputWrap =
  "flex items-center gap-3 rounded-xl border border-purple-500/60 bg-[#0a0628]/70 " +
  "px-4 transition-colors focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-400/40";

export const inputClass =
  "w-full bg-transparent py-3 text-base text-white placeholder:text-purple-200/50 outline-none";

export const submitClass =
  "mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base " +
  "text-white bg-linear-to-b from-[#7c4dff] to-[#5b21d6] transition " +
  "hover:brightness-110 disabled:cursor-wait disabled:opacity-60";
