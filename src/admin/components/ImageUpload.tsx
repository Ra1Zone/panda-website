import { useRef, useState } from "react";
import { AlertCircle, Upload, X } from "lucide-react";

const VALID_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"]);
const VALID_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"]);

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
}

export const ImageUpload = ({ value, onChange, label = "Image" }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!VALID_MIME.has(file.type) && !VALID_EXT.has(ext)) {
      setError("Unsupported format. Use jpg, png, webp, or svg.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>

      {value ? (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111111]">
          <img
            src={value}
            alt="Preview"
            className="h-48 w-full object-cover"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => { onChange(""); setError(null); }}
              className="flex size-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/40"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-white/10 bg-[#111111] hover:border-primary/40 hover:bg-[#141414]"
          }`}
        >
          <Upload className="size-6 text-white/30" />
          <p className="text-xs text-white/40">Click or drag to upload</p>
          <p className="text-[10px] text-white/25">jpg · png · webp · svg</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        type="url"
        value={value.startsWith("data:") ? "" : value}
        onChange={(e) => { setError(null); onChange(e.target.value); }}
        placeholder="Or paste image URL…"
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        className="hidden"
      />
    </div>
  );
};
