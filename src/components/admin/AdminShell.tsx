import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  Images,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/hotels", label: "Hotels", icon: Building2 },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/website-content", label: "Website Content", icon: Images },
  { to: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { to: "/admin/custom-requests", label: "Custom Builds", icon: Wand2 },
  { to: "/admin/media", label: "Media", icon: Images },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", search: { denied: undefined }, replace: true });
  };

  return (
    <div className="min-h-screen bg-sand text-ink flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-emerald-deep text-sand">
        <div className="p-6 border-b border-gold/15">
          <div className="font-display text-lg tracking-wide">HARAM JOURNEY</div>
          <div className="text-[9px] uppercase tracking-[0.35em] text-gold mt-1">
            Control Room
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-3 text-xs uppercase tracking-[0.2em] transition-colors ${
                  active ? "bg-gold/15 text-gold" : "text-sand/70 hover:text-gold"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.6} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gold/15 space-y-1">
          <a
            href="/"
            className="block px-3 py-3 text-[10px] uppercase tracking-[0.25em] text-sand/60 hover:text-gold"
          >
            View website
          </a>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-3 text-[10px] uppercase tracking-[0.25em] text-sand/60 hover:text-gold"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="border-b border-emerald-deep/10 bg-sand-warm/50 px-6 py-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-emerald-deep">{title}</h1>
            {description && <p className="text-sm text-ink-soft mt-1">{description}</p>}
          </div>
          <div className="flex items-center gap-3">{actions}</div>
        </header>
        <div className="md:hidden flex gap-2 overflow-x-auto border-b border-emerald-deep/10 px-4 py-3">
          {NAV.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="whitespace-nowrap px-3 py-2 text-[10px] uppercase tracking-[0.2em] border border-emerald-deep/15 text-emerald-deep"
            >
              {label}
            </Link>
          ))}
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 border border-emerald-deep/10 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
}) {
  const styles =
    variant === "primary"
      ? "bg-emerald-deep text-sand hover:bg-emerald-darker"
      : variant === "danger"
        ? "border border-red-600/40 text-red-700 hover:bg-red-600/10"
        : "border border-emerald-deep/20 text-emerald-deep hover:border-gold";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-[0.25em] font-semibold transition-colors disabled:opacity-40 ${styles}`}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-2">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
      </span>
      <input
        {...props}
        className="w-full bg-white/60 border border-emerald-deep/15 px-3 py-2.5 text-sm focus:border-gold outline-none"
      />
    </label>
  );
}

export function Textarea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-2">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
      </span>
      <textarea
        {...props}
        className="w-full bg-white/60 border border-emerald-deep/15 px-3 py-2.5 text-sm focus:border-gold outline-none resize-y"
      />
    </label>
  );
}

export function Select({
  label,
  options,
  ...props
}: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block space-y-2">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
      </span>
      <select
        {...props}
        className="w-full bg-white/60 border border-emerald-deep/15 px-3 py-2.5 text-sm focus:border-gold outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-emerald-800"
      />
      <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
      </span>
    </label>
  );
}
