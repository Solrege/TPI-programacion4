import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import Confirmacion from "@/shared/components/Confirmacion";
import DataTable from "@/shared/components/DataTable";
import EstadoError from "@/shared/components/EstadoError";
import Skeleton from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/lib/format";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import ProductoForm from "../components/ProductoForm";
import StockForm from "../components/StockForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
} from "../hooks/useProductoMutations";
import { useProductos } from "../hooks/useProductos";
import type { Producto, ProductoCreate, ProductoStockUpdate } from "../types/producto";

const columna = createColumnHelper<Producto>();
const SIN_DATOS: Producto[] = [];
const FILTROS_PANEL = { skip: 0, limit: 100 };

function AdminProductosPage() {
  const productos = useProductos(FILTROS_PANEL);
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | undefined>();
  const [enStock, setEnStock] = useState<Producto | undefined>();
  const [aEliminar, setAEliminar] = useState<Producto | undefined>();

  const abrirNuevo = () => {
    crear.reset();
    setEditando(undefined);
    setFormAbierto(true);
  };

  const abrirEdicion = (producto: Producto) => {
    actualizar.reset();
    setEditando(producto);
    setFormAbierto(true);
  };

  const cerrarForm = () => setFormAbierto(false);

  const guardar = async (datos: ProductoCreate) => {
    if (editando) {
      await actualizar.mutateAsync({ id: editando.id, datos });
    } else {
      await crear.mutateAsync(datos);
    }
    cerrarForm();
  };

  const abrirStock = (producto: Producto) => {
    actualizarStock.reset();
    setEnStock(producto);
  };

  const guardarStock = async (datos: ProductoStockUpdate) => {
    if (enStock) {
      await actualizarStock.mutateAsync({ id: enStock.id, datos });
      setEnStock(undefined);
    }
  };

  const pedirEliminacion = (producto: Producto) => {
    eliminar.reset();
    setAEliminar(producto);
  };

  const confirmarEliminacion = () => {
    if (aEliminar) {
      eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(undefined) });
    }
  };

  const columnas = [
    columna.accessor("nombre", { header: "Nombre" }),
    columna.accessor((producto) => producto.categoria.nombre, {
      id: "categoria",
      header: "Categoría",
    }),
    columna.accessor("precio_base", {
      header: "Precio",
      cell: (info) => formatearPrecio(info.getValue()),
    }),
    columna.accessor("stock", { header: "Stock" }),
    columna.accessor("disponible", {
      header: "Disponible",
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            Sí
          </span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
            No
          </span>
        ),
    }),
    columna.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variante="secundario" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button variante="secundario" onClick={() => abrirStock(row.original)}>
            Stock
          </Button>
          <Button variante="fantasma" onClick={() => pedirEliminacion(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: productos.data?.items ?? SIN_DATOS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const errorForm = editando ? actualizar.error : crear.error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Productos</h2>
        <Button onClick={abrirNuevo}>Nuevo producto</Button>
      </div>

      {productos.isPending ? (
        <Skeleton className="h-64" />
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      ) : (
        <DataTable table={table} mensajeVacio="Todavía no hay productos." />
      )}

      <Modal
        abierto={formAbierto}
        titulo={editando ? "Editar producto" : "Nuevo producto"}
        onClose={cerrarForm}
      >
        <ProductoForm
          key={editando?.id ?? "nuevo"}
          producto={editando}
          error={errorForm ? handleApiError(errorForm) : null}
          onGuardar={guardar}
          onCancelar={cerrarForm}
        />
      </Modal>

      <Modal
        abierto={enStock !== undefined}
        titulo={`Stock de «${enStock?.nombre ?? ""}»`}
        onClose={() => setEnStock(undefined)}
      >
        {enStock && (
          <StockForm
            key={enStock.id}
            producto={enStock}
            error={actualizarStock.isError ? handleApiError(actualizarStock.error) : null}
            onGuardar={guardarStock}
            onCancelar={() => setEnStock(undefined)}
          />
        )}
      </Modal>

      <Confirmacion
        abierto={aEliminar !== undefined}
        titulo="Eliminar producto"
        mensaje={`¿Dar de baja «${aEliminar?.nombre ?? ""}»? Deja de aparecer en el catálogo; los pedidos existentes no cambian.`}
        textoConfirmar="Eliminar"
        procesando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setAEliminar(undefined)}
      />
    </div>
  );
}

export default AdminProductosPage;
