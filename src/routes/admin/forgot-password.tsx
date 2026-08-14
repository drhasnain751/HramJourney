import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Your Password | Haram Journey Admin" },
      { name: "description", content: "Request a password reset link for Haram Journey administrators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reset Your Password | Haram Journey Admin" },
      { property: "og:description", content: "Administrator password recovery." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
    } finally {
      setBusy(false);
      setSent(true);
    }
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
            <h1 className="font-display text-2xl text-emerald-deep">Reset Your Password</h1>
          </div>

          {sent ? (
            <p className="text-xs text-emerald-deep border border-gold/40 bg-gold/10 px-3 py-3">
              If an account exists for this email, a password reset link has been sent.
            </p>
          ) : (
            <>
              <label className="block space-y-2">
                <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
                  Admin Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 bg-emerald-deep text-sand text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-emerald-darker transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-3"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Send Reset Link
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
