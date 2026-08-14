import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, Panel } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/_gate/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Haram Journey Admin" },
      { name: "description", content: "Overview of packages, inquiries and content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [pkgs, published, hotels, services, inquiries, newInquiries, custom, recent] =
        await Promise.all([
          supabase.from("packages").select("id", { count: "exact", head: true }),
          supabase
            .from("packages")
            .select("id", { count: "exact", head: true })
            .eq("status", "published"),
          supabase.from("hotels").select("id", { count: "exact", head: true }),
          supabase.from("services").select("id", { count: "exact", head: true }),
          supabase.from("inquiries").select("id", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
          supabase.from("custom_package_requests").select("id", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("id, full_name, email, package_name, status, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
        ]);
      return {
        packages: pkgs.count ?? 0,
        published: published.count ?? 0,
        hotels: hotels.count ?? 0,
        services: services.count ?? 0,
        inquiries: inquiries.count ?? 0,
        newInquiries: newInquiries.count ?? 0,
        custom: custom.count ?? 0,
        recent: recent.data ?? [],
      };
    },
  });

  const stats = [
    { label: "Packages", value: data?.packages, hint: `${data?.published ?? 0} published` },
    { label: "New Inquiries", value: data?.newInquiries, hint: `${data?.inquiries ?? 0} total` },
    { label: "Custom Builds", value: data?.custom, hint: "Bespoke requests" },
    { label: "Hotels & Services", value: (data?.hotels ?? 0) + (data?.services ?? 0), hint: "Catalogue items" },
  ];

  return (
    <AdminShell title="Dashboard" description="Everything on your website at a glance.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Panel key={s.label} className="p-6">
            <div className="text-[10px] uppercase tracking-[0.25em] text-ink-soft">{s.label}</div>
            <div className="font-display text-4xl text-emerald-deep mt-2">
              {isLoading ? "—" : (s.value ?? 0)}
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold mt-2">{s.hint}</div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-deep/10">
          <h2 className="font-display text-xl text-emerald-deep">Latest inquiries</h2>
          <Link
            to="/admin/inquiries"
            className="text-[10px] uppercase tracking-[0.25em] text-gold hover:text-emerald-deep"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-emerald-deep/8">
          {(data?.recent ?? []).map((r) => (
            <div key={r.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-emerald-deep font-medium">{r.full_name}</div>
                <div className="text-xs text-ink-soft">{r.email}</div>
              </div>
              <div className="text-xs text-ink-soft">{r.package_name ?? "General"}</div>
              <span className="text-[9px] uppercase tracking-[0.25em] border border-gold/40 text-gold px-2 py-1">
                {r.status}
              </span>
            </div>
          ))}
          {!isLoading && (data?.recent ?? []).length === 0 && (
            <p className="px-6 py-8 text-sm text-ink-soft">No inquiries yet.</p>
          )}
        </div>
      </Panel>
    </AdminShell>
  );
}
