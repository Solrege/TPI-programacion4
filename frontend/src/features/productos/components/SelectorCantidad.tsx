import { ajustarCantidad, valorNumerico } from "@/shared/lib/form";

interface SelectorCantidadProps {
  id: string;
  valor: number;
  max: number;
  disabled?: boolean;
  onCambiar: (valor: number) => void;
}

const BOTON =
  "flex size-9 cursor-pointer items-center justify-center text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

function SelectorCantidad({ id, valor, max, disabled = false, onCambiar }: SelectorCantidadProps) {
  const actual = ajustarCantidad(valor, max);

  return (
    <div className="flex items-center rounded-md border border-slate-300 bg-white">
      <button
        type="button"
        className={BOTON}
        aria-label="Restar una unidad"
        disabled={disabled || actual <= 1}
        onClick={() => onCambiar(actual - 1)}
      >
        −
      </button>
      <label htmlFor={id} className="sr-only">
        Cantidad
      </label>
      <input
        id={id}
        type="number"
        min={1}
        max={max}
        inputMode="numeric"
        disabled={disabled}
        value={valorNumerico(valor)}
        onChange={(e) => onCambiar(e.target.valueAsNumber)}
        onBlur={() => onCambiar(actual)}
        className="w-10 border-x border-slate-300 py-1.5 text-center text-sm outline-none [appearance:textfield] disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        className={BOTON}
        aria-label="Sumar una unidad"
        disabled={disabled || actual >= max}
        onClick={() => onCambiar(actual + 1)}
      >
        +
      </button>
    </div>
  );
}

export default SelectorCantidad;
