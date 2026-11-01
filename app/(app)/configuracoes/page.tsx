import Image from "next/image";
import { redirect } from "next/navigation";
import SettingsView from "@/components/configuracoes/SettingsView";
import { getCurrentUser } from "@/lib/auth";

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
        <SettingsView user={user} />
      </div>
    </main>
  );
}
