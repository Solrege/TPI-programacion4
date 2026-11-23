import { useNavigate } from "react-router-dom";
import EstadoVacio from "@/shared/components/EstadoVacio";
import { formatearPrecio } from "@/shared/lib/format";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import FilaCarrito from "../components/FilaCarrito";

function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo."
        accion={<Button onClick={() => navigate("/")}>Ver catálogo</Button>}
      />
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Carrito</h1>

      <Card>
        <ul className="divide-y divide-slate-200">
          {items.map((item) => (
            <FilaCarrito key={item.producto_id} item={item} />
          ))}
        </ul>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg">
          Total: <span className="font-bold">{formatearPrecio(total)}</span>
        </p>
        <div className="flex gap-2">
          <Button variante="secundario" onClick={vaciar}>
            Vaciar carrito
          </Button>
          <Button onClick={() => navigate("/checkout")}>Confirmar pedido</Button>
        </div>
      </Card>
    </section>
  );
}

export default CarritoPage;
