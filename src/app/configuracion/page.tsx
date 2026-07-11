import { Settings, Activity, Bell } from "lucide-react";

export default function Configuracion() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>
          Ajustes
        </p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Configuración
        </h1>
        <p className="mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
          Plan de nutrición, conexiones y preferencias.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Plan de nutrición */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings size={18} style={{ color: "var(--brand)" }} />
            <p className="font-black text-base uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>
              Plan de nutrición
            </p>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Define tus metas de porciones por grupo de alimento y por comida.
          </p>
          <button
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
            style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Configurar plan →
          </button>
        </div>

        {/* Strava */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity size={18} style={{ color: "var(--brand)" }} />
            <p className="font-black text-base uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>
              Conexión Strava
            </p>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Conecta tu cuenta de Strava para sincronizar actividades automáticamente.
          </p>
          <button
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            Conectar Strava →
          </button>
        </div>

        {/* Vitaminas */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Bell size={18} style={{ color: "var(--brand)" }} />
            <p className="font-black text-base uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>
              Recordatorio de vitaminas
            </p>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Configura una hora fija para tu recordatorio diario de vitaminas.
          </p>
          <button
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
            style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            Configurar hora →
          </button>
        </div>
      </div>
    </div>
  );
}
