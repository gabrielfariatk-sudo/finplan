import Image from "next/image";
import DashboardView from "@/components/dashboard/DashboardView";

export default function DashboardPage() {
  return (
    <main className="relative min-h-0 w-full flex-1 overflow-hidden">
      <Image
        src="/fundo3.jpg"
        alt="Imagem de fundo"
        fill
        priority
        className="object-cover"
      />

      {/* Área rolável (o espaçamento lateral deixa os botões redondos livres) */}
      <div className="absolute inset-0 z-10 overflow-y-auto px-4 pb-24 pt-4 md:px-20 md:pb-6">
        <DashboardView />
      </div>
    </main>
  );
}