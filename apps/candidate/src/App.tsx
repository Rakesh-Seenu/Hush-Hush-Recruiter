import { Button, LoginScreen, Logo, Spinner, useAuth } from "@hush/shared";
import { LogOut } from "lucide-react";
import Portal from "@/pages/Portal";

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
        appLabel="Candidate Portal"
        expectedRole="candidate"
        tagline="You're in control."
        demoEmail="candidate@doodle.com"
        footer={<span>Your data, your consent. Withdraw anytime.</span>}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Logo label="Hush · Candidate" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:block">{user.email}</span>
            <Button variant="ghost" onClick={() => logout()}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Portal />
      </main>
    </div>
  );
}
