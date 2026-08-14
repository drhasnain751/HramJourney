import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    denied: search["denied"] === true || search["denied"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin Sign In | Haram Journey" },
      { name: "description", content: "Secure sign-in for Haram Journey administrators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In | Haram Journey" },
      { property: "og:description", content: "Secure administrator access." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { denied } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    denied ? "This account is not authorised for administrator access." : null,
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Invalid email or password.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("Invalid email or password.");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        setError("This account is not authorised for administrator access.");
        return;
      }

      navigate({ to: "/admin/dashboard", replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
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
            <ShieldCheck className="size-5 text-gold" />
            <h1 className="font-display text-2xl text-emerald-deep">Sign in</h1>
          </div>

          {error && (
            <p className="text-xs text-red-700 border border-red-700/30 bg-red-700/5 px-3 py-2">
              {error}
            </p>
          )}

          <label className="block space-y-2">
            <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
              Email
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

          <label className="block space-y-2">
            <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
              Password
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold outline-none"
            />
          </label>

          <div className="text-right">
            <Link
              to="/admin/forgot-password"
              className="text-[10px] uppercase tracking-[0.25em] text-ink-soft hover:text-gold transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-4 bg-emerald-deep text-sand text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-emerald-darker transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-3"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
