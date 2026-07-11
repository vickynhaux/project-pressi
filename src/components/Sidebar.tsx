"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalogo", label: "Catálogo", icon: BookOpen },
  { href: "/registro", label: "Registro diario", icon: ClipboardList },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}
      className="w-60 flex flex-col shrink-0 h-full"
    >
      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <span
          className="text-2xl font-black tracking-tighter uppercase"
          style={{ color: "var(--brand)" }}
        >
          PRESSI
        </span>
        <p className="text-xs font-medium mt-0.5 uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
          Rendimiento & Nutrición
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              style={{
                background: active ? "var(--brand)" : "transparent",
                color: active ? "#fff" : "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>v0.1.0 · alpha</p>
      </div>
    </aside>
  );
}
