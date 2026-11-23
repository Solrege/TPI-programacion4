import { formatearPrecio } from "@/shared/lib/format";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import type { Producto } from "../types/producto";

function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((state) => state.agregar);
  const enCarrito = useCartStore(
    (state) => state.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );

  const sinStock = !producto.disponible || producto.stock === 0;
  const alcanzoStock = enCarrito >= producto.stock;

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          loading="lazy"
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-orange-50 text-4xl font-bold text-orange-300">
          {producto.nombre.charAt(0)}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-orange-600">
          {producto.categoria.nombre}
        </span>
        <h2 className="font-semibold text-slate-900">{producto.nombre}</h2>
        {producto.descripcion && (
          <p className="text-sm text-slate-600">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">
            {formatearPrecio(producto.precio_base)}
          </span>
          <span className="text-xs text-slate-500">
            {sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button
          disabled={sinStock || alcanzoStock}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
          }
        >
          {sinStock
            ? "No disponible"
            : alcanzoStock
              ? "Sin más stock"
              : "Agregar al carrito"}
        </Button>
        {enCarrito > 0 && (
          <p className="text-center text-xs text-slate-500">En el carrito: {enCarrito}</p>
        )}
      </div>
    </Card>
  );
}

export default ProductoCard;
