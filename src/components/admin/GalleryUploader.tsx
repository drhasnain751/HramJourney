import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, GripVertical, Trash2 } from "lucide-react";

interface GalleryUploaderProps {
  label?: string;
  value: string[];
  onChange: (items: string[]) => void;
  bucket?: string;
  folder?: string;
}

export function GalleryUploader({
  label = "Gallery",
  value,
  onChange,
  bucket = "media",
  folder = "general",
}: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      setUploading(true);
      setError(null);

      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const filename = `${folder}/gallery-${timestamp}-${random}-${i}.${ext}`;

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filename);

        newUrls.push(urlData.publicUrl);
      }

      onChange([...value, ...newUrls]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...value];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs uppercase tracking-[0.25em] text-gold font-semibold">
          {label}
        </label>
      )}

      {/* Gallery Grid */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => draggedIndex !== null && moveItem(draggedIndex, index)}
              className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                draggedIndex === index
                  ? "bg-gold/10 border-gold/30 opacity-50"
                  : "bg-white/20 border-emerald-deep/10 hover:border-emerald-deep/20"
              }`}
            >
              <GripVertical size={16} className="text-gold/60 flex-shrink-0" />
              <img
                src={url}
                alt="Gallery item"
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-ink-soft truncate">{url.split("/").pop()}</p>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50/50 p-1.5 rounded transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <label className="flex items-center justify-center gap-2 px-4 py-6 bg-white/40 border-2 border-dashed border-emerald-deep/20 rounded-lg cursor-pointer hover:bg-white/60 hover:border-emerald-deep/30 transition-all">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <div className="flex items-center gap-2 text-sm text-ink">
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Uploading…</span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-gold" />
              <span className="font-medium">Click or drag images</span>
            </>
          )}
        </div>
      </label>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50/50 border border-red-200 rounded px-2 py-1">
          {error}
        </p>
      )}

      {/* Info */}
      <p className="text-xs text-ink-soft">
        {value.length} image{value.length !== 1 ? "s" : ""} • Drag to reorder • Upload multiple at once
      </p>
    </div>
  );
}
