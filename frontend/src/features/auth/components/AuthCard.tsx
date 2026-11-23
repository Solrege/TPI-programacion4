import type { ReactNode } from "react";
import Card from "@/shared/ui/Card";

interface AuthCardProps {
  titulo: string;
  pie: ReactNode;
  children: ReactNode;
}

function AuthCard({ titulo, pie, children }: AuthCardProps) {
  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">{titulo}</h1>
        {children}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{pie}</p>
      </Card>
    </div>
  );
}

export default AuthCard;
