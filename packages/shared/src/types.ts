export type Stage = "sourced" | "shortlisted" | "contacted" | "responded" | "rejected";
export type ConsentStatus = "pending" | "granted" | "declined";
export type EmailStatus = "not_sent" | "sent" | "failed";
export type Role = "admin" | "candidate";

export interface Candidate {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  source: string;
  followers: number;
  public_repos: number;
  public_gists: number;
  languages: string;
  language_count: number;
  score: number;
  stage: Stage;
  consent_status: ConsentStatus;
  email_status: EmailStatus;
  created_at: string;
  updated_at: string;
}

export interface CandidateList {
  candidates: Candidate[];
  total: number;
}

export interface Me {
  email: string;
  role: Role;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export interface PipelineRun {
  id: number;
  status: "running" | "completed" | "failed";
  mode: "demo" | "live";
  triggered_by: string;
  sourced_count: number;
  shortlisted_count: number;
  message: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface PipelineStatus {
  running: boolean;
  mode: "demo" | "live";
  autopilot_interval_minutes: number;
  last_run: PipelineRun | null;
}

export interface Metrics {
  total: number;
  shortlisted: number;
  contacted: number;
  consent_granted: number;
  emails_sent: number;
  last_run: PipelineRun | null;
}
