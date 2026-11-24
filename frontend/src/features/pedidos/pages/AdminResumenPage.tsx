import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import Skeleton from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/lib/format";
import TarjetaResumen from "../components/TarjetaResumen";
import { useResumenPedidos } from "../hooks/useResumenPedidos";

function AdminResumenPage() {
  const resumen = useResumenPedidos();

  if (resumen.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (resumen.isError) {
    return (
      <EstadoError
        mensaje={handleApiError(resumen.error)}
        onReintentar={() => void resumen.refetch()}
      />
    );
  }

  const r = resumen.data;
  const tarjetas = [
    { titulo: "Pendientes", valor: r.pendientes, acento: "border-l-amber-400" },
    { titulo: "En preparación", valor: r.en_preparacion, acento: "border-l-blue-400" },
    { titulo: "Entregados", valor: r.entregados, acento: "border-l-green-500" },
    { titulo: "Cancelados", valor: r.cancelados, acento: "border-l-slate-400" },
    { titulo: "Pedidos de hoy", valor: r.pedidos_hoy, acento: "border-l-brand-500" },
    {
      titulo: "Ingresos (entregados)",
      valor: formatearPrecio(r.ingresos_entregados),
      acento: "border-l-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tarjetas.map((tarjeta) => (
        <TarjetaResumen key={tarjeta.titulo} {...tarjeta} />
      ))}
    </div>
  );
}

export default AdminResumenPage;
