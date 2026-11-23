import type { SubmitEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { errorDelCampo, longitud } from "@/shared/lib/form";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import Input, { Select, Textarea } from "@/shared/ui/Input";
import type { FormaPago } from "../types/pedido";

const FORMAS_PAGO: { valor: FormaPago; texto: string }[] = [
  { valor: "EFECTIVO", texto: "Efectivo" },
  { valor: "TRANSFERENCIA", texto: "Transferencia" },
];

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

const VALORES_INICIALES: DatosCheckout = {
  direccion_entrega: "",
  forma_pago: "EFECTIVO",
  notas: "",
};

interface FormularioCheckoutProps {
  onConfirmar: (datos: DatosCheckout) => Promise<void>;
  error: string | null;
}

function FormularioCheckout({ onConfirmar, error }: FormularioCheckoutProps) {
  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: ({ value }) => onConfirmar(value),
  });

  const enviar = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit().catch(() => undefined);
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <form.Field
        name="direccion_entrega"
        validators={{ onChange: longitud("Dirección de entrega", 5, 200) }}
      >
        {(field) => (
          <Input
            id="checkout-direccion"
            label="Dirección de entrega"
            autoComplete="street-address"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorDelCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            id="checkout-forma-pago"
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
            onBlur={field.handleBlur}
          >
            {FORMAS_PAGO.map((forma) => (
              <option key={forma.valor} value={forma.valor}>
                {forma.texto}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <Textarea
            id="checkout-notas"
            label="Notas (opcional)"
            placeholder="Ej.: sin cebolla, tocar timbre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      {error && <Alerta mensaje={error} />}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default FormularioCheckout;
