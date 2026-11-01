import Image from "next/image";
import { LayoutDashboard, CalendarCheck, Telescope } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import { welcomeText } from "@/lib/welcome";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <>
      <main className="relative min-h-0 w-full flex-1 overflow-hidden">
        <Image
          src="/Fundo1.jpg"
          alt="Imagem de fundo"
          fill
          priority
          className="object-cover"
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-6">
          {/* Mensagem de boas-vindas */}
          <div className="text-center">
            <h1
              className="bg-linear-to-b from-white to-purple-300 bg-clip-text
                         text-3xl font-bold tracking-tight text-transparent
                         sm:text-4xl"
            >
              {user ? `${welcomeText(user)}!` : "Bem-vindo(a)!"}
            </h1>
            <p className="mt-1 text-sm text-purple-200/90 sm:text-base">
              Escolha uma opção para continuar
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-wrap items-center justify-center gap-5">
            <FeatureCard
              icon={<LayoutDashboard strokeWidth={1.5} />}
              title="Dashboard"
              description="Visualize seu cenário financeiro em tempo real."
              href="/dashboard"
            />
            <FeatureCard
              icon={<CalendarCheck strokeWidth={1.5} />}
              title="Planejamento"
              description="Organize suas metas, defina seus limites e planeje o futuro."
              href="/planejamento"
            />
            <FeatureCard
              icon={<Telescope strokeWidth={1.5} />}
              title="Previsões"
              description="Antecipe cenários, corte imprevistos e tome decisões melhores."
              href="/previsoes"
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}