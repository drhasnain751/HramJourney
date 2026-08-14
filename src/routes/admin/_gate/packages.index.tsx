import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, Btn, Panel } from "@/components/admin/AdminShell";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/_gate/packages/")({
  head: () => ({
    meta: [
      { title: "Packages | Haram Journey Admin" },
      { name: "description", content: "Create and manage Umrah packages." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PackagesList,
});

function PackagesList() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, name, slug, package_type, duration, status, is_featured, is_popular, display_order")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("packages").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "packages"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "packages"] }),
  });

  return (
    <AdminShell
      title="Packages"
      description="Every package shown on the website."
      actions={
        <Btn onClick={() => navigate({ to: "/admin/packages/$id", params: { id: "new" } })}>
          <Plus className="size-3.5" /> New package
        </Btn>
      }
    >
      <Panel>
        <div className="divide-y divide-emerald-deep/8">
          {isLoading && <p className="px-6 py-8 text-sm text-ink-soft">Loading…</p>}
          {(data ?? []).map((p) => (
            <div key={p.id} className="px-6 py-5 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <Link
                  to="/admin/packages/$id"
                  params={{ id: p.id }}
                  className="font-display text-xl text-emerald-deep hover:text-gold"
                >
                  {p.name}
                </Link>
                <div className="text-xs text-ink-soft mt-1">
                  {p.package_type} · {p.duration ?? "Flexible"} · /{p.slug}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {p.is_featured && (
                  <span className="text-[9px] uppercase tracking-[0.25em] text-gold border border-gold/40 px-2 py-1">
                    Featured
                  </span>
                )}
                {p.is_popular && (
                  <span className="text-[9px] uppercase tracking-[0.25em] text-emerald-deep border border-emerald-deep/25 px-2 py-1">
                    Popular
                  </span>
                )}
                <span
                  className={`text-[9px] uppercase tracking-[0.25em] px-2 py-1 ${
                    p.status === "published"
                      ? "bg-emerald-deep text-sand"
                      : "border border-ink-soft/30 text-ink-soft"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Btn
                  variant="ghost"
                  onClick={() =>
                    toggleStatus.mutate({
                      id: p.id,
                      status: p.status === "published" ? "draft" : "published",
                    })
                  }
                >
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete “${p.name}”? This cannot be undone.`)) remove.mutate(p.id);
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>
          ))}
          {!isLoading && (data ?? []).length === 0 && (
            <p className="px-6 py-8 text-sm text-ink-soft">No packages yet.</p>
          )}
        </div>
      </Panel>
    </AdminShell>
  );
}
