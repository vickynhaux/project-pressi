import StatCard from "@/components/StatCard";
import { Activity, Flame, Zap, TrendingUp, Dumbbell, Apple } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>
          Jueves 10 Jul · 2026
        </p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Tu día de rendimiento
        </h1>
        <p className="mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
          Aquí verás el cruce de nutrición, actividad y bienestar.
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatCard
          label="Porciones de hoy"
          value="0"
          unit="/ 12"
          subtext="Sin registros aún — empieza tu primer registro diario"
          accent
          icon={<Apple size={20} />}
        />
        <StatCard
          label="Calorías estimadas"
          value="—"
          unit="kcal"
          subtext="Conecta Strava o registra una actividad"
          icon={<Flame size={20} />}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Actividad reciente"
          value="—"
          subtext="Sin actividad sincronizada"
          icon={<Activity size={20} />}
        />
        <StatCard
          label="Racha de días"
          value="0"
          unit="días"
          subtext="Empieza hoy tu primera racha"
          icon={<Zap size={20} />}
        />
        <StatCard
          label="Entrenos esta semana"
          value="0"
          unit="sesiones"
          subtext="Conecta Strava para sincronizar"
          icon={<Dumbbell size={20} />}
        />
      </div>

      {/* Recomendación del día — placeholder */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} style={{ color: "var(--brand)" }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
            Análisis del día
          </p>
        </div>
        <p className="text-base font-medium leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Una vez que registres comidas y conectes Strava, aquí aparecerá un análisis personalizado
          generado por IA con recomendaciones específicas para tu día.
        </p>
      </div>

      {/* Carga de trabajo + sentimiento — placeholder */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Carga de trabajo
          </p>
          <div className="flex gap-2">
            {["Ligera", "Normal", "Pesada"].map((level) => (
              <button
                key={level}
                className="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border)",
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            ¿Cómo te sientes?
          </p>
          <div className="flex gap-2">
            {[
              { label: "Bajo", emoji: "😓" },
              { label: "Normal", emoji: "😐" },
              { label: "Alto", emoji: "⚡" },
            ].map(({ label, emoji }) => (
              <button
                key={label}
                className="flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex flex-col items-center gap-1"
                style={{
                  background: "var(--bg-surface)",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border)",
                }}
              >
                <span className="text-lg">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
