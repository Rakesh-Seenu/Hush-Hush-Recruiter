import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  ConsentBadge,
  EmailBadge,
  ScoreBar,
  Spinner,
  StageBadge,
  useAuth,
  type Candidate,
  type Stage,
} from "@hush/shared";
import { ExternalLink, Mail, RefreshCw } from "lucide-react";

const STAGES: (Stage | "all")[] = [
  "all",
  "sourced",
  "shortlisted",
  "contacted",
  "responded",
  "rejected",
];

export default function Candidates() {
  const { api } = useAuth();
  const [rows, setRows] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage | "all">("all");
  const [minScore, setMinScore] = useState(0);
  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listCandidates({
        stage: stage === "all" ? undefined : stage,
        minScore,
      });
      setRows(data.candidates);
    } finally {
      setLoading(false);
    }
  }, [api, stage, minScore]);

  useEffect(() => {
    load();
  }, [load]);

  const sendEmail = async (c: Candidate) => {
    setSending(c.username);
    setToast(null);
    try {
      const res = await api.sendEmail(c.username);
      setToast({ ok: res.success, msg: res.message });
      const updated = await api.getCandidate(c.username);
      setRows((rs) => rs.map((r) => (r.username === c.username ? updated : r)));
    } catch (e: any) {
      setToast({ ok: false, msg: e?.message ?? "Failed to send." });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Candidates</h1>
          <p className="text-muted">{rows.length} shown · ranked by score</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage | "all")}
            className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm capitalize text-text outline-none focus:border-accent"
          >
            {STAGES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted">
            min score
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="accent-accent"
            />
            <span className="w-6 tabular-nums text-text">{minScore}</span>
          </label>
          <Button variant="ghost" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            toast.ok
              ? "border-success/30 bg-success/10 text-success"
              : "border-warning/30 bg-warning/10 text-warning"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-muted">
            <Spinner className="h-5 w-5 text-accent" /> Loading candidates…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-muted">No candidates match these filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3">Candidate</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Languages</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Consent</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.username}
                    className="border-b border-border/60 last:border-0 hover:bg-surface-2/40"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={c.avatar_url} name={c.name || c.username} />
                        <div>
                          <div className="font-medium text-text">{c.name || c.username}</div>
                          <div className="text-xs text-muted">
                            @{c.username} · {c.email || "no email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <ScoreBar value={c.score} />
                    </td>
                    <td className="max-w-[220px] px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.languages
                          ? c.languages
                              .split(",")
                              .slice(0, 3)
                              .map((l) => (
                                <span
                                  key={l}
                                  className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs text-muted"
                                >
                                  {l.trim()}
                                </span>
                              ))
                          : "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StageBadge stage={c.stage} />
                    </td>
                    <td className="px-5 py-3">
                      <ConsentBadge status={c.consent_status} />
                    </td>
                    <td className="px-5 py-3">
                      <EmailBadge status={c.email_status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://github.com/${c.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted transition hover:text-text"
                          title="GitHub profile"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button
                          variant="subtle"
                          onClick={() => sendEmail(c)}
                          loading={sending === c.username}
                          disabled={!c.email || c.consent_status === "declined"}
                          title={
                            !c.email
                              ? "No email on file"
                              : c.consent_status === "declined"
                                ? "Candidate declined"
                                : "Send outreach email"
                          }
                        >
                          <Mail className="h-4 w-4" /> Email
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
