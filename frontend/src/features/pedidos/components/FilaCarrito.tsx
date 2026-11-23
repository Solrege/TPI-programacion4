import { formatearPrecio } from "@/shared/lib/format";
import Button from "@/shared/ui/Button";
import { useCartStore } from "@/store/cartStore";
import type { ItemCarrito } from "@/store/cartStore";

function FilaCarrito({ item }: { item: ItemCarrito }) {
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <div className="min-w-40 flex-1">
        <p className="font-medium text-slate-900 dark:text-slate-100">{item.nombre}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variante="secundario"
          aria-label={`Quitar una unidad de ${item.nombre}`}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
        >
          −
        </Button>
        <span className="w-8 text-center font-medium" aria-live="polite">
          {item.cantidad}
        </span>
        <Button
          variante="secundario"
          aria-label={`Agregar una unidad de ${item.nombre}`}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
        >
          +
        </Button>
      </div>

      <p className="w-28 text-right font-semibold text-slate-900 dark:text-slate-100">
        {formatearPrecio(item.precio_unitario * item.cantidad)}
      </p>

      <Button variante="fantasma" onClick={() => quitar(item.producto_id)}>
        Quitar
      </Button>
    </li>
  );
}

export default FilaCarrito;
