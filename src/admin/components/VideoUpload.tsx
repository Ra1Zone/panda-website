import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Film, X } from "lucide-react";
import { videoDB, IDB_PREFIX } from "@/store/videoDB";
import { useVideoUrl } from "@/store/useVideoUrl";

const VALID_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/mpeg",
]);
const VALID_EXT = new Set([".mp4", ".webm", ".mov"]);
// 1 GB — stored as a raw Blob in IndexedDB (no base64 inflation, no localStorage quota).
// Note: browsers may enforce their own IndexedDB limits on low-storage devices;
// for files larger than ~500 MB, hosting the video externally and pasting a URL is more reliable.
const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB

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

  // Resolves idb:// to a blob Object URL; passes regular URLs/data: through unchanged
  const resolvedUrl = useVideoUrl(value);

  const validate = (file: File): string | null => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    if (!VALID_MIME.has(file.type) && !VALID_EXT.has(ext)) {
      return "Unsupported format. Use .mp4, .webm, or .mov";
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(0);
      return `File is ${mb} MB — maximum is 1 GB.`;
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
      // Store raw Blob in IndexedDB — no base64 encoding, no size inflation.
      const ref = await videoDB.save(file);
      onChange(ref);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch {
      setError("Failed to save video. Storage may be full.");
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

  const isIdb = value.startsWith(IDB_PREFIX);
  const isDataUrl = value.startsWith("data:");
  const hasValue = !!value;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</p>

      {hasValue && !uploading ? (
        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
          {resolvedUrl ? (
            <video
              key={resolvedUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-48 w-full object-cover"
              onError={() => setError("Video failed to load. Check the file or URL.")}
            >
              <source src={resolvedUrl} />
            </video>
          ) : (
            // Shown briefly while IDB resolves the blob URL
            <div className="flex h-48 items-center justify-center gap-3 text-white/30">
              <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              <span className="text-xs">Loading preview…</span>
            </div>
          )}
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
              <p className="text-xs font-medium text-white/60">Saving to storage…</p>
            </>
          ) : (
            <>
              <Film className="size-6 text-white/30" />
              <p className="text-xs text-white/40">Click or drag to upload</p>
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-wide">
                MP4 • WEBM • MOV — up to 1 GB
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

      {/* URL paste input — shown when no uploaded file (idb://) is active */}
      {!isIdb && (
        <input
          type="url"
          value={isDataUrl ? "" : value}
          onChange={(e) => { setError(null); onChange(e.target.value); }}
          placeholder="Or paste video URL (MP4 / WEBM / MOV)…"
          className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50"
        />
      )}
      {isIdb && (
        <p className="text-[10px] text-white/25">Stored locally · replace to use a URL instead</p>
      )}

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
