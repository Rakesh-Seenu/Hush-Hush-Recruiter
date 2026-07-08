import { useCallback, useEffect, useState } from "react";
import {
  ApiError,
  Button,
  Card,
  ConsentBadge,
  Spinner,
  useAuth,
  type Candidate,
  type ConsentStatus,
  type Stage,
} from "@hush/shared";
import { Check, Circle, Database, ShieldCheck, ShieldX } from "lucide-react";

const FUNNEL: { stage: Stage; label: string; blurb: string }[] = [
  { stage: "sourced", label: "Discovered", blurb: "We found your public work." },
  { stage: "shortlisted", label: "Shortlisted", blurb: "You ranked among the top matches." },
  { stage: "contacted", label: "Contacted", blurb: "We reached out to you." },
  { stage: "responded", label: "In conversation", blurb: "We're talking!" },
];

export default function Portal() {
  const { user, api } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "no-profile">("loading");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setCandidate(await api.myCandidate());
      setStatus("ready");
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setStatus("no-profile");
      else setStatus("no-profile");
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const setConsent = async (s: ConsentStatus) => {
    setSaving(true);
    try {
      setCandidate(await api.updateConsent(s));
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="grid place-items-center py-24">
        <Spinner className="h-7 w-7 text-accent" />
      </div>
    );
  }

  if (status === "no-profile" || !candidate) {
    return (
      <Card className="text-center">
        <h1 className="text-xl font-semibold text-text">Welcome, {user?.email}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">
          {user?.role === "admin"
            ? "You're signed in as a recruiter — this portal is for candidates."
            : "We don't have a candidate profile linked to your email yet. If a recruiter adds you, your application status will appear here."}
        </p>
      </Card>
    );
  }

  const currentIndex = FUNNEL.findIndex((f) => f.stage === candidate.stage);
  const rejected = candidate.stage === "rejected";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-accent">Candidate Portal</p>
        <h1 className="text-3xl font-bold text-text">Hi {candidate.name || candidate.username} 👋</h1>
        <p className="text-muted">Here's exactly where you stand and what we know about you.</p>
      </div>

      {/* Status timeline */}
      <Card>
        <h2 className="text-lg font-semibold text-text">Your application</h2>
        {rejected ? (
          <p className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            This role isn't moving forward, but your data remains under your control below.
          </p>
        ) : (
          <ol className="mt-5 space-y-5">
            {FUNNEL.map((step, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              return (
                <li key={step.stage} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border ${
                      done
                        ? "border-accent bg-accent text-white"
                        : active
                          ? "animate-pulse-ring border-accent text-accent"
                          : "border-border text-muted"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                  </span>
                  <div>
                    <p className={`font-medium ${active || done ? "text-text" : "text-muted"}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted">{step.blurb}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      {/* Consent management */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text">Consent</h2>
            <p className="text-sm text-muted">
              Current status: <ConsentBadge status={candidate.consent_status} />
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setConsent("granted")}
              loading={saving}
              disabled={candidate.consent_status === "granted"}
            >
              <ShieldCheck className="h-4 w-4" /> Grant
            </Button>
            <Button
              variant="danger"
              onClick={() => setConsent("declined")}
              loading={saving}
              disabled={candidate.consent_status === "declined"}
            >
              <ShieldX className="h-4 w-4" /> Withdraw
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          We only contact you after you grant consent. Withdraw anytime and we stop immediately.
        </p>
      </Card>

      {/* Data transparency */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-text">Everything we hold</h2>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            ["Source", candidate.source],
            ["Match score", `${candidate.score.toFixed(0)} / 100`],
            ["Followers", candidate.followers],
            ["Public repos", candidate.public_repos],
            ["Public gists", candidate.public_gists],
            ["Languages", candidate.languages || "—"],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-xl border border-border bg-surface-2/40 p-3">
              <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
              <dd className="mt-1 text-sm font-medium text-text">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
