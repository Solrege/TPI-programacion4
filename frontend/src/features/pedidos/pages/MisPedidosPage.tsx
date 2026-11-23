import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import { formatearFecha, formatearPrecio } from "@/shared/lib/format";
import Alerta from "@/shared/ui/Alerta";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Modal from "@/shared/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCancelarPedido } from "../hooks/useCancelarPedido";
import { usePedidos } from "../hooks/usePedidos";

const LIMIT = 10;

function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);
  const pedidos = usePedidos({ skip: pagina * LIMIT, limit: LIMIT });
  const cancelar = useCancelarPedido();
  const navigate = useNavigate();
  const usuario = useAuthStore((state) => state.usuario);
  const esAdmin = usuario?.role === "admin";

  const seleccionado = pedidos.data?.items.find((p) => p.id === seleccionadoId);
  const puedeCancelar =
    seleccionado?.estado === "PENDIENTE" && seleccionado.usuario_id === usuario?.id;

  const cerrarDetalle = () => {
    setSeleccionadoId(null);
    cancelar.reset();
  };

  if (pedidos.isPending) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (pedidos.isError) {
    return (
      <EstadoError
        mensaje={handleApiError(pedidos.error)}
        onReintentar={() => void pedidos.refetch()}
      />
    );
  }

  if (pedidos.data.total === 0) {
    return (
      <EstadoVacio
        titulo={esAdmin ? "Todavía no hay pedidos" : "Todavía no hiciste pedidos"}
        accion={<Button onClick={() => navigate("/")}>Ver catálogo</Button>}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>
        {esAdmin && (
          <p className="text-sm text-slate-500">
            Como administrador ves los pedidos de todos los clientes.
          </p>
        )}
      </div>

      <ul className="space-y-3">
        {pedidos.data.items.map((pedido) => (
          <li key={pedido.id}>
            <Card className="flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  Pedido #{pedido.id}
                  {esAdmin && (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      Usuario #{pedido.usuario_id}
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500">
                  {formatearFecha(pedido.created_at)} · {pedido.items.length}{" "}
                  {pedido.items.length === 1 ? "producto" : "productos"}
                </p>
              </div>
              <BadgeEstado estado={pedido.estado} />
              <p className="w-28 text-right font-semibold">{formatearPrecio(pedido.total)}</p>
              <Button variante="secundario" onClick={() => setSeleccionadoId(pedido.id)}>
                Ver detalle
              </Button>
            </Card>
          </li>
        ))}
      </ul>

      <Paginacion
        pagina={pagina}
        total={pedidos.data.total}
        limit={LIMIT}
        onCambiar={setPagina}
      />

      <Modal
        abierto={seleccionado !== undefined}
        titulo={`Pedido #${seleccionado?.id ?? ""}`}
        onClose={cerrarDetalle}
      >
        {seleccionado && (
          <div className="space-y-4">
            <PedidoDetalle pedido={seleccionado} />
            {cancelar.isError && <Alerta mensaje={handleApiError(cancelar.error)} />}
            <div className="flex justify-end gap-2">
              {puedeCancelar && (
                <Button
                  variante="peligro"
                  disabled={cancelar.isPending}
                  onClick={() => cancelar.mutate(seleccionado.id)}
                >
                  {cancelar.isPending ? "Cancelando..." : "Cancelar pedido"}
                </Button>
              )}
              <Button variante="secundario" onClick={cerrarDetalle}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default MisPedidosPage;
