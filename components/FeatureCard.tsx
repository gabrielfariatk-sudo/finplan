"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { playHoverSound } from "@/lib/sounds";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
  href,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      onMouseEnter={playHoverSound}
      aria-label={`Ir para ${title}`}
      className="group flex h-56 w-52 flex-col items-center gap-2 rounded-2xl
                 border border-white/15 bg-white/5 px-5 py-5 text-center
                 backdrop-blur-md transition-all duration-300
                 hover:-translate-y-1.5 hover:translate-x-1.5
                 hover:border-purple-400
                 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
    >
      <div className="h-12 w-12 shrink-0 text-purple-300 [&>svg]:h-full [&>svg]:w-full">
        {icon}
      </div>

      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <p className="text-xs leading-snug text-white/60">{description}</p>

      <span
        className="mt-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                   border border-white/20 bg-white/10 text-white
                   transition-colors group-hover:bg-purple-500"
      >
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}