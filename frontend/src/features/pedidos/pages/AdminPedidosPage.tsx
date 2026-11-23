import { useState } from "react";
import { handleApiError } from "@/shared/api/handleApiError";
import Confirmacion from "@/shared/components/Confirmacion";
import EstadoError from "@/shared/components/EstadoError";
import Skeleton from "@/shared/components/Skeleton";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import PedidoDetalle from "../components/PedidoDetalle";
import TablaPedidos from "../components/TablaPedidos";
import { useCambiarEstadoPedido } from "../hooks/useCambiarEstadoPedido";
import { usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types/pedido";

const OPCIONES_ESTADO: { valor: EstadoPedido; texto: string }[] = [
  { valor: "PENDIENTE", texto: "Pendiente" },
  { valor: "EN_PREPARACION", texto: "En preparación" },
  { valor: "ENTREGADO", texto: "Entregado" },
  { valor: "CANCELADO", texto: "Cancelado" },
];

function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined });
  const avanzar = useCambiarEstadoPedido();
  const cancelar = useCambiarEstadoPedido();

  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | undefined>();

  const detalle = pedidos.data?.items.find((p) => p.id === detalleId);

  const avanzarPedido = (pedido: Pedido, nuevo: EstadoPedido) =>
    avanzar.mutate({ id: pedido.id, datos: { estado: nuevo } });

  const pedirCancelacion = (pedido: Pedido) => {
    cancelar.reset();
    setACancelar(pedido);
  };

  const confirmarCancelacion = () => {
    if (aCancelar) {
      cancelar.mutate(
        { id: aCancelar.id, datos: { estado: "CANCELADO" } },
        { onSuccess: () => setACancelar(undefined) },
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pedidos</h2>
        <div className="w-56">
          <Select
            id="filtro-estado"
            label="Estado"
            value={estado}
            onChange={(e) =>
              setEstado(OPCIONES_ESTADO.find((o) => o.valor === e.target.value)?.valor ?? "")
            }
          >
            <option value="">Todos</option>
            {OPCIONES_ESTADO.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {avanzar.isError && <Alerta mensaje={handleApiError(avanzar.error)} />}

      {pedidos.isPending ? (
        <Skeleton className="h-64" />
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error)}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : (
        <TablaPedidos
          key={estado}
          pedidos={pedidos.data.items}
          procesandoId={avanzar.isPending ? avanzar.variables.id : null}
          onVerDetalle={(pedido) => setDetalleId(pedido.id)}
          onAvanzar={avanzarPedido}
          onCancelar={pedirCancelacion}
        />
      )}

      <Modal
        abierto={detalle !== undefined}
        titulo={`Pedido #${detalle?.id ?? ""}`}
        onClose={() => setDetalleId(null)}
      >
        {detalle && (
          <div className="space-y-4">
            <PedidoDetalle pedido={detalle} />
            <div className="flex justify-end">
              <Button variante="secundario" onClick={() => setDetalleId(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Confirmacion
        abierto={aCancelar !== undefined}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ""}? El stock de sus productos vuelve al catálogo.`}
        textoConfirmar="Cancelar pedido"
        procesando={cancelar.isPending}
        error={cancelar.isError ? handleApiError(cancelar.error) : null}
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setACancelar(undefined)}
      />
    </div>
  );
}

export default AdminPedidosPage;
