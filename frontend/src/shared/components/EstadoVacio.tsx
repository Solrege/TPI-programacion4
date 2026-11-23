import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  mensaje?: string;
  accion?: ReactNode;
}

function EstadoVacio({ titulo, mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-lg font-semibold text-slate-800">{titulo}</p>
      {mensaje && <p className="text-sm text-slate-500">{mensaje}</p>}
      {accion && <div className="mt-2">{accion}</div>}
    </div>
  );
}

export default EstadoVacio;
