import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export interface PublicPackage {
  id: string;
  name: string;
  slug: string;
  package_type: string;
  short_description: string | null;
  duration: string | null;
  tier: string | null;
  badge: string | null;
  price_display_type: string;
  starting_price: number | null;
  price_text: string | null;
  currency: string;
  main_image_url: string | null;
  is_popular: boolean;
  inclusions: string[];
}

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
}

export interface SiteSettings {
  [key: string]: {
    image_url: string | null;
    value: string | null;
  };
}

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();

  const [pkgRes, incRes, svcRes, settingsRes] = await Promise.all([
    supabase
      .from("packages")
      .select(
        "id, name, slug, package_type, short_description, duration, tier, badge, price_display_type, starting_price, price_text, currency, main_image_url, is_popular, display_order",
      )
      .eq("status", "published")
      .order("display_order", { ascending: true }),
    supabase
      .from("package_inclusions")
      .select("package_id, title, display_order")
      .order("display_order", { ascending: true }),
    supabase
      .from("services")
      .select("id, name, description, display_order")
      .eq("status", "active")
      .eq("show_in_builder", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("site_settings")
      .select("key, image_url, value")
      .order("display_order", { ascending: true }),
  ]);

  const inclusions = incRes.data ?? [];

  const packages: PublicPackage[] = (pkgRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    package_type: p.package_type,
    short_description: p.short_description,
    duration: p.duration,
    tier: p.tier,
    badge: p.badge,
    price_display_type: p.price_display_type,
    starting_price: p.starting_price,
    price_text: p.price_text,
    currency: p.currency,
    main_image_url: p.main_image_url,
    is_popular: p.is_popular,
    inclusions: inclusions.filter((i) => i.package_id === p.id).map((i) => i.title),
  }));

  const services: PublicService[] = (svcRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
  }));

  const settings: SiteSettings = {};
  (settingsRes.data ?? []).forEach((s) => {
    settings[s.key] = { image_url: s.image_url, value: s.value };
  });

  return { packages, services, settings };
});
