import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, Btn, Input, Panel, Select, Textarea, Toggle } from "@/components/admin/AdminShell";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/_gate/services")({
  head: () => ({
    meta: [
      { title: "Services | Haram Journey Admin" },
      { name: "description", content: "Manage the services offered in the custom builder." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ServicesPage,
});

interface ServiceForm {
  id?: string;
  name: string;
  description: string;
  icon: string;
  image_url: string;
  status: string;
  show_in_builder: boolean;
  display_order: string;
}

const EMPTY: ServiceForm = {
  name: "",
  description: "",
  icon: "Sparkles",
  image_url: "",
  status: "active",
  show_in_builder: true,
  display_order: "0",
};

function ServicesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<ServiceForm | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (f: ServiceForm) => {
      const payload = {
        name: f.name,
        description: f.description || null,
        icon: f.icon || null,
        image_url: f.image_url || null,
        status: f.status,
        show_in_builder: f.show_in_builder,
        display_order: Number(f.display_order) || 0,
      };
      const { error } = f.id
        ? await supabase.from("services").update(payload).eq("id", f.id)
        : await supabase.from("services").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      setForm(null);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "services"] }),
  });

  return (
    <AdminShell
      title="Services"
      description="These power the custom itinerary builder on your website."
      actions={
        <Btn onClick={() => setForm(EMPTY)}>
          <Plus className="size-3.5" /> New service
        </Btn>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
          <div className="divide-y divide-emerald-deep/8">
            {isLoading && <p className="px-6 py-8 text-sm text-ink-soft">Loading…</p>}
            {(data ?? []).map((s) => (
              <div key={s.id} className="px-6 py-5 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-display text-lg text-emerald-deep">{s.name}</div>
                  <div className="text-xs text-ink-soft mt-1">{s.description ?? "—"}</div>
                </div>
                {s.show_in_builder && (
                  <span className="text-[9px] uppercase tracking-[0.25em] text-gold border border-gold/40 px-2 py-1">
                    In builder
                  </span>
                )}
                <span
                  className={`text-[9px] uppercase tracking-[0.25em] px-2 py-1 ${
                    s.status === "active"
                      ? "bg-emerald-deep text-sand"
                      : "border border-ink-soft/30 text-ink-soft"
                  }`}
                >
                  {s.status}
                </span>
                <Btn
                  variant="ghost"
                  onClick={() =>
                    setForm({
                      id: s.id,
                      name: s.name,
                      description: s.description ?? "",
                      icon: s.icon ?? "",
                      image_url: s.image_url ?? "",
                      status: s.status,
                      show_in_builder: s.show_in_builder,
                      display_order: String(s.display_order),
                    })
                  }
                >
                  Edit
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete “${s.name}”?`)) remove.mutate(s.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            ))}
            {!isLoading && (data ?? []).length === 0 && (
              <p className="px-6 py-8 text-sm text-ink-soft">No services yet.</p>
            )}
          </div>
        </Panel>

        {form && (
          <Panel className="p-6 space-y-4 h-fit">
            <h2 className="font-display text-xl text-emerald-deep">
              {form.id ? "Edit service" : "New service"}
            </h2>
            <Input
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              label="Icon name"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
            <Input
              label="Image URL"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
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
              label="Show in custom builder"
              checked={form.show_in_builder}
              onChange={(v) => setForm({ ...form, show_in_builder: v })}
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
