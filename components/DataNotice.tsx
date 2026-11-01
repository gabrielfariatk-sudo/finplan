// Aviso discreto de carregamento / falha ao salvar (serve para páginas claras e escuras)
export default function DataNotice({ loading, error }: { loading?: boolean; error?: string | null }) {
  if (error) {
    return (
      <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
        {error}
      </p>
    );
  }
  if (loading) {
    return (
      <p role="status" className="rounded-lg border border-purple-300/60 bg-white/70 px-3 py-2 text-xs text-[#4c3a9e]">
        Carregando seus dados…
      </p>
    );
  }
  return null;
}
