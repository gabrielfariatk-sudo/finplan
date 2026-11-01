import { Info } from "lucide-react";
import type { ReactNode } from "react";

export default function InfoNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="mb-3 flex items-center gap-2.5 rounded-lg border
                 border-l-4 border-purple-400 border-l-purple-600
                 bg-linear-to-r from-purple-200 to-violet-100 px-3 py-2.5
                 shadow-[0_3px_10px_rgba(109,40,217,0.18)]"
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                   bg-purple-600 text-white"
      >
        <Info className="h-3.5 w-3.5" />
      </span>
      <p className="text-[11px] font-medium leading-snug text-[#2a1d78]">
        {children}
      </p>
    </div>
  );
}