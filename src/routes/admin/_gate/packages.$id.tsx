import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AdminShell,
  Btn,
  Input,
  Panel,
  Select,
  Textarea,
  Toggle,
} from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { GalleryUploader } from "@/components/admin/GalleryUploader";
import { Trash2, Copy } from "lucide-react";

export const Route = createFileRoute("/admin/_gate/packages/$id")({
  head: () => ({
    meta: [
      { title: "Edit package | Haram Journey Admin" },
      { name: "description", content: "Edit package details, pricing and inclusions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PackageEditor,
});

const TYPES = [
  "Complete Umrah Package",
  "Visa Only",
  "Flight Only",
  "Hotel Only",
  "Transport",
  "Family Package",
  "Group Package",
  "Custom",
];
const STATUSES = ["draft", "published", "archived"];
const PRICE_TYPES = ["request_quote", "starting_from", "custom_text"];

interface Form {
  name: string;
  slug: string;
  package_type: string;
  short_description: string;
  full_description: string;
  duration: string;
  tier: string;
  badge: string;
  status: string;
  is_featured: boolean;
  is_popular: boolean;
  price_display_type: string;
  starting_price: string;
  price_text: string;
  currency: string;
  price_notes: string;
  main_image_url: string;
  display_order: string;
  accommodation_description: string;
  accommodation_tier: string;
  travel_info: string;
}

const EMPTY: Form = {
  name: "",
  slug: "",
  package_type: TYPES[0]!,
  short_description: "",
  full_description: "",
  duration: "",
  tier: "",
  badge: "",
  status: "draft",
  is_featured: false,
  is_popular: false,
  price_display_type: "request_quote",
  starting_price: "",
  price_text: "Request quote",
  currency: "GBP",
  price_notes: "",
  main_image_url: "",
  display_order: "0",
  accommodation_description: "",
  accommodation_tier: "",
  travel_info: "",
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function PackageEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form>(EMPTY);
  const [inclusions, setInclusions] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "package", id],
    enabled: !isNew,
    queryFn: async () => {
      const [pkg, inc, exc, imgs] = await Promise.all([
        supabase.from("packages").select("*").eq("id", id).single(),
        supabase
          .from("package_inclusions")
          .select("title, display_order")
          .eq("package_id", id)
          .order("display_order"),
        supabase
          .from("package_exclusions")
          .select("title, display_order")
          .eq("package_id", id)
          .order("display_order"),
        supabase
          .from("package_images")
          .select("image_url, display_order")
          .eq("package_id", id)
          .order("display_order"),
      ]);
      if (pkg.error) throw pkg.error;
      return {
        pkg: pkg.data,
        inclusions: (inc.data ?? []).map((i) => i.title),
        exclusions: (exc.data ?? []).map((i) => i.title),
        gallery: (imgs.data ?? []).map((i) => i.image_url),
      };
    },
  });

  useEffect(() => {
    if (!data) return;
    const p = data.pkg;
    setForm({
      name: p.name,
      slug: p.slug,
      package_type: p.package_type,
      short_description: p.short_description ?? "",
      full_description: p.full_description ?? "",
      duration: p.duration ?? "",
      tier: p.tier ?? "",
      badge: p.badge ?? "",
      status: p.status,
      is_featured: p.is_featured,
      is_popular: p.is_popular,
      price_display_type: p.price_display_type,
      starting_price: p.starting_price != null ? String(p.starting_price) : "",
      price_text: p.price_text ?? "",
      currency: p.currency,
      price_notes: p.price_notes ?? "",
      main_image_url: p.main_image_url ?? "",
      display_order: String(p.display_order),
      accommodation_description: p.accommodation_description ?? "",
      accommodation_tier: p.accommodation_tier ?? "",
      travel_info: p.travel_info ?? "",
    });
    setInclusions(data.inclusions);
    setExclusions(data.exclusions);
    setGallery(data.gallery);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        slug: form.slug || slugify(form.name),
        package_type: form.package_type,
        short_description: form.short_description || null,
        full_description: form.full_description || null,
        duration: form.duration || null,
        tier: form.tier || null,
        badge: form.badge || null,
        status: form.status,
        is_featured: form.is_featured,
        is_popular: form.is_popular,
        price_display_type: form.price_display_type,
        starting_price: form.starting_price ? Number(form.starting_price) : null,
        price_text: form.price_text || null,
        currency: form.currency,
        price_notes: form.price_notes || null,
        main_image_url: form.main_image_url || null,
        display_order: Number(form.display_order) || 0,
        accommodation_description: form.accommodation_description || null,
        accommodation_tier: form.accommodation_tier || null,
        travel_info: form.travel_info || null,
      };

      let pkgId = id;
      if (isNew) {
        const { data, error } = await supabase.from("packages").insert(payload).select("id").single();
        if (error) throw error;
        pkgId = data.id;
      } else {
        const { error } = await supabase.from("packages").update(payload).eq("id", id);
        if (error) throw error;
      }

      await Promise.all([
        supabase.from("package_inclusions").delete().eq("package_id", pkgId),
        supabase.from("package_exclusions").delete().eq("package_id", pkgId),
        supabase.from("package_images").delete().eq("package_id", pkgId),
      ]);

      const rows = inclusions
        .filter((t) => t.trim())
        .map((title, i) => ({ package_id: pkgId, title, display_order: i + 1 }));
      if (rows.length) await supabase.from("package_inclusions").insert(rows);

      const exRows = exclusions
        .filter((t) => t.trim())
        .map((title, i) => ({ package_id: pkgId, title, display_order: i + 1 }));
      if (exRows.length) await supabase.from("package_exclusions").insert(exRows);

      const imgRows = gallery
        .filter((u) => u.trim())
        .map((image_url, i) => ({
          package_id: pkgId,
          image_url,
          category: "gallery",
          display_order: i + 1,
          is_primary: i === 0,
        }));
      if (imgRows.length) await supabase.from("package_images").insert(imgRows);

      return pkgId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/packages" });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save"),
  });

  const duplicate = useMutation({
    mutationFn: async () => {
      if (isNew) throw new Error("Cannot duplicate unsaved package");

      const [pkg, inc, exc, imgs] = await Promise.all([
        supabase.from("packages").select("*").eq("id", id).single(),
        supabase
          .from("package_inclusions")
          .select("*")
          .eq("package_id", id)
          .order("display_order"),
        supabase
          .from("package_exclusions")
          .select("*")
          .eq("package_id", id)
          .order("display_order"),
        supabase
          .from("package_images")
          .select("*")
          .eq("package_id", id)
          .order("display_order"),
      ]);

      if (pkg.error || !pkg.data) throw new Error("Could not load package");

      const p = pkg.data;
      const newSlug = `${p.slug}-copy-${Date.now().toString(36).slice(-4)}`;
      
      // Create new package
      const { data: newPkg, error: pkgErr } = await supabase
        .from("packages")
        .insert([
          {
            name: `${p.name} (Copy)`,
            slug: newSlug,
            package_type: p.package_type,
            short_description: p.short_description,
            full_description: p.full_description,
            duration: p.duration,
            tier: p.tier,
            badge: p.badge,
            status: "draft",
            is_featured: false,
            is_popular: false,
            price_display_type: p.price_display_type,
            starting_price: p.starting_price,
            price_text: p.price_text,
            currency: p.currency,
            price_notes: p.price_notes,
            main_image_url: p.main_image_url,
            display_order: p.display_order,
          },
        ])
        .select("id")
        .single();

      if (pkgErr || !newPkg) throw pkgErr || new Error("Could not create package");
      const newId = newPkg.id;

      // Copy inclusions
      if (inc.data && inc.data.length > 0) {
        await supabase
          .from("package_inclusions")
          .insert(
            inc.data.map((i) => ({
              package_id: newId,
              icon: i.icon,
              title: i.title,
              description: i.description,
              display_order: i.display_order,
            }))
          );
      }

      // Copy exclusions
      if (exc.data && exc.data.length > 0) {
        await supabase
          .from("package_exclusions")
          .insert(
            exc.data.map((e) => ({
              package_id: newId,
              title: e.title,
              description: e.description,
              display_order: e.display_order,
            }))
          );
      }

      // Copy images
      if (imgs.data && imgs.data.length > 0) {
        await supabase
          .from("package_images")
          .insert(
            imgs.data.map((img) => ({
              package_id: newId,
              image_url: img.image_url,
              category: img.category,
              alt_text: img.alt_text,
              display_order: img.display_order,
              is_primary: img.is_primary,
            }))
          );
      }

      return newId;
    },
    onSuccess: (newId) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/packages/$id", params: { id: newId } });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not duplicate"),
  });

  return (
    <AdminShell
      title={isNew ? "New package" : form.name || "Edit package"}
      description="Details, pricing display and inclusions."
      actions={
        <>
          <Btn variant="ghost" onClick={() => navigate({ to: "/admin/packages" })}>
            Cancel
          </Btn>
          <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
            {save.isPending ? "Saving…" : "Save package"}
          </Btn>
        </>
      }
    >
      {error && (
        <p className="mb-4 text-xs text-red-700 border border-red-700/30 bg-red-700/5 px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2 p-6 space-y-5">
          <h2 className="font-display text-xl text-emerald-deep">Details</h2>
          <Input
            label="Package name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({
                ...f,
                name,
                slug: f.slug && !isNew ? f.slug : slugify(name),
              }));
            }}
          />
          <Input
            label="URL slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
          />
          <Select
            label="Package type"
            options={TYPES}
            value={form.package_type}
            onChange={(e) => setForm((f) => ({ ...f, package_type: e.target.value }))}
          />
          <Textarea
            label="Short description"
            rows={2}
            value={form.short_description}
            onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
          />
          <Textarea
            label="Full description"
            rows={5}
            value={form.full_description}
            onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))}
          />
          <Textarea
            label="Accommodation details"
            rows={3}
            value={form.accommodation_description}
            onChange={(e) => setForm((f) => ({ ...f, accommodation_description: e.target.value }))}
          />
          <Textarea
            label="Travel information"
            rows={3}
            value={form.travel_info}
            onChange={(e) => setForm((f) => ({ ...f, travel_info: e.target.value }))}
          />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Duration"
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            />
            <Input
              label="Tier label"
              value={form.tier}
              onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
            />
            <Input
              label="Badge"
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
            />
            <Input
              label="Accommodation tier"
              value={form.accommodation_tier}
              onChange={(e) => setForm((f) => ({ ...f, accommodation_tier: e.target.value }))}
            />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6 space-y-4">
            <h2 className="font-display text-xl text-emerald-deep">Visibility</h2>
            <Select
              label="Status"
              options={STATUSES}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            />
            <Input
              label="Display order"
              type="number"
              value={form.display_order}
              onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
            />
            <Toggle
              label="Featured"
              checked={form.is_featured}
              onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
            />
            <Toggle
              label="Most popular"
              checked={form.is_popular}
              onChange={(v) => setForm((f) => ({ ...f, is_popular: v }))}
            />
          </Panel>

          <Panel className="p-6 space-y-4">
            <h2 className="font-display text-xl text-emerald-deep">Pricing display</h2>
            <Select
              label="Price display"
              options={PRICE_TYPES}
              value={form.price_display_type}
              onChange={(e) => setForm((f) => ({ ...f, price_display_type: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Starting price"
                type="number"
                value={form.starting_price}
                onChange={(e) => setForm((f) => ({ ...f, starting_price: e.target.value }))}
              />
              <Select
                label="Currency"
                options={["GBP", "USD", "EUR", "SAR"]}
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              />
            </div>
            <Input
              label="Custom price text"
              value={form.price_text}
              onChange={(e) => setForm((f) => ({ ...f, price_text: e.target.value }))}
            />
            <Textarea
              label="Price notes"
              rows={2}
              value={form.price_notes}
              onChange={(e) => setForm((f) => ({ ...f, price_notes: e.target.value }))}
            />
          </Panel>
        </div>

        <Panel className="lg:col-span-2 p-6 space-y-6">
          <ListEditor
            title="Inclusions"
            items={inclusions}
            setItems={setInclusions}
            placeholder="e.g. Haram-view suite"
          />
          <ListEditor
            title="Exclusions"
            items={exclusions}
            setItems={setExclusions}
            placeholder="e.g. Personal expenses"
          />
        </Panel>

        <Panel className="p-6 space-y-4">
          <h2 className="font-display text-xl text-emerald-deep">Images</h2>
          <Input
            label="Main image URL"
            value={form.main_image_url}
            onChange={(e) => setForm((f) => ({ ...f, main_image_url: e.target.value }))}
            placeholder="/images/pkg-royal.jpg"
          />
          {form.main_image_url && (
            <img
              src={form.main_image_url}
              alt="Package preview"
              className="w-full aspect-[4/3] object-cover border border-emerald-deep/10"
            />
          )}
          <GalleryUploader
            label="Gallery"
            value={gallery}
            onChange={setGallery}
          />
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
            Upload files in Media, then paste the copied link here.
          </p>
        </Panel>
      </div>
    </AdminShell>
  );
}

function ListEditor({
  title,
  items,
  setItems,
  placeholder,
}: {
  title: string;
  items: string[];
  setItems: (v: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-emerald-deep">{title}</h2>
        <Btn variant="ghost" onClick={() => setItems([...items, ""])}>
          Add
        </Btn>
      </div>
      {items.length === 0 && <p className="text-xs text-ink-soft">Nothing added yet.</p>}
      <div className="space-y-2">
        {items.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={value}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                setItems(next);
              }}
              className="flex-1 bg-white/60 border border-emerald-deep/15 px-3 py-2.5 text-sm focus:border-gold outline-none"
            />
            <button
              type="button"
              onClick={() => setItems(items.filter((_, x) => x !== i))}
              className="p-2 text-ink-soft hover:text-red-700"
              aria-label="Remove"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
