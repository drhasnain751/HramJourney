import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, Btn, Panel, Input, Textarea } from "@/components/admin/AdminShell";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/admin/_gate/website-content")({
  head: () => ({
    meta: [
      { title: "Website Content | Haram Journey Admin" },
      { name: "description", content: "Edit website content and images." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WebsiteContentPage,
});

type SiteSetting = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  image_url: string | null;
  value: string | null;
  display_order: number;
};

function WebsiteContentPage() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<SiteSetting> }) => {
      const { error } = await supabase.from("site_settings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "site-settings"] }),
  });

  const uploadImage = useMutation({
    mutationFn: async ({ settingId, file }: { settingId: string; file: File }) => {
      setUploading(settingId);
      const ext = file.name.split(".").pop();
      const filename = `site-settings/${settingId}-${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("media")
        .upload(filename, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(filename);

      // Update database
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({ image_url: urlData.publicUrl })
        .eq("id", settingId);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      setUploading(null);
    },
    onError: () => {
      setUploading(null);
    },
  });

  return (
    <AdminShell
      title="Website Content"
      description="Manage website images, text, and settings that appear across the public site."
    >
      <div className="space-y-6">
        {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}
        {(data ?? []).map((setting) => (
          <Panel key={setting.id} className="p-6">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div>
                <h3 className="font-display text-lg text-emerald-deep">{setting.label}</h3>
                {setting.description && (
                  <p className="text-xs text-ink-soft mt-1">{setting.description}</p>
                )}
              </div>

              {/* Value Field */}
              {setting.value !== null && (
                <div>
                  <label className="block text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-2">
                    Value
                  </label>
                  <textarea
                    value={setting.value}
                    onChange={(e) =>
                      update.mutate({ id: setting.id, patch: { value: e.target.value } })
                    }
                    className="w-full bg-white/40 border border-emerald-deep/15 px-3 py-2 text-sm text-ink rounded h-20"
                    placeholder="Enter value…"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-xs uppercase tracking-[0.25em] text-gold font-semibold mb-2">
                  Image
                </label>
                <div className="flex flex-col gap-3">
                  {setting.image_url && (
                    <div className="relative w-full h-40 bg-white/20 rounded overflow-hidden">
                      <img
                        src={setting.image_url}
                        alt={setting.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/40 border border-emerald-deep/20 border-dashed rounded cursor-pointer hover:bg-white/60 transition-colors">
                    <Upload size={16} className="text-gold" />
                    <span className="text-sm text-ink font-medium">
                      {uploading === setting.id ? "Uploading…" : "Click to upload"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          uploadImage.mutate({
                            settingId: setting.id,
                            file: e.target.files[0],
                          });
                        }
                      }}
                      disabled={uploading === setting.id}
                      className="hidden"
                    />
                  </label>
                  {setting.image_url && (
                    <a
                      href={setting.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gold hover:text-gold/80 underline truncate"
                    >
                      View original
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </AdminShell>
  );
}
