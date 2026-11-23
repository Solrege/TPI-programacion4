function Alerta({ mensaje }: { mensaje: string }) {
  return (
    <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {mensaje}
    </p>
  );
}

export default Alerta;
