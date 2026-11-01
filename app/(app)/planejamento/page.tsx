import Image from "next/image";
import PlanejamentoView from "@/components/planejamento/PlanejamentoView";

export default function PlanejamentoPage() {
  return (
    <main className="relative min-h-0 w-full flex-1 overflow-hidden">
      <Image
        src="/Fundo2.jpg"
        alt="Imagem de fundo"
        fill
        priority
        className="object-cover"
      />

      <div className="relative z-10 h-full overflow-y-auto px-4 py-4">
        <PlanejamentoView />
      </div>
    </main>
  );
}