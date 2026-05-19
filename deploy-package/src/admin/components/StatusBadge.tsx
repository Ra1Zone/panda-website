import { cn } from "@/lib/utils";

type Status = "active" | "inactive" | "new" | "read" | "replied";

const config: Record<Status, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-primary/15 text-primary border-primary/25" },
  inactive: { label: "Inactive", cls: "bg-white/5 text-white/40 border-white/10" },
  new: { label: "New", cls: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  read: { label: "Read", cls: "bg-white/8 text-white/50 border-white/12" },
  replied: { label: "Replied", cls: "bg-primary/12 text-primary/80 border-primary/20" },
};

export const StatusBadge = ({ status }: { status: Status }) => {
  const { label, cls } = config[status] ?? config.inactive;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", cls)}>
      {label}
    </span>
  );
};
