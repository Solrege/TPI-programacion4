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
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import CategoriaForm from "../components/CategoriaForm";
import { useCategorias } from "../hooks/useCategorias";
import {
  useActualizarCategoria,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategoriaMutations";
import type { Categoria, CategoriaCreate } from "../types/categoria";

const columna = createColumnHelper<Categoria>();
const SIN_DATOS: Categoria[] = [];

function AdminCategoriasPage() {
  const categorias = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | undefined>();
  const [aEliminar, setAEliminar] = useState<Categoria | undefined>();

  const abrirNueva = () => {
    crear.reset();
    setEditando(undefined);
    setFormAbierto(true);
  };

  const abrirEdicion = (categoria: Categoria) => {
    actualizar.reset();
    setEditando(categoria);
    setFormAbierto(true);
  };

  const cerrarForm = () => setFormAbierto(false);

  const guardar = async (datos: CategoriaCreate) => {
    if (editando) {
      await actualizar.mutateAsync({ id: editando.id, datos });
    } else {
      await crear.mutateAsync(datos);
    }
    cerrarForm();
  };

  const pedirEliminacion = (categoria: Categoria) => {
    eliminar.reset();
    setAEliminar(categoria);
  };

  const confirmarEliminacion = () => {
    if (aEliminar) {
      eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(undefined) });
    }
  };

  const columnas = [
    columna.accessor("nombre", { header: "Nombre" }),
    columna.accessor("descripcion", {
      header: "Descripción",
      enableSorting: false,
      cell: (info) => info.getValue() ?? "—",
    }),
    columna.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variante="secundario" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button variante="fantasma" onClick={() => pedirEliminacion(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: categorias.data ?? SIN_DATOS,
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
        <h2 className="text-lg font-semibold text-slate-900">Categorías</h2>
        <Button onClick={abrirNueva}>Nueva categoría</Button>
      </div>

      {categorias.isPending ? (
        <Skeleton className="h-64" />
      ) : categorias.isError ? (
        <EstadoError
          mensaje={handleApiError(categorias.error)}
          onReintentar={() => void categorias.refetch()}
        />
      ) : (
        <DataTable table={table} mensajeVacio="Todavía no hay categorías." />
      )}

      <Modal
        abierto={formAbierto}
        titulo={editando ? "Editar categoría" : "Nueva categoría"}
        onClose={cerrarForm}
      >
        <CategoriaForm
          key={editando?.id ?? "nueva"}
          categoria={editando}
          error={errorForm ? handleApiError(errorForm) : null}
          onGuardar={guardar}
          onCancelar={cerrarForm}
        />
      </Modal>

      <Confirmacion
        abierto={aEliminar !== undefined}
        titulo="Eliminar categoría"
        mensaje={`¿Dar de baja «${aEliminar?.nombre ?? ""}»? Sus productos siguen en el catálogo hasta que los des de baja.`}
        textoConfirmar="Eliminar"
        procesando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setAEliminar(undefined)}
      />
    </div>
  );
}

export default AdminCategoriasPage;
