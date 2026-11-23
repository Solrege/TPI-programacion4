import type { SubmitEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { errorDelCampo, longitud, numeroMinimo, valorNumerico } from "@/shared/lib/form";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import Input, { Checkbox, Select, Textarea } from "@/shared/ui/Input";
import type { Producto, ProductoCreate } from "../types/producto";

interface ProductoFormProps {
  producto?: Producto;
  error: string | null;
  onGuardar: (datos: ProductoCreate) => Promise<void>;
  onCancelar: () => void;
}

function ProductoForm({ producto, error, onGuardar, onCancelar }: ProductoFormProps) {
  const categorias = useCategorias();

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto?.precio_base ?? Number.NaN,
      imagen_url: producto?.imagen_url ?? "",
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? Number.NaN,
    },
    onSubmit: ({ value }) =>
      onGuardar({
        ...value,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        imagen_url: value.imagen_url.trim() || null,
      }),
  });

  const enviar = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit().catch(() => undefined);
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <form.Field name="nombre" validators={{ onChange: longitud("Nombre", 1) }}>
        {(field) => (
          <Input
            id="producto-nombre"
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
            id="producto-descripcion"
            label="Descripción (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value) ? "Elegí una categoría" : undefined,
          }}
        >
          {(field) => (
            <Select
              id="producto-categoria"
              label="Categoría"
              value={valorNumerico(field.state.value)}
              onChange={(e) => field.handleChange(Number(e.target.value || Number.NaN))}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            >
              <option value="">Elegir...</option>
              {categorias.data?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <form.Field name="precio_base" validators={{ onChange: numeroMinimo("Precio", 0) }}>
          {(field) => (
            <Input
              id="producto-precio"
              label="Precio"
              type="number"
              min={0}
              step="0.01"
              value={valorNumerico(field.state.value)}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="stock" validators={{ onChange: numeroMinimo("Stock", 0, true) }}>
          {(field) => (
            <Input
              id="producto-stock"
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={valorNumerico(field.state.value)}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id="producto-imagen"
              label="URL de la imagen (opcional)"
              type="url"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="disponible">
        {(field) => (
          <Checkbox
            id="producto-disponible"
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

export default ProductoForm;
