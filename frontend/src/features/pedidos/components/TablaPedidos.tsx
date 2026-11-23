import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import DataTable from "@/shared/components/DataTable";
import { formatearFecha, formatearPrecio } from "@/shared/lib/format";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import type { EstadoPedido, Pedido } from "../types/pedido";

const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; texto: string }>> = {
  PENDIENTE: { estado: "EN_PREPARACION", texto: "Preparar" },
  EN_PREPARACION: { estado: "ENTREGADO", texto: "Entregar" },
};

const CANCELABLES: EstadoPedido[] = ["PENDIENTE", "EN_PREPARACION"];

const columna = createColumnHelper<Pedido>();

interface TablaPedidosProps {
  pedidos: Pedido[];
  procesandoId: number | null;
  onVerDetalle: (pedido: Pedido) => void;
  onAvanzar: (pedido: Pedido, estado: EstadoPedido) => void;
  onCancelar: (pedido: Pedido) => void;
}

function TablaPedidos({
  pedidos,
  procesandoId,
  onVerDetalle,
  onAvanzar,
  onCancelar,
}: TablaPedidosProps) {
  const columnas = [
    columna.accessor("id", { header: "N.º", cell: (info) => `#${info.getValue()}` }),
    columna.accessor("created_at", {
      header: "Fecha",
      cell: (info) => formatearFecha(info.getValue()),
    }),
    columna.accessor("usuario_id", {
      header: "Cliente",
      cell: (info) => `Usuario #${info.getValue()}`,
    }),
    columna.accessor("total", {
      header: "Total",
      cell: (info) => formatearPrecio(info.getValue()),
    }),
    columna.accessor("estado", {
      header: "Estado",
      cell: (info) => <BadgeEstado estado={info.getValue()} />,
    }),
    columna.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const pedido = row.original;
        const siguiente = SIGUIENTE[pedido.estado];
        const procesando = procesandoId === pedido.id;
        return (
          <div className="flex gap-2">
            <Button variante="secundario" onClick={() => onVerDetalle(pedido)}>
              Detalle
            </Button>
            {siguiente && (
              <Button disabled={procesando} onClick={() => onAvanzar(pedido, siguiente.estado)}>
                {procesando ? "Guardando..." : siguiente.texto}
              </Button>
            )}
            {CANCELABLES.includes(pedido.estado) && (
              <Button variante="fantasma" disabled={procesando} onClick={() => onCancelar(pedido)}>
                Cancelar
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: pedidos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  return <DataTable table={table} mensajeVacio="No hay pedidos para mostrar." />;
}

export default TablaPedidos;
