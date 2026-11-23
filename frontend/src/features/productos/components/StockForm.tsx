import type { SubmitEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { errorDelCampo, numeroMinimo, valorNumerico } from "@/shared/lib/form";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import Input, { Checkbox } from "@/shared/ui/Input";
import type { Producto, ProductoStockUpdate } from "../types/producto";

interface StockFormProps {
  producto: Producto;
  error: string | null;
  onGuardar: (datos: ProductoStockUpdate) => Promise<void>;
  onCancelar: () => void;
}

function StockForm({ producto, error, onGuardar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onGuardar(value),
  });

  const enviar = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit().catch(() => undefined);
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <form.Field name="stock" validators={{ onChange: numeroMinimo("Stock", 0, true) }}>
        {(field) => (
          <Input
            id="stock-cantidad"
            label="Stock"
            type="number"
            min={0}
            step={1}
            autoFocus
            value={valorNumerico(field.state.value)}
            onChange={(e) => field.handleChange(e.target.valueAsNumber)}
            onBlur={field.handleBlur}
            error={errorDelCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <Checkbox
            id="stock-disponible"
            label="Disponible para la venta"
            checked={field.state.value}
            onChange={(e) => field.handleChange(e.target.checked)}
          />
        )}
      </form.Field>

      {error && <Alerta mensaje={error} />}

      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export default StockForm;
