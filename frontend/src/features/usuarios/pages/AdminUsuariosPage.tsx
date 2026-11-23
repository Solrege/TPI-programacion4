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
  const [aDesactivar, setADesactivar] = useState<Usuario | undefined>();

  const procesandoId = activar.isPending ? activar.variables : null;

  const pedirDesactivacion = (usuario: Usuario) => {
    activar.reset();
    desactivar.reset();
    setADesactivar(usuario);
  };

  const confirmarDesactivacion = () => {
    if (aDesactivar) {
      desactivar.mutate(aDesactivar.id, { onSuccess: () => setADesactivar(undefined) });
    }
  };

  const columnas = [
    columna.accessor("username", { header: "Usuario" }),
    columna.accessor("full_name", { header: "Nombre" }),
    columna.accessor("email", { header: "Email" }),
    columna.accessor("role", {
      header: "Rol",
      cell: (info) =>
        info.getValue() === "admin" ? (
          <Etiqueta texto="Admin" clases="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200" />
        ) : (
          <Etiqueta texto="Cliente" clases="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" />
        ),
    }),
    columna.accessor("disabled", {
      header: "Estado",
      cell: (info) =>
        info.getValue() ? (
          <Etiqueta texto="Inactivo" clases="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300" />
        ) : (
          <Etiqueta texto="Activo" clases="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200" />
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
              onClick={() => activar.mutate(usuario.id)}
            >
              {procesando ? "Activando..." : "Activar"}
            </Button>
          );
        }
        if (usuario.id === sesionId) {
          return null;
        }
        return (
          <Button variante="fantasma" onClick={() => pedirDesactivacion(usuario)}>
            Desactivar
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
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Usuarios</h2>

      {activar.isError && <Alerta mensaje={handleApiError(activar.error)} />}

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

      <Confirmacion
        abierto={aDesactivar !== undefined}
        titulo="Desactivar usuario"
        mensaje={`¿Desactivar a «${aDesactivar?.username ?? ""}»? No va a poder iniciar sesión hasta que lo vuelvas a activar.`}
        textoConfirmar="Desactivar"
        procesando={desactivar.isPending}
        error={desactivar.isError ? handleApiError(desactivar.error) : null}
        onConfirmar={confirmarDesactivacion}
        onCancelar={() => setADesactivar(undefined)}
      />
    </div>
  );
}

export default AdminUsuariosPage;
