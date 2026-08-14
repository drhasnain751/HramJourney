import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeForWhatsApp } from "@/lib/phone";
import { AdminShell, Btn, Panel } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/_gate/inquiries")({
  head: () => ({
    meta: [
      { title: "Inquiries | Haram Journey Admin" },
      { name: "description", content: "Quote requests submitted from the website." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InquiriesPage,
});

const STATUSES = ["new", "contacted", "quoted", "booked", "closed"];

function InquiriesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", filter],
    queryFn: async () => {
      let q = supabase.from("inquiries").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: { status?: string; admin_notes?: string } }) => {
      const { error } = await supabase.from("inquiries").update(patch).eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "inquiries"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "inquiries"] }),
  });

  return (
    <AdminShell
      title="Inquiries"
      description="Every quote request from your website, newest first."
      actions={
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white/60 border border-emerald-deep/15 px-3 py-2.5 text-[10px] uppercase tracking-[0.25em]"
        >
          {["all", ...STATUSES].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      }
    >
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}
        {(data ?? []).map((i) => (
          <Panel key={i.id} className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-display text-2xl text-emerald-deep">{i.full_name}</div>
                <div className="text-xs text-ink-soft mt-1">
                    <a href={`mailto:${i.email}`} className="hover:text-gold">
                      {i.email}
                    </a>
                    {i.phone && (
                      <>
                        {" · "}
                        <a href={`tel:${i.phone}`} className="hover:text-gold">
                          {i.phone}
                        </a>
                        {" "}
                        <a
                          href={normalizeForWhatsApp(i.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center gap-2 bg-[#25D366] text-white px-2 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold rounded"
                        >
                          WhatsApp
                        </a>
                      </>
                    )}
                  </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={i.status}
                  onChange={(e) => update.mutate({ id: i.id, patch: { status: e.target.value } })}
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
                    if (confirm("Delete this inquiry?")) remove.mutate(i.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>

            <dl className="mt-5 grid sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <Item label="Package">{i.package_name ?? i.package_type ?? "—"}</Item>
              <Item label="Travelers">{i.travelers ?? "—"}</Item>
              <Item label="Travel date">{i.travel_date ?? "—"}</Item>
              <Item label="Country">{i.country ?? "—"}</Item>
              <Item label="Departure">{i.departure_city ?? "—"}</Item>
              <Item label="Received">{new Date(i.created_at).toLocaleString()}</Item>
            </dl>

            {i.message && (
              <p className="mt-4 text-sm text-ink-soft border-l-2 border-gold/50 pl-4">
                {i.message}
              </p>
            )}

            <textarea
              defaultValue={i.admin_notes ?? ""}
              placeholder="Internal notes…"
              rows={2}
              onBlur={(e) =>
                e.target.value !== (i.admin_notes ?? "") &&
                update.mutate({ id: i.id, patch: { admin_notes: e.target.value } })
              }
              className="mt-4 w-full bg-white/60 border border-emerald-deep/15 px-3 py-2.5 text-sm focus:border-gold outline-none"
            />
          </Panel>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="text-sm text-ink-soft">No inquiries in this view.</p>
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
