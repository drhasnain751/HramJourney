import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  Building2,
  Clock,
  Headphones,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Menu,
  X,
} from "lucide-react";

import heroKaaba from "@/assets/hero-kaaba.jpg";
import pkgRoyal from "@/assets/pkg-royal.jpg";
import pkgMadinah from "@/assets/pkg-madinah.jpg";
import pkgFamily from "@/assets/pkg-family.jpg";
import pkgVisa from "@/assets/pkg-visa.jpg";
import pkgFlight from "@/assets/pkg-flight.jpg";
import pkgRamadan from "@/assets/pkg-ramadan.jpg";
import aerialTawaf from "@/assets/aerial-tawaf.jpg";

import { QuoteModal } from "@/components/QuoteModal";
import { WhatsAppButton, whatsappLink } from "@/components/WhatsAppButton";
import { CustomBuilder } from "@/components/CustomBuilder";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
} from "@/components/ui/drawer";
import { getSiteContent, type PublicPackage } from "@/lib/public.functions";
import { submitInquiry } from "@/lib/leads";


export const Route = createFileRoute("/")({
  loader: () => getSiteContent(),
  errorComponent: () => <ContentFallback />,
  notFoundComponent: () => <ContentFallback />,

  head: () => ({
    meta: [
      { title: "Haram Journey | Premium Umrah Packages & Visa Services UK" },
      {
        name: "description",
        content:
          "Book premium Umrah packages, visa services, flights, hotels and customized pilgrimage experiences with Haram Journey. Trusted UK-based Umrah specialists.",
      },
      { property: "og:title", content: "Haram Journey | Premium Umrah Packages UK" },
      {
        property: "og:description",
        content:
          "Bespoke Umrah experiences crafted with reverence. Visa, flights, 5-star hotels and concierge support from our UK specialists.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroKaaba },
      { name: "twitter:image", content: heroKaaba },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: "Haram Journey",
          description:
            "UK-based Umrah specialists offering premium pilgrimage packages, visa services, flights and bespoke arrangements.",
          telephone: "+44 7931 911632",
          address: {
            "@type": "PostalAddress",
            streetAddress: "98 North Hyde Road",
            addressLocality: "Hayes",
            postalCode: "UB3 4NG",
            addressCountry: "GB",
          },
          areaServed: "United Kingdom",
        }),
      },
    ],
  }),
  component: HomePage,
});

interface Pkg {
  name: string;
  nights: string;
  tier: string;
  blurb: string;
  inclusions: string[];
  image: string;
  badge?: string;
  price?: string;
}

const CURRENCY: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", SAR: "SAR " };

function toPkg(p: PublicPackage): Pkg {
  const symbol = CURRENCY[p.currency] ?? "";
  const price =
    p.price_display_type === "from" && p.starting_price
      ? `From ${symbol}${Number(p.starting_price).toLocaleString()}`
      : p.price_text || "Request quote";
  return {
    name: p.name,
    nights: p.duration || "Flexible",
    tier: p.tier || p.package_type,
    blurb: p.short_description || "",
    inclusions: p.inclusions,
    image: p.main_image_url || pkgFlight,
    badge: p.badge ?? undefined,
    price,
  };
}

