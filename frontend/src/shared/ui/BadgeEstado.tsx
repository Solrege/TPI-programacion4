import type { EstadoPedido } from "@/features/pedidos/types/pedido";

const ESTILOS: Record<EstadoPedido, { texto: string; clases: string }> = {
  PENDIENTE: { texto: "Pendiente", clases: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200" },
  EN_PREPARACION: { texto: "En preparación", clases: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200" },
  ENTREGADO: { texto: "Entregado", clases: "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200" },
  CANCELADO: { texto: "Cancelado", clases: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300" },
};

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { texto, clases } = ESTILOS[estado];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${clases}`}>
      {texto}
    </span>
  );
}

export default BadgeEstado;
