import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, Btn, Input, Panel, Select, Textarea, Toggle } from "@/components/admin/AdminShell";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/_gate/hotels")({
  head: () => ({
    meta: [
      { title: "Hotels | Haram Journey Admin" },
      { name: "description", content: "Manage Makkah and Madinah hotels." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HotelsPage,
});

interface HotelForm {
  id?: string;
  name: string;
  city: string;
  location: string;
  star_rating: string;
  distance_from_haram: string;
  description: string;
  facilities: string;
  main_image_url: string;
  status: string;
  is_featured: boolean;
  display_order: string;
}

const EMPTY: HotelForm = {
  name: "",
  city: "Makkah",
  location: "",
  star_rating: "5",
  distance_from_haram: "",
  description: "",
  facilities: "",
  main_image_url: "",
  status: "active",
  is_featured: false,
  display_order: "0",
};

function HotelsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<HotelForm | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "hotels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (f: HotelForm) => {
      const payload = {
        name: f.name,
        city: f.city,
        location: f.location || null,
        star_rating: Number(f.star_rating) || 5,
        distance_from_haram: f.distance_from_haram || null,
        description: f.description || null,
        facilities: f.facilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        main_image_url: f.main_image_url || null,
        status: f.status,
        is_featured: f.is_featured,
        display_order: Number(f.display_order) || 0,
      };
      const { error } = f.id
        ? await supabase.from("hotels").update(payload).eq("id", f.id)
        : await supabase.from("hotels").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "hotels"] });
      setForm(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hotels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "hotels"] }),
  });

  return (
    <AdminShell
      title="Hotels"
      description="Accommodation used across your packages."
      actions={
        <Btn onClick={() => setForm(EMPTY)}>
          <Plus className="size-3.5" /> New hotel
        </Btn>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
          <div className="divide-y divide-emerald-deep/8">
            {isLoading && <p className="px-6 py-8 text-sm text-ink-soft">Loading…</p>}
            {(data ?? []).map((h) => (
              <div key={h.id} className="px-6 py-5 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-display text-xl text-emerald-deep">{h.name}</div>
                  <div className="text-xs text-ink-soft mt-1">
                    {h.city} · {h.star_rating}★ · {h.distance_from_haram ?? "—"}
                  </div>
                </div>
                <span
                  className={`text-[9px] uppercase tracking-[0.25em] px-2 py-1 ${
                    h.status === "active"
                      ? "bg-emerald-deep text-sand"
                      : "border border-ink-soft/30 text-ink-soft"
                  }`}
                >
                  {h.status}
                </span>
                <Btn
                  variant="ghost"
                  onClick={() =>
                    setForm({
                      id: h.id,
                      name: h.name,
                      city: h.city,
                      location: h.location ?? "",
                      star_rating: String(h.star_rating),
                      distance_from_haram: h.distance_from_haram ?? "",
                      description: h.description ?? "",
                      facilities: (h.facilities ?? []).join(", "),
                      main_image_url: h.main_image_url ?? "",
                      status: h.status,
                      is_featured: h.is_featured,
                      display_order: String(h.display_order),
                    })
                  }
                >
                  Edit
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete “${h.name}”?`)) remove.mutate(h.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            ))}
            {!isLoading && (data ?? []).length === 0 && (
              <p className="px-6 py-8 text-sm text-ink-soft">No hotels yet.</p>
            )}
          </div>
        </Panel>

        {form && (
          <Panel className="p-6 space-y-4 h-fit">
            <h2 className="font-display text-xl text-emerald-deep">
              {form.id ? "Edit hotel" : "New hotel"}
            </h2>
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Select
              label="City"
              options={["Makkah", "Madinah", "Jeddah"]}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <Input
              label="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stars"
                type="number"
                min={1}
                max={5}
                value={form.star_rating}
                onChange={(e) => setForm({ ...form, star_rating: e.target.value })}
              />
              <Input
                label="Distance"
                value={form.distance_from_haram}
                onChange={(e) => setForm({ ...form, distance_from_haram: e.target.value })}
              />
            </div>
            <Textarea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              label="Facilities (comma separated)"
              value={form.facilities}
              onChange={(e) => setForm({ ...form, facilities: e.target.value })}
            />
            <Input
              label="Main image URL"
              value={form.main_image_url}
              onChange={(e) => setForm({ ...form, main_image_url: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Status"
                options={["active", "inactive"]}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
              <Input
                label="Order"
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: e.target.value })}
              />
            </div>
            <Toggle
              label="Featured"
              checked={form.is_featured}
              onChange={(v) => setForm({ ...form, is_featured: v })}
            />
            <div className="flex gap-2 pt-2">
              <Btn onClick={() => save.mutate(form)} disabled={!form.name || save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Btn>
              <Btn variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Btn>
            </div>
          </Panel>
        )}
      </div>
    </AdminShell>
  );
}
