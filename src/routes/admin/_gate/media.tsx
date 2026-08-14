import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, Btn, Panel } from "@/components/admin/AdminShell";
import { Copy, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/_gate/media")({
  head: () => ({
    meta: [
      { title: "Media | Haram Journey Admin" },
      { name: "description", content: "Upload and manage website imagery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MediaPage,
});

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

function MediaPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upload = useMutation({
    mutationFn: async (files: FileList) => {
      for (const file of Array.from(files)) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
        });
        if (upErr) throw upErr;

        const { data: signed, error: signErr } = await supabase.storage
          .from("media")
          .createSignedUrl(path, TEN_YEARS);
        if (signErr) throw signErr;

        const { error: insErr } = await supabase.from("media").insert({
          file_path: path,
          public_url: signed.signedUrl,
          file_name: file.name,
          folder: "general",
          file_size: file.size,
          mime_type: file.type,
        });
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => {
      setError(null);
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Upload failed"),
  });

  const remove = useMutation({
    mutationFn: async ({ id, path }: { id: string; path: string }) => {
      await supabase.storage.from("media").remove([path]);
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "media"] }),
  });

  return (
    <AdminShell
      title="Media"
      description="Upload imagery, then copy the link into a package or hotel."
      actions={
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => e.target.files && upload.mutate(e.target.files)}
          />
          <Btn onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
            <Upload className="size-3.5" /> {upload.isPending ? "Uploading…" : "Upload images"}
          </Btn>
        </>
      }
    >
      {error && (
        <p className="mb-4 text-xs text-red-700 border border-red-700/30 bg-red-700/5 px-3 py-2">
          {error}
        </p>
      )}
      {isLoading && <p className="text-sm text-ink-soft">Loading…</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data ?? []).map((m) => (
          <Panel key={m.id} className="overflow-hidden">
            <img
              src={m.public_url}
              alt={m.file_name}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="p-4 space-y-3">
              <div className="text-xs text-emerald-deep truncate">{m.file_name}</div>
              <div className="flex gap-2">
                <Btn
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(m.public_url);
                    setCopied(m.id);
                  }}
                >
                  <Copy className="size-3.5" /> {copied === m.id ? "Copied" : "Copy link"}
                </Btn>
                <Btn
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Delete ${m.file_name}?`))
                      remove.mutate({ id: m.id, path: m.file_path });
                  }}
                >
                  Delete
                </Btn>
              </div>
            </div>
          </Panel>
        ))}
      </div>
      {!isLoading && (data ?? []).length === 0 && (
        <p className="text-sm text-ink-soft">No media uploaded yet.</p>
      )}
    </AdminShell>
  );
}
