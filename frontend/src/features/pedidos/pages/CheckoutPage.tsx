import { useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { formatearPrecio } from "@/shared/lib/format";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import FormularioCheckout from "../components/FormularioCheckout";
import type { DatosCheckout } from "../components/FormularioCheckout";
import { useCrearPedido } from "../hooks/useCrearPedido";

function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  const confirmar = async (datos: DatosCheckout) => {
    await crearPedido.mutateAsync({
      items: items.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
      })),
      forma_pago: datos.forma_pago,
      direccion_entrega: datos.direccion_entrega.trim(),
      notas: datos.notas.trim() || null,
    });
    vaciar();
    navigate("/mis-pedidos", { replace: true });
  };

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        mensaje="Tu carrito está vacío."
        accion={<Button onClick={() => navigate("/")}>Ver catálogo</Button>}
      />
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Confirmar pedido</h1>
        <Card>
          <FormularioCheckout
            onConfirmar={confirmar}
            error={crearPedido.isError ? handleApiError(crearPedido.error) : null}
          />
        </Card>
      </div>

      <Card className="h-fit">
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Resumen</h2>
        <ul className="divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          {items.map((item) => (
            <li key={item.producto_id} className="flex justify-between py-2">
              <span>
                {item.cantidad} × {item.nombre}
              </span>
              <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-slate-200 dark:border-slate-700 pt-3 font-bold">
          <span>Total</span>
          <span>{formatearPrecio(total)}</span>
        </p>
      </Card>
    </section>
  );
}

export default CheckoutPage;
