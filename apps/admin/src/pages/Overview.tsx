import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Spinner,
  StatCard,
  useAuth,
  type Metrics,
  type PipelineStatus,
} from "@hush/shared";
import { Activity, CheckCircle2, Mail, Play, ShieldCheck, Users2 } from "lucide-react";

export default function Overview() {
  const { api } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const [m, s] = await Promise.all([api.metrics(), api.pipelineStatus()]);
    setMetrics(m);
    setStatus(s);
    return s;
  }, [api]);

  useEffect(() => {
    api.scoringWeights().then(setWeights).catch(() => {});
    refresh().then((s) => setMode(s.mode)).catch(() => {});
    return () => {
      if (poll.current) clearInterval(poll.current);
    };
  }, [api, refresh]);

  const startPolling = useCallback(() => {
    if (poll.current) clearInterval(poll.current);
    poll.current = setInterval(async () => {
      const s = await refresh();
      if (!s.running && poll.current) {
        clearInterval(poll.current);
        poll.current = null;
        setNote(s.last_run?.message ?? "Pipeline finished.");
      }
    }, 2000);
  }, [refresh]);

  const run = async () => {
    setBusy(true);
    setNote(null);
    try {
      const res = await api.runPipeline(mode);
      setNote(res.message);
      if (res.success) {
        await refresh();
        startPolling();
      }
    } catch (e: any) {
      setNote(e?.message ?? "Failed to start pipeline.");
    } finally {
      setBusy(false);
    }
  };

  const running = status?.running ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Overview</h1>
        <p className="text-muted">Source, score, and shortlist candidates — transparently.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Sourced" value={metrics?.total ?? "—"} icon={<Users2 className="h-5 w-5" />} />
        <StatCard label="Shortlisted" value={metrics?.shortlisted ?? "—"} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Contacted" value={metrics?.contacted ?? "—"} icon={<Mail className="h-5 w-5" />} />
        <StatCard label="Consent" value={metrics?.consent_granted ?? "—"} icon={<ShieldCheck className="h-5 w-5" />} hint="granted" />
        <StatCard label="Emails" value={metrics?.emails_sent ?? "—"} icon={<CheckCircle2 className="h-5 w-5" />} hint="sent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text">Pipeline</h2>
              <p className="text-sm text-muted">
                Runs source → score → shortlist. Emails are never sent automatically.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-border p-1 text-sm">
                {(["demo", "live"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-lg px-3 py-1.5 font-medium capitalize transition ${
                      mode === m ? "bg-accent text-white" : "text-muted hover:text-text"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Button onClick={run} loading={busy || running} disabled={running}>
                <Play className="h-4 w-4" /> {running ? "Running…" : "Run pipeline"}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-surface-2/50 p-4">
            {running ? (
              <div className="flex items-center gap-3 text-sm text-text">
                <Spinner className="h-4 w-4 text-accent" />
                Sourcing and scoring candidates…
              </div>
            ) : status?.last_run ? (
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      status.last_run.status === "completed" ? "bg-success" : "bg-danger"
                    }`}
                  />
                  <span className="font-medium text-text">Last run · {status.last_run.status}</span>
                  <span className="text-muted">by {status.last_run.triggered_by}</span>
                </div>
                <p className="text-muted">{status.last_run.message}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">No runs yet.</p>
            )}
            {note && <p className="mt-2 text-sm text-accent">{note}</p>}
          </div>

          <p className="mt-3 text-xs text-muted">
            Autopilot:{" "}
            {status && status.autopilot_interval_minutes > 0
              ? `every ${status.autopilot_interval_minutes} min`
              : "off (set AUTOPILOT_INTERVAL_MINUTES to enable)"}
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-text">Scoring weights</h2>
          <p className="text-sm text-muted">Why a candidate ranks where they do.</p>
          <div className="mt-4 flex flex-col gap-3">
            {Object.entries(weights).map(([k, v]) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="capitalize text-text">{k.replace(/_/g, " ")}</span>
                  <span className="tabular-nums text-muted">{Math.round(v * 100)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${v * 100}%` }} />
                </div>
              </div>
            ))}
            {Object.keys(weights).length === 0 && (
              <p className="text-sm text-muted">Loading…</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
