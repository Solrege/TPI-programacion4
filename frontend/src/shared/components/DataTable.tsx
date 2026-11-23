import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import Paginacion from "./Paginacion";

const ICONO_ORDEN = { asc: "▲", desc: "▼" } as const;

interface DataTableProps<TData> {
  table: Table<TData>;
  mensajeVacio?: string;
}

function DataTable<TData>({ table, mensajeVacio = "No hay registros." }: DataTableProps<TData>) {
  const filas = table.getRowModel().rows;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const orden = header.column.getIsSorted();
                  const contenido = flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  );
                  return (
                    <th key={header.id} scope="col" className="px-4 py-3 font-semibold">
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex cursor-pointer items-center gap-1 uppercase hover:text-slate-900 dark:hover:text-slate-100"
                        >
                          {contenido}
                          <span className="w-3 text-[10px]">
                            {orden ? ICONO_ORDEN[orden] : "↕"}
                          </span>
                        </button>
                      ) : (
                        contenido
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
                >
                  {mensajeVacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-slate-700 dark:text-slate-300">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Paginacion
        pagina={pageIndex}
        total={table.getRowCount()}
        limit={pageSize}
        onCambiar={table.setPageIndex}
      />
    </div>
  );
}

export default DataTable;