const FALLBACK_PACKAGES: Pkg[] = [

  {
    name: "Royal Haram",
    nights: "12 Nights",
    tier: "5★ Luxury",
    blurb: "Haram-view suites with private chauffeur and dedicated spiritual guide.",
    inclusions: ["VIP Transport", "Haram-View Suite", "Guided Ziyarat"],
    image: pkgRoyal,
    badge: "Signature",
  },
  {
    name: "Noor of Madinah",
    nights: "10 Nights",
    tier: "5★ Premium",
    blurb: "Walking-distance hotels in Madinah and Makkah with full-board catering.",
    inclusions: ["Premium Hotels", "Full Board", "Private Coach"],
    image: pkgMadinah,
    badge: "Most Loved",
  },
  {
    name: "Haram Suites Stay",
    nights: "7 Nights",
    tier: "4★ Family",
    blurb: "Spacious connecting rooms and a tailored itinerary for the whole family.",
    inclusions: ["Family Suites", "Half Board", "Shared Transport"],
    image: pkgFamily,
  },
  {
    name: "Visa & Air Tickets",
    nights: "Standalone",
    tier: "Essential",
    blurb: "Fast-tracked Umrah visa processing paired with competitive flight routing.",
    inclusions: ["Umrah Visa", "Return Flights", "Document Support"],
    image: pkgVisa,
    badge: "Visa Express",
  },
  {
    name: "Ramadan Blessings",
    nights: "21 Nights",
    tier: "Limited Seats",
    blurb: "Witness the last ten nights with curated iftar, suhoor and scholarly guidance.",
    inclusions: ["Iftar Catering", "Scholar-Led", "Haram-View Rooms"],
    image: pkgRamadan,
    badge: "Seasonal",
  },
  {
    name: "Bespoke Custom Journey",
    nights: "Flexible",
    tier: "Tailored",
    blurb: "Composed around your exact dates, room category and travel party.",
    inclusions: ["Private Aviation", "Curated Itinerary", "24/7 Concierge"],
    image: pkgFlight,
    badge: "Concierge",
  },
];

function HomePage() {
  const data = Route.useLoaderData();
  const packages = (data?.packages ?? []).map(toPkg);
  const services = (data?.services ?? []).map((s: { name: string }) => s.name);
  return <HomeLayout packages={packages} services={services} />;

}

function ContentFallback() {
  return <HomeLayout packages={FALLBACK_PACKAGES} services={[]} />;
}

function HomeLayout({ packages, services }: { packages: Pkg[]; services: string[] }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteContext, setQuoteContext] = useState<string | undefined>();

  const items = packages.length ? packages : FALLBACK_PACKAGES;

  const openQuote = (name?: string) => {
    setQuoteContext(name);
    setQuoteOpen(true);
  };

  return (
    <div className="min-h-screen bg-sand text-ink overflow-x-hidden">
      <Nav onQuote={() => openQuote()} />
      <Hero onQuote={() => openQuote()} />
      <TrustBar />
      <Packages packages={items} onQuote={openQuote} />
      <WhyUs />
      <Quote />
      <Builder
        services={services}
        onSubmit={() => openQuote("Bespoke Custom Package")}
      />
      <ContactSection onQuote={() => openQuote("Quick Inquiry")} />
      <Footer />
      <WhatsAppButton />
      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        packageName={quoteContext}
        packageTypes={items.map((p) => p.name)}
      />
    </div>
  );
}


/* -------------- NAV -------------- */
function Nav({ onQuote }: { onQuote: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-sand/85 backdrop-blur-md border-b border-emerald-deep/8">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <Crest />
          <div className="leading-tight">
            <div className="font-display text-xl text-emerald-deep tracking-wide">
              HARAM JOURNEY
            </div>
            <div className="text-[9px] uppercase tracking-[0.4em] text-gold/90">
              UK Umrah Specialists
            </div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.25em] text-ink-soft">
          <a href="#packages" className="hover:text-emerald-deep transition-colors">Packages</a>
          <a href="#builder" className="hover:text-emerald-deep transition-colors">Build Custom</a>
          <a href="#why" className="hover:text-emerald-deep transition-colors">Why Us</a>
          <a href="#contact" className="hover:text-emerald-deep transition-colors">Contact</a>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={onQuote}
            className="inline-flex items-center gap-2 bg-emerald-deep text-sand px-5 py-3 text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-emerald-darker transition-colors"
          >
            Request Quote <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Mobile: hamburger drawer */}
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <button className="inline-flex items-center justify-center p-2 rounded bg-white/10"> 
                <Menu />
              </button>
            </DrawerTrigger>
            <DrawerContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <a href="#" className="flex items-center gap-3">
                  <Crest />
                  <div className="leading-tight">
                    <div className="font-display text-lg text-emerald-deep tracking-wide">HARAM JOURNEY</div>
                  </div>
                </a>
                <DrawerClose asChild>
                  <button className="p-2"><X /></button>
                </DrawerClose>
              </div>
              <nav className="flex flex-col gap-4 text-sm uppercase tracking-[0.25em]">
                <a href="#packages" className="py-2 border-b">Packages</a>
                <a href="#builder" className="py-2 border-b">Build Custom</a>
                <a href="#why" className="py-2 border-b">Why Us</a>
                <a href="#contact" className="py-2 border-b">Contact</a>
                <button
                  onClick={onQuote}
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-deep text-sand px-4 py-3 text-sm uppercase tracking-[0.25em] font-semibold"
                >
                  Request Quote
                </button>
              </nav>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}

