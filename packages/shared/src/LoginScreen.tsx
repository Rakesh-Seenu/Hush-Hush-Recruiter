import { useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { Button, Card, Logo } from "./ui";
import type { Role } from "./types";

/**
 * Shared auth screen for both portals. `expectedRole` gates who this app is for;
 * the role itself is decided by the backend, and a mismatch is surfaced clearly.
 */
export function LoginScreen({
  appLabel,
  expectedRole,
  tagline,
  demoEmail,
  footer,
}: {
  appLabel: string;
  expectedRole: Role;
  tagline: string;
  demoEmail: string;
  footer?: ReactNode;
}) {
  const { login, register, mode } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (isRegister) {
        await register(email, password);
        setInfo("Account created. Verify your email, then sign in.");
        setIsRegister(false);
      } else {
        const me = await login(email, password);
        if (me.role !== expectedRole) {
          setError(
            `This account is a "${me.role}" account. The ${appLabel} is for ${expectedRole}s.`,
          );
        }
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo label={appLabel} />
          <h1 className="text-3xl font-bold text-gradient">{tagline}</h1>
        </div>

        <Card>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-muted">Password</span>
              <input
                type="password"
                required
                minLength={mode === "demo" ? 1 : 6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "demo" ? "any value in demo mode" : "Minimum 6 characters"}
                className="rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
              />
            </label>

            {error && <p className="text-sm text-danger">{error}</p>}
            {info && <p className="text-sm text-success">{info}</p>}

            <Button type="submit" loading={loading} className="mt-1 w-full">
              {isRegister ? "Create account" : "Sign in"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setIsRegister((v) => !v)}
            className="mt-4 w-full text-center text-sm text-muted hover:text-text"
          >
            {isRegister ? "Already have an account? Sign in" : "Need an account? Register"}
          </button>
        </Card>

        {mode === "demo" && (
          <div className="mt-4 rounded-xl border border-border bg-surface/60 p-3 text-center text-xs text-muted">
            <span className="font-semibold text-accent">Demo mode.</span> Sign in as{" "}
            <button
              type="button"
              className="font-mono text-text underline decoration-dotted"
              onClick={() => {
                setEmail(demoEmail);
                setPassword("demo");
              }}
            >
              {demoEmail}
            </button>{" "}
            (any password).
          </div>
        )}

        {footer && <div className="mt-4 text-center text-xs text-muted">{footer}</div>}
      </div>
    </div>
  );
}
