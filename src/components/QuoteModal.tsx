import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { submitInquiry } from "@/lib/leads";

export interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  packageName?: string;
  packageTypes?: string[];
}

const COUNTRIES = ["United Kingdom", "United States", "Canada", "Ireland", "Other"];
const DEFAULT_PACKAGE_TYPES = [
  "Economy 3★",
  "Standard 4★",
  "Premium 5★",
  "Luxury VIP",
  "Family Package",
  "Group Package",
  "Bespoke Custom",
];

export function QuoteModal({ open, onClose, packageName, packageTypes }: QuoteModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const PACKAGE_TYPES = packageTypes?.length ? packageTypes : DEFAULT_PACKAGE_TYPES;


  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
      setError(null);
    }
  }, [open]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string | null)?.trim() || null;
    setBusy(true);
    setError(null);
    try {
      await submitInquiry({
        full_name: get("name") ?? "",
        email: get("email") ?? "",
        phone: get("phone") ?? "",
        country: get("country"),
        travelers: get("travelers") ? Number(get("travelers")) : null,
        departure_city: get("departure"),
        travel_date: get("date"),
        package_type: get("package"),
        package_name: packageName ?? null,
        message: get("notes"),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We could not send your request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-emerald-darker/70 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-sand shadow-elegant border border-gold/30 animate-fade-up">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 p-2 text-ink-soft hover:text-emerald-deep transition-colors"
        >
          <X className="size-5" />
        </button>
        {submitted ? (
          <div className="p-12 text-center space-y-6">
            <div className="mx-auto size-14 rounded-full border border-gold/40 flex items-center justify-center text-gold text-2xl">
              ✓
            </div>
            <h3 className="font-display text-3xl text-emerald-deep">Thank You</h3>
            <p className="text-ink-soft max-w-md mx-auto">
              Your personalized quote request has been received. A Haram Journey specialist will
              contact you within 24 hours, in shaa Allah.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-emerald-deep text-sand text-xs uppercase tracking-[0.25em] hover:bg-emerald-darker transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="p-8 md:p-12 space-y-6" onSubmit={onSubmit}>

            <header className="space-y-3 border-b border-emerald-deep/10 pb-6">
              <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-semibold">
                Personalized Quote
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-emerald-deep italic leading-tight">
                {packageName ? `Inquire about ${packageName}` : "Begin Your Pilgrimage"}
              </h2>
              <p className="text-sm text-ink-soft">
                Prices vary by season, flight, and hotel availability. Receive your tailored quote
                within 24 hours.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full Name" name="name" required />
              <Field label="Email Address" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" required />
              <SelectField label="Country" name="country" options={COUNTRIES} />
              <Field label="Number of Travelers" name="travelers" type="number" defaultValue="2" />
              <Field label="Departure City" name="departure" placeholder="e.g. London" />
              <Field label="Preferred Travel Date" name="date" type="date" />
              <SelectField label="Package Type" name="package" options={PACKAGE_TYPES} />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
                Additional Requirements
              </label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Room preferences, dietary needs, special requests…"
                className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-700 border border-red-700/30 bg-red-700/5 px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-4 bg-emerald-deep text-sand text-xs uppercase tracking-[0.3em] font-semibold hover:bg-emerald-darker transition-colors relative overflow-hidden group disabled:opacity-60"
            >
              <span className="relative z-10">
                {busy ? "Sending…" : "Get My Personalized Quote"}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            <p className="text-[10px] uppercase tracking-widest text-ink-soft/60 text-center">
              By submitting you agree to be contacted by our travel specialists.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
        {required && <span className="text-gold">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
      </label>
      <select
        name={name}
        className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
