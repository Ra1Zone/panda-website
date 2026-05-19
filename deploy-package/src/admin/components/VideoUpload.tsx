import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Film, X } from "lucide-react";

const VALID_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/mpeg",
]);
const VALID_EXT = new Set([".mp4", ".webm", ".mov"]);
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

interface VideoUploadProps {
  value: string;
  onChange: (ref: string) => void;
  label?: string;
}

export const VideoUpload = ({ value, onChange, label = "Video" }: VideoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const validate = (file: File): string | null => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!VALID_MIME.has(file.type) && !VALID_EXT.has(ext)) {
      return "Unsupported format. Use .mp4, .webm, or .mov";
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(0);
      return `File is ${mb} MB — maximum is 50 MB.`;
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validate(file);
    if (validationError) { setError(validationError); return; }

    setError(null);
    setUploading(true);
    setJustSaved(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch {
      setError("Failed to upload video.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleClear = () => {
    onChange("");
    setError(null);
    setJustSaved(false);
  };

  const hasValue = !!value;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>

      {hasValue && !uploading ? (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
          <video
            key={value}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-48 w-full object-cover"
            onError={() => setError("Video failed to load. Check the file or URL.")}
          >
            <source src={value} />
          </video>
          {justSaved && (
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-primary/90 px-4 py-2 text-xs font-semibold text-primary-foreground">
              <CheckCircle2 className="size-3.5" /> Saved
            </div>
          )}
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
              onClick={handleClear}
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
          onClick={() => !uploading && inputRef.current?.click()}
          className={[
            "flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all",
            uploading ? "cursor-wait border-primary/40 bg-primary/5" :
            dragging  ? "border-primary bg-primary/5" :
                        "border-white/10 bg-[#111111] hover:border-primary/40 hover:bg-[#141414]",
          ].join(" ")}
        >
          {uploading ? (
            <>
              <div className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
              <p className="text-xs font-medium text-white/60">Uploading…</p>
            </>
          ) : (
            <>
              <Film className="size-6 text-white/30" />
              <p className="text-xs text-white/40">Click or drag to upload</p>
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-wide">
                MP4 · WEBM · MOV — up to 50 MB
              </p>
            </>
          )}
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
        value={value}
        onChange={(e) => { setError(null); onChange(e.target.value); }}
        placeholder="Or paste video URL (MP4 / WEBM / MOV)…"
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50"
      />

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        onChange={handleInput}
        className="hidden"
      />
    </div>
  );
};
