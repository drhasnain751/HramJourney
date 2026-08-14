import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from "lucide-react";
import { uploadImage, uploadImages } from "@/lib/upload";
import { Btn } from "@/components/admin/AdminShell";

export function ImageField({
  label,
  value,
  onChange,
  folder = "general",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImage(files[0]!, folder);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
        {label}
      </span>
      {value ? (
        <img
          src={value}
          alt={label}
          className="w-full aspect-[4/3] object-cover border border-emerald-deep/10"
        />
      ) : (
        <div className="w-full aspect-[4/3] border border-dashed border-emerald-deep/20 flex items-center justify-center text-xs text-ink-soft">
          No image yet
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => pick(e.target.files)}
      />
      <div className="flex gap-2">
        <Btn variant="ghost" onClick={() => ref.current?.click()} disabled={busy}>
          <Upload className="size-3.5" /> {busy ? "Uploading…" : value ? "Replace" : "Upload"}
        </Btn>
        {value && (
          <Btn variant="danger" onClick={() => onChange("")}>
            <Trash2 className="size-3.5" /> Remove
          </Btn>
        )}
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function GalleryEditor({
  label = "Gallery",
  items,
  onChange,
  folder = "general",
}: {
  label?: string;
  items: string[];
  onChange: (v: string[]) => void;
  folder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const urls = await uploadImages(files, folder);
      onChange([...items, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const replace = async (files: FileList | null) => {
    if (!files?.length || replaceIndex === null) return;
    setBusy(true);
    setError(null);
    try {
      const url = await uploadImage(files[0]!, folder);
      const next = [...items];
      next[replaceIndex] = url;
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      setReplaceIndex(null);
      if (replaceRef.current) replaceRef.current.value = "";
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="block text-[10px] uppercase tracking-[0.25em] text-emerald-deep font-semibold">
          {label}
        </span>
        <Btn variant="ghost" onClick={() => ref.current?.click()} disabled={busy}>
          <Upload className="size-3.5" /> {busy ? "Uploading…" : "Add images"}
        </Btn>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => add(e.target.files)}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => replace(e.target.files)}
      />
      {error && <p className="text-xs text-red-700">{error}</p>}
      {items.length === 0 && <p className="text-xs text-ink-soft">No gallery images yet.</p>}
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((url, i) => (
          <div key={`${url}-${i}`} className="border border-emerald-deep/10">
            <div className="relative">
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full aspect-[4/3] object-cover" />
              {i === 0 && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-emerald-deep text-sand text-[9px] uppercase tracking-[0.2em] px-2 py-1">
                  <Star className="size-3" fill="currentColor" /> Primary
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 p-2">
              <IconBtn label="Move left" onClick={() => move(i, i - 1)}>
                <ArrowLeft className="size-3.5" />
              </IconBtn>
              <IconBtn label="Move right" onClick={() => move(i, i + 1)}>
                <ArrowRight className="size-3.5" />
              </IconBtn>
              <IconBtn label="Make primary" onClick={() => move(i, 0)}>
                <Star className="size-3.5" />
              </IconBtn>
              <IconBtn
                label="Replace"
                onClick={() => {
                  setReplaceIndex(i);
                  replaceRef.current?.click();
                }}
              >
                <Upload className="size-3.5" />
              </IconBtn>
              <IconBtn
                label="Delete"
                danger
                onClick={() => {
                  if (confirm("Remove this gallery image?"))
                    onChange(items.filter((_, x) => x !== i));
                }}
              >
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`p-2 border border-emerald-deep/15 transition-colors ${
        danger ? "text-red-700 hover:bg-red-600/10" : "text-emerald-deep hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}
