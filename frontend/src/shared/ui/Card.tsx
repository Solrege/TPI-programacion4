import type { HTMLAttributes } from "react";

function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm ${className}`}
      {...props}
    />
  );
}

export default Card;
