import type { SubmitEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { errorDelCampo, longitud } from "@/shared/lib/form";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import Input, { Textarea } from "@/shared/ui/Input";
import type { Categoria, CategoriaCreate } from "../types/categoria";

interface CategoriaFormProps {
  categoria?: Categoria;
  error: string | null;
  onGuardar: (datos: CategoriaCreate) => Promise<void>;
  onCancelar: () => void;
}

function CategoriaForm({ categoria, error, onGuardar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },
    onSubmit: ({ value }) =>
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      }),
  });

  const enviar = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit().catch(() => undefined);
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <form.Field name="nombre" validators={{ onChange: longitud("Nombre", 2, 100) }}>
        {(field) => (
          <Input
            id="categoria-nombre"
            label="Nombre"
            autoFocus
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorDelCampo(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            id="categoria-descripcion"
            label="Descripción (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
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

export default CategoriaForm;
