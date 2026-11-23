import { useState } from "react";
import type { SubmitEvent } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import Input, { Select } from "@/shared/ui/Input";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const LIMIT = 8;

function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [texto, setTexto] = useState("");
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>();

  const categorias = useCategorias();
  const productos = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: search || undefined,
    categoria_id: categoriaId,
  });

  const buscar = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(texto.trim());
    setPagina(0);
  };

  const cambiarCategoria = (valor: string) => {
    setCategoriaId(valor ? Number(valor) : undefined);
    setPagina(0);
  };

  const limpiarFiltros = () => {
    setTexto("");
    setSearch("");
    setCategoriaId(undefined);
    setPagina(0);
  };

  const hayFiltros = Boolean(search) || categoriaId !== undefined;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Catálogo</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <form onSubmit={buscar} className="flex flex-1 items-end gap-2">
          <div className="flex-1">
            <Input
              id="catalogo-busqueda"
              label="Buscar"
              type="search"
              placeholder="Nombre del producto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        <div className="sm:w-56">
          <Select
            id="catalogo-categoria"
            label="Categoría"
            value={categoriaId ?? ""}
            onChange={(e) => cambiarCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.data?.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {productos.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMIT }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.total === 0 ? (
        <EstadoVacio
          titulo="No hay productos"
          mensaje={hayFiltros ? "Probá con otra búsqueda o categoría." : undefined}
          accion={
            hayFiltros && (
              <Button variante="secundario" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div
            className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${
              productos.isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            {productos.data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            limit={LIMIT}
            onCambiar={setPagina}
          />
        </>
      )}
    </section>
  );
}

export default CatalogoPage;
