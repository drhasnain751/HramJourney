import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeForWhatsApp } from "@/lib/phone";
import { AdminShell, Btn, Panel } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/_gate/custom-requests")({
  head: () => ({
    meta: [
      { title: "Custom Builds | Haram Journey Admin" },
      { name: "description", content: "Bespoke itineraries submitted from the builder." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CustomRequestsPage,
});

const STATUSES = ["new", "contacted", "quoted", "booked", "closed"];

function CustomRequestsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "custom-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_package_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("custom_package_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "custom-requests"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_package_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "custom-requests"] }),
  });

  return (
    <AdminShell
      title="Custom Builds"
      description="Itineraries composed by visitors in the bespoke builder."
    >
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}
        {(data ?? []).map((r) => (
          <Panel key={r.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-display text-2xl text-emerald-deep">
                  {r.full_name ?? "Anonymous visitor"}
                </div>
                <div className="text-xs text-ink-soft mt-1">
                  <a href={`mailto:${r.email}`} className="hover:text-gold">
                    {r.email ?? "No email"}
                  </a>
                  {r.phone && (
                    <>
                      {" · "}
                      <a href={`tel:${r.phone}`} className="hover:text-gold">
                        {r.phone}
                      </a>
                      {" "}
                      <a
                        href={normalizeForWhatsApp(r.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center gap-2 bg-[#25D366] text-white px-2 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold rounded"
                      >
                        WhatsApp
                      </a>
                    </>
                  )}
                  {" · "}{new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={r.status}
                  onChange={(e) => update.mutate({ id: r.id, status: e.target.value })}
                  className="bg-white/60 border border-emerald-deep/15 px-3 py-2 text-[10px] uppercase tracking-[0.25em]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm("Delete this request?")) remove.mutate(r.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>

            <dl className="mt-5 grid sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
              <Item label="Travelers">
                {r.adults} adults · {r.children} children
              </Item>
              <Item label="Month">{r.travel_month ?? "—"}</Item>
              <Item label="Duration">{r.duration ?? "—"}</Item>
              <Item label="Tier">{r.accommodation_tier ?? "—"}</Item>
              <Item label="Transport">{r.transport_preference ?? "—"}</Item>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              {(r.selected_services ?? []).map((s) => (
                <span
                  key={s}
                  className="text-[10px] uppercase tracking-[0.2em] border border-gold/40 text-gold px-2 py-1"
                >
                  {s}
                </span>
              ))}
            </div>

            {r.notes && (
              <p className="mt-4 text-sm text-ink-soft border-l-2 border-gold/50 pl-4">{r.notes}</p>
            )}
          </Panel>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="text-sm text-ink-soft">No custom requests yet.</p>
        )}
      </div>
    </AdminShell>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-[0.25em] text-gold">{label}</dt>
      <dd className="text-emerald-deep mt-1">{children}</dd>
    </div>
  );
}
