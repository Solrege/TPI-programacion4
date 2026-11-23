import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import EstadoError from "@/shared/components/EstadoError";
import Skeleton from "@/shared/components/Skeleton";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useActivarUsuario, useDesactivarUsuario } from "../hooks/useUsuarioMutations";
import { useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types/usuario";

const columna = createColumnHelper<Usuario>();
const SIN_DATOS: Usuario[] = [];

function Etiqueta({ texto, clases }: { texto: string; clases: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${clases}`}>{texto}</span>
  );
}

function AdminUsuariosPage() {
  const usuarios = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const sesionId = useAuthStore((state) => state.usuario?.id);

  const procesandoId = activar.isPending
    ? activar.variables
    : desactivar.isPending
      ? desactivar.variables
      : null;
  const error = activar.error ?? desactivar.error;

  const columnas = [
    columna.accessor("username", { header: "Usuario" }),
    columna.accessor("full_name", { header: "Nombre" }),
    columna.accessor("email", { header: "Email" }),
    columna.accessor("role", {
      header: "Rol",
      cell: (info) =>
        info.getValue() === "admin" ? (
          <Etiqueta texto="Admin" clases="bg-orange-100 text-orange-800" />
        ) : (
          <Etiqueta texto="Cliente" clases="bg-slate-100 text-slate-700" />
        ),
    }),
    columna.accessor("disabled", {
      header: "Estado",
      cell: (info) =>
        info.getValue() ? (
          <Etiqueta texto="Inactivo" clases="bg-slate-200 text-slate-700" />
        ) : (
          <Etiqueta texto="Activo" clases="bg-green-100 text-green-800" />
        ),
    }),
    columna.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const usuario = row.original;
        const procesando = procesandoId === usuario.id;
        if (usuario.disabled) {
          return (
            <Button
              variante="secundario"
              disabled={procesando}
              onClick={() => {
                desactivar.reset();
                activar.mutate(usuario.id);
              }}
            >
              {procesando ? "Activando..." : "Activar"}
            </Button>
          );
        }
        if (usuario.id === sesionId) {
          return null;
        }
        return (
          <Button
            variante="fantasma"
            disabled={procesando}
            onClick={() => {
              activar.reset();
              desactivar.mutate(usuario.id);
            }}
          >
            {procesando ? "Desactivando..." : "Desactivar"}
          </Button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: usuarios.data ?? SIN_DATOS,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Usuarios</h2>

      {error && <Alerta mensaje={handleApiError(error)} />}

      {usuarios.isPending ? (
        <Skeleton className="h-64" />
      ) : usuarios.isError ? (
        <EstadoError
          mensaje={handleApiError(usuarios.error)}
          onReintentar={() => void usuarios.refetch()}
        />
      ) : (
        <DataTable table={table} mensajeVacio="Todavía no hay usuarios." />
      )}
    </div>
  );
}

export default AdminUsuariosPage;
