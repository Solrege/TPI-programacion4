import { useEffect, useId } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  abierto: boolean;
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ abierto, titulo, onClose, children }: ModalProps) {
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) {
      return;
    }
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", cerrarConEscape);
    return () => document.removeEventListener("keydown", cerrarConEscape);
  }, [abierto, onClose]);

  if (!abierto) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={tituloId} className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}

export default Modal;
