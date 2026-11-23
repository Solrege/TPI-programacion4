import Card from "@/shared/ui/Card";

interface TarjetaResumenProps {
  titulo: string;
  valor: string | number;
  acento: string;
}

function TarjetaResumen({ titulo, valor, acento }: TarjetaResumenProps) {
  return (
    <Card className={`border-l-4 ${acento}`}>
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{valor}</p>
    </Card>
  );
}

export default TarjetaResumen;
