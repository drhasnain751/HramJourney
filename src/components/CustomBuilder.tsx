import { useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { submitCustomRequest, validateLead } from "@/lib/leads";

const FALLBACK_SERVICES = [
  "Umrah Visa",
  "Air Tickets",
  "Makkah Hotel",
  "Madinah Hotel",
  "Shared Transport",
  "Private Transport",
  "VIP Transport",
  "Family Package",
  "Group Package",
  "Guided Support",
];

const TIERS = [
  { label: "3 Star", note: "Essential comfort" },
  { label: "4 Star", note: "Refined stay" },
  { label: "5 Star", note: "Premium luxury" },
  { label: "Luxury VIP", note: "Haram-view suites" },
];

const TRANSPORT = ["Shared coach", "Private car", "VIP chauffeur", "Not required"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STEPS = ["Services", "Travel", "Hotel", "Details", "Summary"];
const LAST_STEP = STEPS.length - 1;

interface Props {
  onSubmit: () => void;
  services?: string[];
}

export function CustomBuilder({ onSubmit, services: serviceOptions }: Props) {
  const SERVICES = serviceOptions?.length ? serviceOptions : FALLBACK_SERVICES;
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<string[]>(SERVICES.slice(0, 2));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [month, setMonth] = useState("March");
  const [travelDate, setTravelDate] = useState("");
  const [duration, setDuration] = useState("10 nights");
  const [tier, setTier] = useState("5 Star");
  const [transport, setTransport] = useState(TRANSPORT[0]!);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const toggleService = (s: string) =>
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const goNext = () => {
    if (step === 3) {
      const invalid = validateLead({ full_name: fullName, email, phone });
      if (invalid) {
        setError(invalid);
        return;
      }
    }
    setError(null);
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };

  const handleSubmit = async () => {
    const invalid = validateLead({ full_name: fullName, email, phone });
    if (invalid) {
      setError(invalid);
      setStep(3);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await submitCustomRequest({
        full_name: fullName,
        email,
        phone,
        selected_services: services,
        adults,
        children,
        travel_month: month,
        travel_date: travelDate || null,
        duration,
        accommodation_tier: tier,
        transport_preference: transport,
        notes: notes || null,
      });
      setSent(true);
      onSubmit();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "We could not send your request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <SuccessState
        name={fullName}
        phone={phone}
        onReset={() => {
          setSent(false);
          setStep(0);
        }}
      />
    );
  }

  return (
    <div className="bg-emerald-deep text-sand border border-gold/20 shadow-elegant">
      <div className="grid grid-cols-5 border-b border-gold/15">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`p-4 text-center border-r border-gold/10 last:border-r-0 transition-colors ${
              i === step ? "bg-gold/10" : ""
            }`}
          >
            <div
              className={`text-[10px] uppercase tracking-[0.25em] ${
                i <= step ? "text-gold" : "text-sand/40"
              }`}
            >
              0{i + 1}
            </div>
            <div
              className={`text-xs mt-1 font-medium ${i === step ? "text-sand" : "text-sand/60"}`}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 md:p-10 min-h-[420px]">
        {step === 0 && (
          <div className="space-y-6 animate-fade-up">
            <h3 className="font-display text-3xl italic">Select your sacred services</h3>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES.map((s) => {
                const active = services.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`group flex items-center justify-between gap-3 p-4 border text-left transition-all ${
                      active
                        ? "border-gold bg-gold/10 text-sand"
                        : "border-sand/15 text-sand/80 hover:border-gold/50"
                    }`}
                  >
                    <span className="text-sm">{s}</span>
                    <span
                      className={`size-4 border flex items-center justify-center transition-colors ${
                        active ? "border-gold bg-gold text-emerald-deep" : "border-sand/30"
                      }`}
                    >
                      {active && <Check className="size-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <h3 className="font-display text-3xl italic">Travel details</h3>
            <div className="grid grid-cols-2 gap-5">
              <Counter label="Adults" value={adults} onChange={setAdults} min={1} />
              <Counter label="Children" value={children} onChange={setChildren} min={0} />
              <Selector label="Travel Month" value={month} onChange={setMonth} options={MONTHS} />
              <Selector
                label="Duration"
                value={duration}
                onChange={setDuration}
                options={["7 nights", "10 nights", "14 nights", "21 nights", "Custom"]}
              />
              <Field label="Preferred Travel Date (optional)">
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-transparent border border-sand/15 px-3 py-3 text-sm text-sand focus:border-gold outline-none"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-4">
              <h3 className="font-display text-3xl italic">Accommodation tier</h3>
              <div className="grid grid-cols-2 gap-4">
                {TIERS.map((t) => {
                  const active = tier === t.label;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setTier(t.label)}
                      className={`p-6 border text-left transition-all ${
                        active ? "border-gold bg-gold/10" : "border-sand/15 hover:border-gold/40"
                      }`}
                    >
                      <div className="font-display text-2xl">{t.label}</div>
                      <div className="text-xs text-sand/60 mt-1">{t.note}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Selector
                label="Transport preference"
                value={transport}
                onChange={setTransport}
                options={TRANSPORT}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-up">
            <h3 className="font-display text-3xl italic">Your details</h3>
            <p className="text-sm text-sand/70">
              A UK specialist will call or WhatsApp you with your tailored itinerary.
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Full Name *">
                <TextInput value={fullName} onChange={setFullName} placeholder="Your full name" />
              </Field>
              <Field label="Email *">
                <TextInput
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="Phone Number *">
                <TextInput
                  value={phone}
                  onChange={setPhone}
                  type="tel"
                  placeholder="+44 7931 911632"
                />
              </Field>
            </div>
            <Field label="Notes / Additional Requirements">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Room preferences, mobility needs, group details…"
                className="w-full bg-transparent border border-sand/15 px-3 py-3 text-sm text-sand focus:border-gold outline-none resize-none"
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-up">
            <h3 className="font-display text-3xl italic">Review your bespoke itinerary</h3>
            <dl className="divide-y divide-sand/10 border-y border-sand/10">
              <Row label="Services" value={services.join(" · ") || "—"} />
              <Row label="Travelers" value={`${adults + children} total`} />
              <Row label="Adults" value={String(adults)} />
              <Row label="Children" value={String(children)} />
              <Row label="Travel Month" value={month} />
              <Row label="Travel Date" value={travelDate || "Flexible"} />
              <Row label="Duration" value={duration} />
              <Row label="Accommodation" value={tier} />
              <Row label="Transport" value={transport} />
              <Row label="Name" value={fullName || "—"} />
              <Row label="Email" value={email || "—"} />
              <Row label="Phone" value={phone || "—"} />
              <Row label="Notes" value={notes || "—"} />
            </dl>
            <p className="text-xs text-sand/60 leading-relaxed">
              Final pricing depends on travel season, flight & hotel availability and is confirmed
              by our specialist within 24 hours.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-6 text-xs text-gold border border-gold/40 bg-gold/10 px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between p-6 border-t border-gold/15 gap-4">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep((s) => Math.max(0, s - 1));
          }}
          disabled={step === 0}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-sand/70 hover:text-gold disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        {step < LAST_STEP ? (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-3 bg-gold text-emerald-deep px-6 py-3 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold-soft transition-colors"
          >
            Continue <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="flex items-center gap-3 bg-gold text-emerald-deep px-6 py-3 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold-soft transition-colors disabled:opacity-60"
          >
            {busy ? "Sending…" : "Submit Custom Package Request"} <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SuccessState({
  name,
  phone,
  onReset,
}: {
  name: string;
  phone: string;
  onReset: () => void;
}) {
  const message = encodeURIComponent(
    `Assalamualaikum, this is ${name || "a visitor"}. I have just submitted a custom Umrah package request (phone: ${phone}).`,
  );
  return (
    <div className="bg-emerald-deep text-sand border border-gold/20 shadow-elegant p-8 md:p-14 text-center space-y-6">
      <div className="mx-auto size-16 rounded-full border border-gold flex items-center justify-center text-gold">
        <Check className="size-8" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-3xl md:text-4xl italic">
        Your Custom Umrah Request Has Been Received
      </h3>
      <p className="text-sand/75 max-w-xl mx-auto leading-relaxed">
        Jazak Allahu khairan{name ? `, ${name.split(" ")[0]}` : ""}. Our UK specialists are
        composing your itinerary now and will contact you on{" "}
        <span className="text-gold">{phone}</span> within 24 hours, in shaa Allah.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href={`https://wa.me/447931911632?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 text-xs uppercase tracking-[0.25em] font-semibold hover:opacity-90 transition-opacity"
        >
          Chat on WhatsApp
        </a>
        <a
          href="/"
          className="inline-flex items-center gap-3 border border-sand/30 text-sand px-6 py-3 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-sand/10 transition-colors"
        >
          Return to homepage
        </a>
        <button
          type="button"
          onClick={onReset}
          className="text-xs uppercase tracking-[0.25em] text-sand/60 hover:text-gold transition-colors"
        >
          Build another
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border border-sand/15 px-3 py-3 text-sm text-sand placeholder:text-sand/40 focus:border-gold outline-none"
    />
  );
}

function Counter({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
        {label}
      </label>
      <div className="flex items-center border border-sand/15">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="px-4 py-3 text-sand/70 hover:text-gold"
        >
          −
        </button>
        <div className="flex-1 text-center font-display text-2xl">{value}</div>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="px-4 py-3 text-sand/70 hover:text-gold"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Selector({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.25em] text-gold font-semibold">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border border-sand/15 px-3 py-3 text-sm text-sand focus:border-gold outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-emerald-deep">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-4">
      <dt className="text-[10px] uppercase tracking-[0.25em] text-gold">{label}</dt>
      <dd className="text-sm text-sand text-right">{value}</dd>
    </div>
  );
}
