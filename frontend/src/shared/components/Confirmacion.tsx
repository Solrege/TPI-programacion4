import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";

interface ConfirmacionProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  procesando: boolean;
  error: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

function Confirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  procesando,
  error,
  onConfirmar,
  onCancelar,
}: ConfirmacionProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onClose={onCancelar}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700">{mensaje}</p>
        {error && <Alerta mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onCancelar}>
            Volver
          </Button>
          <Button variante="peligro" disabled={procesando} onClick={onConfirmar}>
            {procesando ? "Procesando..." : textoConfirmar}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default Confirmacion;