function Crest() {
  return (
    <svg viewBox="0 0 40 40" className="size-9 text-emerald-deep" aria-hidden>
      <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <path
        d="M20 6 C 13 12, 13 22, 20 28 C 27 22, 27 12, 20 6 Z"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.9"
      />
      <circle cx="20" cy="20" r="2.5" fill="var(--gold)" />
    </svg>
  );
}

/* -------------- HERO -------------- */
function Hero({ onQuote }: { onQuote: () => void }) {
  return (
    <section className="relative min-h-[88vh] flex items-end overflow-hidden">
      <img
        src={heroKaaba}
        alt="Holy Kaaba at sunset with pilgrims circling"
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover animate-slow-zoom"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-darker via-emerald-darker/50 to-emerald-darker/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-darker/70 via-transparent to-transparent" />

      <div className="relative w-full max-w-7xl mx-auto px-6 pb-20 pt-32 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-8 text-sand animate-fade-up">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
            <span className="h-px w-10 bg-gold/60" />
            Bespoke pilgrimages · Est. 2014
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.02] tracking-tight max-w-4xl">
            A journey to the
            <br />
            <em className="text-shimmer not-italic font-display">House of Allah</em>
            <br />
            crafted with reverence.
          </h1>
          <p className="mt-8 max-w-xl text-sand/80 text-lg leading-relaxed">
            Your trusted companion for a blessed Umrah journey. Haram-view hotels, hassle-free
            visas, chauffeured transfers and 24/7 care, devised by UK specialists for you and
            your family.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={onQuote}
              className="group inline-flex items-center gap-3 bg-gold text-emerald-deep px-7 py-4 text-xs uppercase tracking-[0.3em] font-semibold hover:bg-gold-soft transition-colors"
            >
              Request a Quote
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#builder"
              className="inline-flex items-center gap-3 border border-sand/30 text-sand px-7 py-4 text-xs uppercase tracking-[0.3em] font-semibold hover:bg-sand/10 transition-colors"
            >
              Build a Bespoke
            </a>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-2 gap-4 text-sand">
          <Stat value="12,400+" label="Pilgrims hosted" />
          <Stat value="5★" label="Hotels in Makkah & Madinah" />
          <Stat value="48 hrs" label="Visa turnaround" />
          <Stat value="24/7" label="Dedicated concierge" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l-2 border-gold/60 pl-4 py-2">
      <div className="font-display text-3xl text-sand">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-sand/70 mt-1">{label}</div>
    </div>
  );
}

