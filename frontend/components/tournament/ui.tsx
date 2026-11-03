"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { SectionIntro, Surface } from "@/components/tournament/primitives";
import { STATUS_LABELS, STATUS_TONES, type RegistrationStatus } from "@/lib/tournament";

/* ── Section headers (editorial, asymmetric) ─────────────────────────── */

export function SectionHeader({
  index,
  eyebrow,
  title,
  description,
  meta,
  align = "left",
  className = "",
  titleClassName = "",
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  // Single source of truth for section intros: the shared SectionIntro
  // primitive renders the index badge, eyebrow rule and editorial heading
  // used across every tournament surface.
  return (
    <SectionIntro
      index={index}
      eyebrow={eyebrow}
      title={title}
      description={description}
      meta={meta}
      align={align}
      className={className}
      titleClassName={titleClassName}
    />
  );
}

/* ── Status ──────────────────────────────────────────────────────────── */

export function StatusPill({
  status,
  className = "",
}: {
  status: RegistrationStatus | string;
  className?: string;
}) {
  const key = status as RegistrationStatus;
  const tone = STATUS_TONES[key] ?? "border-white/12 bg-white/5 text-ash";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${tone} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABELS[key] ?? status}
    </span>
  );
}

/* ── Buttons ─────────────────────────────────────────────────────────── */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "flare" | "ghost" | "quiet";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
};

export function Button({
  variant = "flare",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-[15px]",
  } as const;
  const variants = {
    flare: "btn-flare rounded-full",
    ghost: "btn-ghost rounded-full",
    quiet: "text-ash hover:text-bone rounded-full",
  } as const;

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`arena-focus inline-flex items-center justify-center gap-2 font-medium disabled:cursor-not-allowed disabled:opacity-55 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80"
        />
      )}
      {children}
    </button>
  );
}

/* ── Form primitives ─────────────────────────────────────────────────── */

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-bone/85">
        {label}
        {required && (
          <span aria-hidden="true" className="text-flare-500">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ash/80">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export const textInputClass =
  "input-arena rounded-lg arena-focus";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function TextInput({ invalid, className = "", ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      aria-describedby={rest["aria-describedby"]}
      className={`${textInputClass} ${className}`}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ invalid, className = "", children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      aria-invalid={invalid || undefined}
      className={`${textInputClass} appearance-none bg-[length:14px] bg-[right_0.9rem_center] bg-no-repeat pr-10 ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2396979E' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
      }}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  description,
  invalid,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  invalid?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.checked)}
        className="arena-focus mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/25 bg-white/5 text-flare-500 accent-[#F47C35]"
      />
      <label htmlFor={id} className="cursor-pointer text-[13px] leading-relaxed text-bone/85">
        {label}
        {description && <span className="mt-1 block text-xs text-ash">{description}</span>}
      </label>
    </div>
  );
}

/* ── Feedback surfaces ───────────────────────────────────────────────── */

export function EmptyState({
  title,
  description,
  action,
  icon = "ring",
}: {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  icon?: "ring" | "grid" | "trophy";
}) {
  return (
    <Surface notch={false} className="overflow-hidden px-6 py-10 text-center">
      <div className="mx-auto mb-5 h-16 w-16 text-flare-500/70 opacity-80">
        {icon === "ring" && <RingGlyph />}
        {icon === "grid" && <GridGlyph />}
        {icon === "trophy" && <TrophyGlyph />}
      </div>
      <p className="font-display text-lg font-semibold text-bone">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ash">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Surface>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="arena-focus mt-2 rounded font-medium text-red-100 underline underline-offset-4"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.06] ${className}`} />;
}

/* ── Steps ───────────────────────────────────────────────────────────── */

export function Steps({
  steps,
  current,
  onSelect,
}: {
  steps: string[];
  current: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((step, index) => {
        const state = index < current ? "done" : index === current ? "active" : "todo";
        const interactive = Boolean(onSelect) && index < current;
        return (
          <li key={step} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onSelect?.(index)}
              className={`arena-focus flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition ${
                state === "active"
                  ? "border-flare-500/70 bg-flare-500/12 text-flare-300"
                  : state === "done"
                    ? "border-white/12 bg-white/5 text-bone/70"
                    : "border-white/8 text-ash/60"
              } ${interactive ? "cursor-pointer hover:border-flare-500/50" : "cursor-default"}`}
            >
              <span
                className={`grid h-4 w-4 place-items-center rounded-full text-[9px] ${
                  state === "active"
                    ? "bg-flare-500 text-arena-950"
                    : state === "done"
                      ? "bg-bone/20 text-bone"
                      : "bg-white/8 text-ash"
                }`}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              {step}
            </button>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="h-px w-4 bg-white/12 sm:w-8" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Toasts ──────────────────────────────────────────────────────────── */

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

const ToastContext = createContext<{ push: (message: string, tone?: Toast["tone"]) => void } | null>(
  null,
);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((message: string, tone: Toast["tone"] = "info") => {
    counter.current += 1;
    const id = counter.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-5 left-1/2 z-[130] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-xl ${
              toast.tone === "success"
                ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-100"
                : toast.tone === "error"
                  ? "border-red-500/40 bg-red-500/12 text-red-100"
                  : "border-white/12 bg-arena-900/95 text-bone"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}

/* ── Modal ───────────────────────────────────────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[125] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="arena-panel arena-grain relative z-10 w-full max-w-lg rounded-t-2xl p-6 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-bone">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="arena-focus rounded p-1 text-ash transition hover:text-bone"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-bone/85">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Small glyphs (handcrafted, no icon library) ─────────────────────── */

export function RingGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="26" stroke="#F47C35" strokeOpacity="0.65" strokeWidth="2" />
      <circle cx="32" cy="32" r="19" stroke="#FFAA70" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 7" />
      <path d="M32 6v10M32 48v10M6 32h10M48 32h10" stroke="#F47C35" strokeOpacity="0.5" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="3" fill="#FFAA70" />
    </svg>
  );
}

export function GridGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <rect x="8" y="8" width="20" height="20" stroke="#F47C35" strokeOpacity="0.6" strokeWidth="1.5" />
      <rect x="36" y="8" width="20" height="20" stroke="#F47C35" strokeOpacity="0.28" strokeWidth="1.5" />
      <rect x="8" y="36" width="20" height="20" stroke="#F47C35" strokeOpacity="0.28" strokeWidth="1.5" />
      <rect x="36" y="36" width="20" height="20" stroke="#F47C35" strokeOpacity="0.6" strokeWidth="1.5" />
    </svg>
  );
}

export function TrophyGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <path d="M20 12h24v10a12 12 0 0 1-24 0V12Z" stroke="#F47C35" strokeOpacity="0.7" strokeWidth="1.6" />
      <path d="M20 16h-6a6 6 0 0 0 6 6M44 16h6a6 6 0 0 1-6 6" stroke="#F47C35" strokeOpacity="0.5" strokeWidth="1.6" />
      <path d="M32 34v8M24 50h16" stroke="#FFAA70" strokeOpacity="0.6" strokeWidth="1.8" />
      <path d="M22 50h20l-3 6H25l-3-6Z" stroke="#F47C35" strokeOpacity="0.7" strokeWidth="1.6" />
    </svg>
  );
}
