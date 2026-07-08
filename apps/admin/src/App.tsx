import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Button, LoginScreen, Logo, Spinner, useAuth } from "@hush/shared";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import Overview from "@/pages/Overview";
import Candidates from "@/pages/Candidates";

function TopBar() {
  const { user, logout, mode } = useAuth();
  const tab =
    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors";
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-6">
          <Logo label="Hush · Recruiter" />
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${tab} ${isActive ? "bg-accent-soft text-accent" : "text-muted hover:text-text"}`
              }
            >
              <LayoutDashboard className="h-4 w-4" /> Overview
            </NavLink>
            <NavLink
              to="/candidates"
              className={({ isActive }) =>
                `${tab} ${isActive ? "bg-accent-soft text-accent" : "text-muted hover:text-text"}`
              }
            >
              <Users className="h-4 w-4" /> Candidates
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {mode === "demo" && (
            <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs text-warning">
              demo mode
            </span>
          )}
          <span className="hidden text-sm text-muted sm:block">{user?.email}</span>
          <Button variant="ghost" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-8 w-8 text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        appLabel="Recruiter Console"
        expectedRole="admin"
        tagline="Hire from the shadows."
        demoEmail="admin@doodle.com"
        footer={<span>Candidate? Open the candidate portal instead.</span>}
      />
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-text">Recruiters only</h1>
          <p className="mt-2 text-muted">
            You are signed in as <span className="text-text">{user.email}</span> (candidate). This
            console is for recruiters.
          </p>
          <div className="mt-5 flex justify-center">
            <Button variant="ghost" onClick={() => logout()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