/* -------------- TRUST BAR -------------- */
function TrustBar() {
  const items = [
    { icon: ShieldCheck, label: "IATA Accredited" },
    { icon: Award, label: "ATOL Protected" },
    { icon: Building2, label: "Haram-View Hotels" },
    { icon: Headphones, label: "24/7 UK Support" },
  ];
  return (
    <section className="border-y border-emerald-deep/10 bg-sand-warm/50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-around gap-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-emerald-deep/80">
            <Icon className="size-5 text-gold" strokeWidth={1.5} />
            <span className="text-[11px] uppercase tracking-[0.3em] font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------- PACKAGES -------------- */
function Packages({
  packages,
  onQuote,
}: {
  packages: Pkg[];
  onQuote: (name: string) => void;
}) {

  return (
    <section id="packages" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
              <span className="h-px w-8 bg-gold/60" /> Curated Journeys
            </div>
            <h2 className="font-display text-5xl md:text-6xl text-emerald-deep leading-[1.05]">
              Pilgrimage packages, <em>refined.</em>
            </h2>
            <p className="mt-6 text-ink-soft leading-relaxed">
              Every season, every hotel category, every flight route we sculpt the details so
              your only focus is devotion. Prices vary with the Hijri calendar, room category and
              availability.
            </p>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onQuote("All Packages");
            }}
            className="text-xs uppercase tracking-[0.3em] text-emerald-deep border-b border-gold pb-1 hover:text-gold transition-colors self-start md:self-end"
          >
            Request our latest brochure
          </a>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {packages.map((p) => (
            <PackageCard key={p.name} pkg={p} onQuote={() => onQuote(p.name)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, onQuote }: { pkg: Pkg; onQuote: () => void }) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-emerald-deep/5">
        <img
          src={pkg.image}
          alt={pkg.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-darker/80 via-emerald-darker/10 to-transparent" />
        {pkg.badge && (
          <div className="absolute top-4 left-4 bg-sand/95 text-emerald-deep px-3 py-1 text-[9px] uppercase tracking-[0.3em] font-semibold">
            {pkg.badge}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-sand">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-2xl">{pkg.name}</h3>
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold">{pkg.nights}</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-sand/70 mt-1">{pkg.tier}</div>
        </div>
      </div>
      <div className="pt-5 flex-1 flex flex-col">
        <p className="text-sm text-ink-soft leading-relaxed mb-4">{pkg.blurb}</p>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-emerald-deep/80 mb-6">
          {pkg.inclusions.map((i) => (
            <li key={i} className="flex items-center gap-1.5">
              <Sparkles className="size-3 text-gold" /> {i}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-emerald-deep/15">
          <div>
            <div className="text-[9px] uppercase tracking-[0.3em] text-ink-soft">Starting From</div>
            <div className="font-display text-xl text-emerald-deep italic">
              {pkg.price || "Request quote"}
            </div>

          </div>
          <button
            onClick={onQuote}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold font-semibold hover:text-emerald-deep transition-colors"
          >
            Get Quote <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* -------------- WHY US -------------- */
function WhyUs() {
  const items = [
    {
      icon: Award,
      title: "Travel Specialists",
      body: "Decade of expertise crafting Umrah for UK pilgrims. Every itinerary reviewed personally.",
    },
    {
      icon: Building2,
      title: "Hotel Partnerships",
      body: "Direct allocations with Makkah & Madinah's most prestigious hotel groups.",
    },
    {
      icon: ShieldCheck,
      title: "Visa Assistance",
      body: "End-to-end Umrah visa support with document review and rapid 48-hour turnaround.",
    },
    {
      icon: Headphones,
      title: "24/7 Care",
      body: "A UK-based specialist on call before, during and after your sacred journey.",
    },
  ];

  return (
    <section id="why" className="bg-emerald-deep text-sand py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage:
          "radial-gradient(circle at 25% 30%, var(--gold) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="relative">
            <img
              src={aerialTawaf}
              alt="Aerial view of pilgrims circling the Kaaba"
              loading="lazy"
              className="w-full aspect-[4/5] object-cover"
            />
            <img
              src={pkgMadinah}
              alt="Prophet's Mosque dome"
              loading="lazy"
              className="absolute -bottom-12 -right-6 w-1/2 aspect-[3/4] object-cover border-4 border-emerald-deep shadow-elegant hidden md:block"
            />
          </div>
        </div>
        <div className="lg:col-span-7 lg:pl-10">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
            <span className="h-px w-8 bg-gold/60" /> Why Haram Journey
          </div>
          <h2 className="font-display text-5xl md:text-6xl leading-[1.05]">
            A pilgrimage you will never forget for <em>all the right reasons.</em>
          </h2>
          <p className="mt-6 text-sand/70 max-w-xl leading-relaxed">
            Every step in your Umrah experience is handled by trained specialists. From the moment
            you land in Jeddah or Madinah to your farewell tawaf, our team handles the logistics so
            you can focus on worship.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 gap-6">
            {items.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border border-sand/15 p-6 bg-white/[0.03] hover:border-gold/40 transition-colors">
                <Icon className="size-6 text-gold" strokeWidth={1.5} />
                <h3 className="font-display text-xl mt-4">{title}</h3>
                <p className="text-sm text-sand/65 mt-2 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------- QUOTE / TESTIMONY -------------- */
function Quote() {
  return (
    <section className="py-24 md:py-32 bg-sand">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="text-gold text-3xl font-display mb-8">۞</div>
        <blockquote className="font-display italic text-3xl md:text-4xl text-emerald-deep leading-relaxed">
          "And proclaim to mankind the Hajj. They will come to you on foot and on every lean camel
          from every distant pass."
        </blockquote>
        <div className="mt-8 text-[10px] uppercase tracking-[0.4em] text-ink-soft">
          — Surah Al-Hajj 22:27
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-6 text-left">
          {[
            { n: "01", t: "Discover", d: "Tell us about your group, season and ideal hotel category." },
            { n: "02", t: "Design", d: "Receive a tailored itinerary within 24 hours, no obligation." },
            { n: "03", t: "Depart", d: "We handle visa, flights, hotels and ground transport end-to-end." },
          ].map((s) => (
            <div key={s.n} className="bg-white/60 p-6 border border-emerald-deep/8 shadow-card">
              <div className="text-gold font-display text-3xl">{s.n}</div>
              <div className="font-display text-xl text-emerald-deep mt-2">{s.t}</div>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------- CUSTOM BUILDER -------------- */
function Builder({ onSubmit, services }: { onSubmit: () => void; services: string[] }) {
  return (
    <section id="builder" className="py-24 md:py-32 bg-sand-warm/40">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-32">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
            <span className="h-px w-8 bg-gold/60" /> Concierge Atelier
          </div>
          <h2 className="font-display text-5xl text-emerald-deep leading-[1.05]">
            Design your <em>bespoke</em> pilgrimage.
          </h2>
          <p className="mt-6 text-ink-soft leading-relaxed">
            A four-step atelier to compose your journey. Select your services, travel details and
            preferred accommodation — our specialists will return with a personalized itinerary.
          </p>
          <div className="mt-8 space-y-3 text-sm text-emerald-deep">
            <Bullet>No fixed pricing, every quote is tailored.</Bullet>
            <Bullet>Reply within 24 hours, in shaa Allah.</Bullet>
            <Bullet>Adjustable up to 14 days before departure.</Bullet>
          </div>
        </div>
        <div className="lg:col-span-8">
          <CustomBuilder onSubmit={onSubmit} services={services} />
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <Star className="size-4 text-gold mt-0.5 shrink-0" fill="currentColor" />
      <span>{children}</span>
    </div>
  );
}

/* -------------- CONTACT -------------- */
function ContactSection({ onQuote }: { onQuote: () => void }) {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => (fd.get(k) as string | null)?.trim() || null;
    setBusy(true);
    setErr(null);
    try {
      await submitInquiry({
        full_name: get("name") ?? "",
        email: get("email") ?? "",
        phone: get("phone") ?? "",
        country: get("country"),
        travelers: get("travelers") ? Number(get("travelers")) : null,
        travel_date: get("date"),
        package_type: get("package"),
        package_name: "Quick Inquiry",
        message: get("notes"),
      });
      setSent(true);
      e.currentTarget.reset();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-sand">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 space-y-10">
          <div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
              <span className="h-px w-8 bg-gold/60" /> Speak With a Specialist
            </div>
            <h2 className="font-display text-5xl text-emerald-deep leading-[1.05]">
              Reserve your seat for a <em>blessed journey.</em>
            </h2>
            <p className="mt-6 text-ink-soft leading-relaxed max-w-md">
              Speak to a UK-based specialist today for a tailored quote and 24-hour turnaround on
              every itinerary.
            </p>
          </div>

          <div className="space-y-6">
            <ContactRow icon={MapPin} label="Office">
              98 North Hyde Road, Hayes, UB3 4NG, United Kingdom
            </ContactRow>
            <ContactRow icon={Phone} label="Call & WhatsApp">
              <a href="tel:+447931911632" className="hover:text-gold transition-colors">
                +44 7931 911632
              </a>
            </ContactRow>
            <ContactRow icon={Clock} label="Business Hours">
              Mon – Fri · 09:00 – 18:00<br />
              Sat · 10:00 – 16:00 · Sun · By appointment
            </ContactRow>
          </div>

          <div className="aspect-[16/9] border border-emerald-deep/10 overflow-hidden">
            <iframe
              title="Office location map"
              src="https://www.google.com/maps?q=98+North+Hyde+Road,+Hayes+UB3+4NG&output=embed"
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0 }}
            />
          </div>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-3 text-xs uppercase tracking-[0.3em] font-semibold hover:opacity-90 transition-opacity"
          >
            Chat on WhatsApp <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white border border-emerald-deep/10 shadow-elegant p-8 md:p-12">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-gold mb-4">
              <span className="h-px w-8 bg-gold/60" /> Quick Inquiry
            </div>
            <h3 className="font-display text-3xl text-emerald-deep mb-2">Begin Your Pilgrimage</h3>
            <p className="text-sm text-ink-soft mb-8">
              Share a few details — we'll respond within 24 hours with options curated for you.
            </p>
            <form className="space-y-5" onSubmit={handleContact}>
              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Full Name" name="name" placeholder="Your full name" required />
                <Input label="Email" name="email" type="email" placeholder="you@example.com" required />
                <Input label="Phone" name="phone" type="tel" placeholder="+44…" required />
                <Input label="Country" name="country" placeholder="United Kingdom" />
                <Input label="Number of Travelers" name="travelers" type="number" defaultValue="2" />
                <Input label="Travel Date" name="date" type="date" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
                  Package Type
                </label>
                <select
                  name="package"
                  className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold outline-none"
                >
                  <option>Complete Umrah Package</option>
                  <option>Visa &amp; Flights only</option>
                  <option>Hotel only</option>
                  <option>Bespoke Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Share any details that will help us craft your perfect Umrah."
                  className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold outline-none resize-none"
                />
              </div>
              {err && (
                <p className="text-xs text-red-700 border border-red-700/30 bg-red-700/5 px-3 py-2">
                  {err}
                </p>
              )}
              {sent && (
                <p className="text-xs text-emerald-deep border border-gold/40 bg-gold/10 px-3 py-2">
                  Received — a specialist will contact you within 24 hours, in shaa Allah.
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-4 bg-emerald-deep text-sand text-xs uppercase tracking-[0.3em] font-semibold hover:bg-emerald-darker transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {busy ? "Sending…" : "Request My Itinerary"} <Plane className="size-4" />
              </button>
              <button
                type="button"
                onClick={onQuote}
                className="w-full text-[10px] uppercase tracking-[0.3em] text-ink-soft hover:text-gold transition-colors"
              >
                Or open the full quote form
              </button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-5">
      <div className="size-11 border border-gold/50 flex items-center justify-center text-gold shrink-0">
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-deep font-semibold mb-1">
          {label}
        </div>
        <div className="text-sm text-ink-soft leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-transparent border border-emerald-deep/15 px-3 py-3 text-sm focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
      />
    </div>
  );
}

/* -------------- FOOTER -------------- */
function Footer() {
  return (
    <footer className="bg-emerald-darker text-sand/80">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <Crest />
            <div>
              <div className="font-display text-xl text-sand tracking-wide">HARAM JOURNEY</div>
              <div className="text-[9px] uppercase tracking-[0.4em] text-gold/80">
                UK Umrah Specialists
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-md text-sand/70">
            Haram Journey is dedicated to providing the most seamless and spiritually fulfilling
            Umrah experiences for pilgrims across the United Kingdom and beyond.
          </p>
          <div className="mt-6 flex gap-2 text-[10px] uppercase tracking-[0.3em] text-gold/70">
            <span>IATA</span>·<span>ATOL</span>·<span>ABTA</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 font-semibold">
            Journey
          </div>
          <ul className="space-y-3 text-sm">
            <li><a href="#packages" className="hover:text-gold transition-colors">Packages</a></li>
            <li><a href="#builder" className="hover:text-gold transition-colors">Build Custom</a></li>
            <li><a href="#why" className="hover:text-gold transition-colors">Why Us</a></li>
            <li><a href="#contact" className="hover:text-gold transition-colors">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4 font-semibold">
            Concierge
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="size-3.5 mt-1 text-gold" />
              +44 7931 911632
            </li>
            <li className="flex items-start gap-2">
              <Users className="size-3.5 mt-1 text-gold" />
              hello@haramjourney.uk
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="size-3.5 mt-1 text-gold" />
              98 North Hyde Road, Hayes UB3 4NG, UK
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-sand/50">
          <div>© {new Date().getFullYear()} Haram Journey · All Rights Reserved</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-gold transition-colors">Booking Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
