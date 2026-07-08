import type {
  ActionResult,
  Candidate,
  CandidateList,
  ConsentStatus,
  Me,
  Metrics,
  PipelineStatus,
} from "./types";

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

/** Returns the auth headers to attach to each request (Bearer token or demo header). */
export type AuthHeaderProvider = () => Promise<Record<string, string>>;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function createApiClient(getAuthHeaders: AuthHeaderProvider, baseUrl = API_BASE_URL) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const auth = await getAuthHeaders();
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...auth,
        ...(init.headers || {}),
      },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const detail = (data && (data.detail || data.message)) || res.statusText;
      throw new ApiError(res.status, String(detail));
    }
    return data as T;
  }

  return {
    health: () => request<Record<string, unknown>>("/api/health"),
    me: () => request<Me>("/api/me"),

    // candidate portal
    myCandidate: () => request<Candidate>("/api/me/candidate"),
    updateConsent: (status: ConsentStatus) =>
      request<Candidate>("/api/me/consent", {
        method: "POST",
        body: JSON.stringify({ status }),
      }),

    // admin console
    listCandidates: (params: { stage?: string; minScore?: number } = {}) => {
      const q = new URLSearchParams();
      if (params.stage) q.set("stage", params.stage);
      if (params.minScore != null) q.set("min_score", String(params.minScore));
      const qs = q.toString();
      return request<CandidateList>(`/api/candidates${qs ? `?${qs}` : ""}`);
    },
    getCandidate: (username: string) =>
      request<Candidate>(`/api/candidates/${encodeURIComponent(username)}`),
    sendEmail: (username: string) =>
      request<ActionResult>(`/api/candidates/${encodeURIComponent(username)}/send-email`, {
        method: "POST",
      }),
    metrics: () => request<Metrics>("/api/metrics"),
    scoringWeights: () => request<Record<string, number>>("/api/scoring/weights"),
    runPipeline: (mode?: "demo" | "live") =>
      request<ActionResult>("/api/pipeline/run", {
        method: "POST",
        body: JSON.stringify({ mode: mode ?? null }),
      }),
    pipelineStatus: () => request<PipelineStatus>("/api/pipeline/status"),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
