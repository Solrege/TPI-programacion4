import type { SubmitEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { errorDelCampo, longitud, validarEmail } from "@/shared/lib/form";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import AuthCard from "../components/AuthCard";
import { useRegistro } from "../hooks/useAuthMutations";

function RegisterPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const registroMutation = useRegistro();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      await registroMutation.mutateAsync({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      });
      navigate("/", { replace: true });
    },
  });

  const enviar = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit().catch(() => undefined);
  };

  if (usuario && !registroMutation.isPending) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthCard
      titulo="Crear cuenta"
      pie={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-medium text-orange-600 dark:text-orange-400 hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <form onSubmit={enviar} noValidate className="space-y-4">
        <form.Field name="username" validators={{ onChange: longitud("Usuario", 3, 50) }}>
          {(field) => (
            <Input
              id="registro-username"
              label="Usuario"
              autoComplete="username"
              autoFocus
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field
          name="full_name"
          validators={{ onChange: longitud("Nombre completo", 1, 100) }}
        >
          {(field) => (
            <Input
              id="registro-nombre"
              label="Nombre completo"
              autoComplete="name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="email" validators={{ onChange: validarEmail }}>
          {(field) => (
            <Input
              id="registro-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length >= 8 ? undefined : "La contraseña debe tener al menos 8 caracteres",
          }}
        >
          {(field) => (
            <Input
              id="registro-password"
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            />
          )}
        </form.Field>

        {registroMutation.isError && (
          <Alerta mensaje={handleApiError(registroMutation.error)} />
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

export default RegisterPage;
