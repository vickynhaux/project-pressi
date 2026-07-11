interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  accent?: boolean;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, unit, subtext, accent, icon }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-3 transition-colors"
      style={{
        background: accent ? "var(--brand)" : "var(--bg-card)",
        border: accent ? "none" : "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between">
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: accent ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}
        >
          {label}
        </p>
        {icon && (
          <span style={{ color: accent ? "rgba(255,255,255,0.8)" : "var(--brand)" }}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end gap-1.5">
        <span
          className="text-5xl font-black leading-none tracking-tighter"
          style={{ color: accent ? "#fff" : "var(--text-primary)" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-lg font-bold mb-1"
            style={{ color: accent ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}
          >
            {unit}
          </span>
        )}
      </div>
      {subtext && (
        <p
          className="text-xs font-medium"
          style={{ color: accent ? "rgba(255,255,255,0.65)" : "var(--text-muted)" }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
