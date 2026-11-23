import Button from "@/shared/ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-6 py-8 text-center"
    >
      <p className="text-sm text-red-700 dark:text-red-300">{mensaje}</p>
      {onReintentar && (
        <Button variante="secundario" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default EstadoError;
