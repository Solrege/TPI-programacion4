import { useEffect, useState } from "react";
import { ajustarCantidad } from "@/shared/lib/form";
import { formatearPrecio } from "@/shared/lib/format";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import type { Producto } from "../types/producto";
import SelectorCantidad from "./SelectorCantidad";

function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((state) => state.agregar);
  const enCarrito = useCartStore(
    (state) => state.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );

  const [cantidad, setCantidad] = useState(1);
  const [agregados, setAgregados] = useState(0);
  const agregado = agregados > 0;

  useEffect(() => {
    if (agregados === 0) return;
    const temporizador = setTimeout(() => {
      setAgregados(0);
      setCantidad(1);
    }, 1500);
    return () => clearTimeout(temporizador);
  }, [agregados]);

  const sinStock = !producto.disponible || producto.stock === 0;
  const restante = producto.stock - enCarrito;
  const alcanzoStock = restante <= 0;

  const agregarAlCarrito = () => {
    const unidades = ajustarCantidad(cantidad, restante);
    agregar(
      {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_base,
      },
      unidades,
    );
    setAgregados(unidades);
  };

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="relative">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            className={`h-40 w-full object-cover ${sinStock ? "opacity-60 grayscale" : ""}`}
          />
        ) : (
          <div
            className={`flex h-40 items-center justify-center bg-brand-50 dark:bg-brand-950/40 text-4xl font-bold text-brand-300 dark:text-brand-500 ${sinStock ? "opacity-60 grayscale" : ""}`}
          >
            {producto.nombre.charAt(0)}
          </div>
        )}
        {sinStock && (
          <span className="absolute right-2 top-2 rounded-full bg-slate-700 px-2.5 py-1 text-xs font-semibold text-white shadow">
            Sin stock
          </span>
        )}
        {!sinStock && enCarrito > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            {enCarrito} en el carrito
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          {producto.categoria.nombre}
        </span>
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">{producto.nombre}</h2>
        {producto.descripcion && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatearPrecio(producto.precio_base)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {sinStock
              ? "Sin stock"
              : alcanzoStock
                ? "Sin más stock"
                : `Stock: ${producto.stock}`}
          </span>
        </div>

        <div className="flex gap-2">
          <SelectorCantidad
            id={`cantidad-${producto.id}`}
            valor={cantidad}
            max={restante}
            disabled={sinStock || alcanzoStock || agregado}
            onCambiar={setCantidad}
          />
          <Button
            className="flex-1"
            variante={agregado ? "exito" : "primario"}
            disabled={!agregado && (sinStock || alcanzoStock)}
            onClick={agregado ? undefined : agregarAlCarrito}
          >
            {agregado ? (
              <>
                <span aria-hidden="true">✓</span>
                <span className="sr-only">Agregado</span>
              </>
            ) : (
              "Agregar"
            )}
          </Button>
        </div>
        <p className="-mt-1 h-4 text-center text-xs font-medium text-green-700 dark:text-green-400" aria-live="polite">
          {agregado && `${agregados} ${agregados === 1 ? "agregado" : "agregados"} al carrito`}
        </p>
      </div>
    </Card>
  );
}

export default ProductoCard;
