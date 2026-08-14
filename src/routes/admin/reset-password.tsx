import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a New Password | Haram Journey Admin" },
      { name: "description", content: "Set a new password for your Haram Journey administrator account." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Set a New Password | Haram Journey Admin" },
      { property: "og:description", content: "Administrator password update." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setHasSession(true);
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await supabase.auth.signOut();
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-emerald-deep text-sand flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-10">
          <div className="font-display text-2xl tracking-wide">HARAM JOURNEY</div>
          <div className="text-[9px] uppercase tracking-[0.4em] text-gold mt-1">
            Administrator Access
          </div>
        </Link>

        <form
          onSubmit={onSubmit}
          className="bg-sand text-ink p-8 md:p-10 space-y-6 shadow-elegant border border-gold/25"
        >
          <div className="flex items-center gap-3">
            <KeyRound className="size-5 text-gold" />
            <h1 className="font-display text-2xl text-emerald-deep">Set a new password</h1>
          </div>

          {!ready && (
            <p className="text-xs text-ink-soft inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Verifying your reset link…
            </p>
          )}

          {ready && done && (
            <p className="text-xs text-emerald-deep border border-gold/40 bg-gold/10 px-3 py-3">
              Your password has been updated successfully.
            </p>
          )}

          {ready && !done && !hasSession && (
            <p className="text-xs text-red-700 border border-red-700/30 bg-red-700/5 px-3 py-2">
              This reset link is invalid or has expired. Please request a new one.
            </p>
          )}

          {ready && !done && hasSession && (
            <>
              {error && (
                <p className="text-xs text-red-700 border border-red-700/30 bg-red-700/5 px-3 py-2">
                  {error}
                </p>
              )}

              <label className="block space-y-2">
                <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
                  New Password
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold outline-none"
                />
              </label>

              <label className="block space-y-2">
                <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
                  Confirm New Password
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 bg-emerald-deep text-sand text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-emerald-darker transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-3"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Update Password
              </button>
            </>
          )}

          <Link
            to="/admin/login"
            search={{ denied: undefined }}
            className="block text-center text-[10px] uppercase tracking-[0.25em] text-ink-soft hover:text-gold transition-colors"
          >
            Return to Admin Login
          </Link>
        </form>
      </div>
    </div>
  );
}
