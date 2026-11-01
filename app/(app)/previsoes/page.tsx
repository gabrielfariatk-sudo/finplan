import PrevisoesView from "@/components/previsoes/PrevisoesView";

export default function PrevisoesPage() {
  return (
    <main
      className="relative min-h-0 w-full flex-1 overflow-hidden
                 bg-linear-to-br from-[#05010f] via-[#0a0430] to-[#120a45]"
    >
      <PrevisoesView />
    </main>
  );
}