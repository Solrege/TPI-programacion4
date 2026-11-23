import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const BASE =
  "w-full rounded-md border bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:ring-2";
const OK = "border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-200 dark:focus:ring-orange-900";
const ERROR = "border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900";

interface CampoProps {
  id: string;
  label: string;
  error?: string;
}

function Campo({ id, label, error, children }: CampoProps & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function propsDeCampo(id: string, error?: string) {
  return {
    id,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    className: `${BASE} ${error ? ERROR : OK}`,
  };
}

type InputProps = CampoProps & InputHTMLAttributes<HTMLInputElement>;

function Input({ id, label, error, ...props }: InputProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <input {...props} {...propsDeCampo(id, error)} />
    </Campo>
  );
}

type TextareaProps = CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ id, label, error, rows = 3, ...props }: TextareaProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <textarea rows={rows} {...props} {...propsDeCampo(id, error)} />
    </Campo>
  );
}

type SelectProps = CampoProps & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ id, label, error, children, ...props }: SelectProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <select {...props} {...propsDeCampo(id, error)}>
        {children}
      </select>
    </Campo>
  );
}

export default Input;

type CheckboxProps = { id: string; label: string } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
      <input
        id={id}
        type="checkbox"
        className="size-4 rounded border-slate-300 dark:border-slate-600 accent-orange-600"
        {...props}
      />
      {label}
    </label>
  );
}
