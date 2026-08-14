import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuoteModal } from "@/components/QuoteModal";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ArrowLeft, MapPin, Clock, Plane, Hotel, Users } from "lucide-react";

export const Route = createFileRoute("/packages_/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Package Details | Haram Journey` },
      { name: "description", content: "Package details and booking information." },
    ],
  }),
  component: PackageDetailPage,
});

type Package = {
  id: string;
  name: string;
  slug: string;
  package_type: string;
  short_description: string | null;
  full_description: string | null;
  duration: string | null;
  tier: string | null;
  badge: string | null;
  status: string;
  starting_price: number | null;
  price_text: string | null;
  currency: string;
  main_image_url: string | null;
};

type PackageImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
};

type Inclusion = {
  id: string;
  item: string;
  icon: string | null;
};

type Exclusion = {
  id: string;
  item: string;
  icon: string | null;
};

function PackageDetailPage() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: pkg, isLoading, error } = useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data as Package;
    },
  });

  const { data: images } = useQuery({
    queryKey: ["package-images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("package_images")
        .select("*")
        .eq("package_id", id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PackageImage[];
    },
    enabled: !!pkg,
  });

  const { data: inclusions } = useQuery({
    queryKey: ["package-inclusions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("package_inclusions")
        .select("*")
        .eq("package_id", id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Inclusion[];
    },
    enabled: !!pkg,
  });

  const { data: exclusions } = useQuery({
    queryKey: ["package-exclusions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("package_exclusions")
        .select("*")
        .eq("package_id", id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Exclusion[];
    },
    enabled: !!pkg,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-ink-soft">Loading package details...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-ink-soft mb-4">Package not found</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-2 text-emerald-deep hover:text-emerald-deep/80 transition-colors"
        >
          <ArrowLeft size={16} /> Back to home
        </button>
      </div>
    );
  }

  const primaryImage = images?.find((img) => img.alt_text?.includes("primary")) ?? images?.[0];
  const galleryImages = images?.filter((img) => img !== primaryImage) ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-emerald-deep/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-2 text-emerald-deep hover:text-emerald-deep/80 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="font-display text-lg text-emerald-deep">{pkg.name}</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Image */}
        {primaryImage && (
          <div className="mb-12">
            <img
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || pkg.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Title and Badge */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display text-4xl text-emerald-deep">{pkg.name}</h1>
            {pkg.badge && (
              <span className="inline-block bg-gold text-emerald-deep px-3 py-1 text-xs uppercase tracking-widest font-semibold rounded">
                {pkg.badge}
              </span>
            )}
          </div>
          {pkg.short_description && (
            <p className="text-lg text-ink-soft max-w-2xl">{pkg.short_description}</p>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid md:grid-cols-4 gap-4 mb-12 p-6 bg-sand/30 rounded-lg">
          {pkg.package_type && (
            <div>
              <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                Type
              </div>
              <div className="text-emerald-deep font-medium">{pkg.package_type}</div>
            </div>
          )}
          {pkg.duration && (
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-gold mt-1 flex-shrink-0" />
              <div>
                <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                  Duration
                </div>
                <div className="text-emerald-deep font-medium">{pkg.duration}</div>
              </div>
            </div>
          )}
          {pkg.tier && (
            <div>
              <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                Tier
              </div>
              <div className="text-emerald-deep font-medium capitalize">{pkg.tier}</div>
            </div>
          )}
          {pkg.starting_price && (
            <div>
              <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-1">
                Starting From
              </div>
              <div className="text-emerald-deep font-medium">
                {pkg.currency} {pkg.starting_price.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Main Description */}
        {pkg.full_description && (
          <div className="mb-12 prose prose-sm max-w-none">
            <div className="text-ink leading-relaxed whitespace-pre-wrap">
              {pkg.full_description}
            </div>
          </div>
        )}

        {/* Inclusions and Exclusions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Inclusions */}
          {inclusions && inclusions.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-emerald-deep mb-6">What's Included</h2>
              <ul className="space-y-3">
                {inclusions.map((inc) => (
                  <li key={inc.id} className="flex items-start gap-3">
                    {inc.icon ? (
                      <span className="text-gold text-xl mt-0.5">{inc.icon}</span>
                    ) : (
                      <span className="text-emerald-deep text-xl font-bold mt-0.5">✓</span>
                    )}
                    <span className="text-ink">{inc.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exclusions */}
          {exclusions && exclusions.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-emerald-deep mb-6">Not Included</h2>
              <ul className="space-y-3">
                {exclusions.map((exc) => (
                  <li key={exc.id} className="flex items-start gap-3">
                    {exc.icon ? (
                      <span className="text-gold text-xl mt-0.5">{exc.icon}</span>
                    ) : (
                      <span className="text-ink-soft text-xl font-bold mt-0.5">○</span>
                    )}
                    <span className="text-ink-soft">{exc.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl text-emerald-deep mb-6">Gallery</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {galleryImages.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={img.alt_text || pkg.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-deep/5 to-gold/5 rounded-lg p-8 text-center">
          <h2 className="font-display text-2xl text-emerald-deep mb-4">Ready to Start Your Journey?</h2>
          <p className="text-ink-soft mb-6 max-w-2xl mx-auto">
            Get in touch with our team to book this package or customize it to your needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <QuoteModal defaultPackage={pkg.name}>
              <button className="px-8 py-3 bg-emerald-deep text-white font-semibold rounded hover:bg-emerald-deep/90 transition-colors">
                Request Quote
              </button>
            </QuoteModal>
            <WhatsAppButton className="px-8 py-3 bg-[#25D366] text-white font-semibold rounded hover:bg-[#20ba5d] transition-colors" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-deep text-white mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>© 2024 Haram Journey. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
