import type { BilingualText } from "@/store/types";

interface BilingualFieldProps {
  label: string;
  value: BilingualText;
  onChange: (value: BilingualText) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: { en?: string; ar?: string };
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-primary/50 focus:bg-[#161616] focus:ring-2 focus:ring-primary/10";

export const BilingualField = ({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  required = false,
  placeholder,
}: BilingualFieldProps) => {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-semibold uppercase tracking-wider text-white/50">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-primary/70">EN</label>
          {multiline ? (
            <textarea
              required={required}
              rows={rows}
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder={placeholder?.en ?? `${label} (English)`}
              className={`${inputCls} resize-none`}
              dir="ltr"
            />
          ) : (
            <input
              required={required}
              type="text"
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder={placeholder?.en ?? `${label} (English)`}
              className={inputCls}
              dir="ltr"
            />
          )}
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70">AR</label>
          {multiline ? (
            <textarea
              required={required}
              rows={rows}
              value={value.ar}
              onChange={(e) => onChange({ ...value, ar: e.target.value })}
              placeholder={placeholder?.ar ?? `${label} (Arabic)`}
              className={`${inputCls} resize-none`}
              dir="rtl"
            />
          ) : (
            <input
              required={required}
              type="text"
              value={value.ar}
              onChange={(e) => onChange({ ...value, ar: e.target.value })}
              placeholder={placeholder?.ar ?? `${label} (Arabic)`}
              className={inputCls}
              dir="rtl"
            />
          )}
        </div>
      </div>
      <p className="text-[10px] text-white/30 pt-0.5">Hebrew is generated automatically from English.</p>
    </fieldset>
  );
};
