import type { SubmitEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { errorDelCampo, requerido } from "@/shared/lib/form";
import Alerta from "@/shared/ui/Alerta";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import { useAuthStore } from "@/store/authStore";
import AuthCard from "../components/AuthCard";
import { useLogin } from "../hooks/useAuthMutations";

function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const desde = (location.state as { desde?: string } | null)?.desde ?? "/";

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({
        username: value.username.trim(),
        password: value.password,
      });
      navigate(desde, { replace: true });
    },
  });

  const enviar = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit().catch(() => undefined);
  };

  if (usuario && !loginMutation.isPending) {
    return <Navigate to={desde} replace />;
  }

  return (
    <AuthCard
      titulo="Iniciar sesión"
      pie={
        <>
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-medium text-orange-600 dark:text-orange-400 hover:underline">
            Registrate
          </Link>
        </>
      }
    >
      <form onSubmit={enviar} noValidate className="space-y-4">
        <form.Field
          name="username"
          validators={{ onChange: requerido("El usuario es obligatorio") }}
        >
          {(field) => (
            <Input
              id="login-username"
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
          name="password"
          validators={{ onChange: requerido("La contraseña es obligatoria") }}
        >
          {(field) => (
            <Input
              id="login-password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDelCampo(field.state.meta)}
            />
          )}
        </form.Field>

        {loginMutation.isError && <Alerta mensaje={handleApiError(loginMutation.error)} />}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
