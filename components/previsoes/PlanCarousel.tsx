"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Largura de cada item dentro do carrossel: 2 por vez (1 no celular)
export const ITEM_CLASS = "w-full shrink-0 snap-start md:w-[calc((100%-0.75rem)/2)]";

const ARROW =
  "absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center " +
  "rounded-full border border-white/25 bg-[#1a0a5c] text-white shadow-lg " +
  "transition-colors hover:bg-purple-600";

export default function PlanCarousel({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, count]);

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Anteriores"
          className={`${ARROW} left-0 -translate-x-1/2`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {canRight && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Próximos"
          className={`${ARROW} right-0 translate-x-1/2`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}