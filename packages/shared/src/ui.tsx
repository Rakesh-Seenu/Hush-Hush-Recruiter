import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ConsentStatus, EmailStatus, Stage } from "./types";

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ Button */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "subtle" | "danger";
  loading?: boolean;
};

export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";
  const variants: Record<string, string> = {
    primary:
      "bg-accent text-white shadow-glow hover:brightness-110 active:brightness-95",
    ghost: "border border-border text-text hover:bg-surface-2",
    subtle: "bg-surface-2 text-text hover:bg-border",
    danger: "bg-danger/90 text-white hover:bg-danger",
  };
  return (
    <button
      className={cx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------- Card */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "glass rounded-2xl border border-border p-5 shadow-card animate-fade-in",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ Spinner */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx("animate-spin text-current", className || "h-5 w-5")}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------- Badge */
const TONES: Record<string, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  accent: "bg-accent-soft text-accent border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

const STAGE_TONE: Record<Stage, keyof typeof TONES> = {
  sourced: "neutral",
  shortlisted: "accent",
  contacted: "warning",
  responded: "success",
  rejected: "danger",
};
const CONSENT_TONE: Record<ConsentStatus, keyof typeof TONES> = {
  pending: "warning",
  granted: "success",
  declined: "danger",
};
const EMAIL_TONE: Record<EmailStatus, keyof typeof TONES> = {
  not_sent: "neutral",
  sent: "success",
  failed: "danger",
};

export const StageBadge = ({ stage }: { stage: Stage }) => (
  <Badge tone={STAGE_TONE[stage]}>{stage}</Badge>
);
export const ConsentBadge = ({ status }: { status: ConsentStatus }) => (
  <Badge tone={CONSENT_TONE[status]}>{status}</Badge>
);
export const EmailBadge = ({ status }: { status: EmailStatus }) => (
  <Badge tone={EMAIL_TONE[status]}>{status.replace("_", " ")}</Badge>
);

/* ----------------------------------------------------------------- ScoreBar */
export function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="tabular-nums text-xs font-semibold text-text">{pct.toFixed(0)}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- StatCard */
export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 text-2xl font-bold text-text">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      {icon && (
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
          {icon}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ Avatar */
export function Avatar({ src, name, size = 36 }: { src?: string | null; name?: string | null; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return src ? (
    <img
      src={src}
      alt={name || "avatar"}
      width={size}
      height={size}
      className="rounded-full border border-border bg-surface-2 object-cover"
    />
  ) : (
    <div
      className="grid place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

/* -------------------------------------------------------------------- Logo */
export function Logo({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-glow">
        <span className="text-sm font-black">H</span>
      </div>
      <span className="text-base font-bold tracking-tight text-text">{label}</span>
    </div>
  );
}

export { cx };
