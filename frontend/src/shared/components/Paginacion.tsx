import Button from "@/shared/ui/Button";

interface PaginacionProps {
  pagina: number;
  total: number;
  limit: number;
  onCambiar: (pagina: number) => void;
}

function Paginacion({ pagina, total, limit, onCambiar }: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / limit));
  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 py-4">
      <Button
        variante="secundario"
        disabled={pagina === 0}
        onClick={() => onCambiar(pagina - 1)}
      >
        Anterior
      </Button>
      <span className="text-sm text-slate-600 dark:text-slate-400">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente
      </Button>
    </nav>
  );
}

export default Paginacion;
