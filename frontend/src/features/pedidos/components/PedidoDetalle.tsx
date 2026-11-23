import { formatearFecha, formatearPrecio } from "@/shared/lib/format";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import type { Pedido } from "../types/pedido";

const FORMAS_PAGO = { EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia" } as const;

function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-slate-500">{formatearFecha(pedido.created_at)}</span>
        <BadgeEstado estado={pedido.estado} />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-slate-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        <dt className="text-slate-500">Forma de pago</dt>
        <dd>{FORMAS_PAGO[pedido.forma_pago]}</dd>
        {pedido.notas && (
          <>
            <dt className="text-slate-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>

      <table className="w-full">
        <thead className="border-b border-slate-200 text-left text-slate-500">
          <tr>
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-slate-200 font-bold">
          <tr>
            <td className="py-2" colSpan={3}>
              Total
            </td>
            <td className="py-2 text-right">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default PedidoDetalle;
