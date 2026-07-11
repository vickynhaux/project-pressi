"use client";

import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/StatCard";
import {
  Activity, Flame, Zap, TrendingUp, Dumbbell, Apple,
  Timer, ChevronRight, Bike, PersonStanding,
} from "lucide-react";

type TipoDia = "con_entreno" | "sin_entreno";
type CargaTrabajo = "ligera" | "normal" | "pesada";
type EnergiaNivel = "baja" | "media" | "alta";

interface RegistroDiario {
  id: number;
  tipoDia: TipoDia | null;
  cargaTrabajo: CargaTrabajo | null;
  energiaNivel: EnergiaNivel | null;
}

interface PlanEntry {
  comida: string;
  grupoAlimento: string;
  porcionesMeta: number;
}

// Placeholder Strava activities until OAuth is connected
const STRAVA_ACTIVIDADES_PLACEHOLDER = [
  { tipo: "Corrida", duracion: "45 min", fecha: "Ayer", icono: "run" },
  { tipo: "Fuerza", duracion: "60 min", fecha: "Hace 2 días", icono: "strength" },
  { tipo: "Bici", duracion: "90 min", fecha: "Hace 3 días", icono: "bike" },
];

function ActividadIcon({ tipo }: { tipo: string }) {
  if (tipo === "Bici") return <Bike size={14} />;
  if (tipo === "Fuerza") return <Dumbbell size={14} />;
  return <PersonStanding size={14} />;
}

export default function Dashboard() {
  const [tipoDia, setTipoDia] = useState<TipoDia>("sin_entreno");
  const [cargaTrabajo, setCargaTrabajo] = useState<CargaTrabajo | null>(null);
  const [energiaNivel, setEnergiaNivel] = useState<EnergiaNivel | null>(null);
  const [totalMeta, setTotalMeta] = useState(0);
  const [recomendacion, setRecomendacion] = useState<string | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [registroId, setRegistroId] = useState<number | null>(null);

  const hoy = new Date().toISOString().split("T")[0];

  // Load today's registro and plan on mount / tipoDia change
  useEffect(() => {
    fetch(`/api/registros?fecha=${hoy}`)
      .then((r) => r.json())
      .then((reg: RegistroDiario) => {
        setRegistroId(reg.id);
        if (reg.tipoDia) setTipoDia(reg.tipoDia);
        if (reg.cargaTrabajo) setCargaTrabajo(reg.cargaTrabajo);
        if (reg.energiaNivel) setEnergiaNivel(reg.energiaNivel);
      })
      .catch(() => null);
  }, [hoy]);

  useEffect(() => {
    fetch(`/api/plan?tipo=${tipoDia}`)
      .then((r) => r.json())
      .then((plan: PlanEntry[]) => {
        const total = plan.reduce((s, e) => s + e.porcionesMeta, 0);
        setTotalMeta(total);
      })
      .catch(() => null);
  }, [tipoDia]);

  async function patch(body: object) {
    await fetch("/api/registros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fecha: hoy, ...body }),
    });
  }

  async function handleTipoDia(tipo: TipoDia) {
    setTipoDia(tipo);
    await patch({ tipoDia: tipo });
  }

  async function handleCarga(c: CargaTrabajo) {
    const next = cargaTrabajo === c ? null : c;
    setCargaTrabajo(next);
    await patch({ cargaTrabajo: next ?? "" });
  }

  async function handleEnergia(e: EnergiaNivel) {
    const next = energiaNivel === e ? null : e;
    setEnergiaNivel(next);
    await patch({ energiaNivel: next ?? "" });
  }

  const fetchRecomendacion = useCallback(async () => {
    setLoadingRec(true);
    try {
      const [planRes, catalogoRes] = await Promise.all([
        fetch(`/api/plan?tipo=${tipoDia}`).then((r) => r.json()),
        fetch("/api/productos").then((r) => r.json()),
      ]);
      await fetch("/api/recomendacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoDia,
          cargaTrabajo,
          energiaNivel,
          plan: planRes,
          registrado: [],
          actividad: null,
          catalogo: catalogoRes,
        }),
      })
        .then((r) => r.json())
        .then((d) => setRecomendacion(d.recomendacion ?? null));
    } finally {
      setLoadingRec(false);
    }
  }, [tipoDia, cargaTrabajo, energiaNivel]);

  const fechaLabel = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-1 capitalize" style={{ color: "var(--brand)" }}>
          {fechaLabel}
        </p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Tu día de rendimiento
        </h1>
      </div>

      {/* Tipo de día toggle */}
      <div className="flex gap-2 mb-6">
        {(["con_entreno", "sin_entreno"] as TipoDia[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTipoDia(t)}
            className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest"
            style={{
              background: tipoDia === t ? "var(--brand)" : "var(--bg-card)",
              color: tipoDia === t ? "#fff" : "var(--text-muted)",
              border: `1px solid ${tipoDia === t ? "var(--brand)" : "var(--border)"}`,
            }}
          >
            {t === "con_entreno" ? "⚡ Día con entreno" : "🧘 Día sin entreno"}
          </button>
        ))}
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatCard
          label="Porciones de hoy"
          value="0"
          unit={totalMeta > 0 ? `/ ${totalMeta}` : "/ —"}
          subtext={totalMeta > 0 ? "Sin registros aún — ve al Registro diario" : "Define tu plan en Configuración"}
          accent
          icon={<Apple size={20} />}
        />
        <StatCard
          label="Actividad del día"
          value="—"
          subtext="Strava no conectado aún"
          icon={<Activity size={20} />}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Calorías quemadas" value="—" unit="kcal" subtext="Conecta Strava" icon={<Flame size={20} />} />
        <StatCard label="Racha de días" value="0" unit="días" subtext="Empieza hoy" icon={<Zap size={20} />} />
        <StatCard label="Entrenos esta semana" value="0" unit="sesiones" subtext="Conecta Strava" icon={<Dumbbell size={20} />} />
      </div>

      {/* Actividades recientes Strava */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: "var(--brand)" }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
              Actividades recientes
            </p>
          </div>
          <button
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide"
            style={{ color: "var(--text-dim)" }}
          >
            Ver más <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {STRAVA_ACTIVIDADES_PLACEHOLDER.map((act, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: "var(--bg-surface)" }}
            >
              <div className="flex items-center gap-3">
                <span style={{ color: "var(--brand)" }}>
                  {act.tipo === "Bici" ? <Bike size={16} /> : act.tipo === "Fuerza" ? <Dumbbell size={16} /> : <PersonStanding size={16} />}
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{act.tipo}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{act.fecha}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Timer size={12} />
                <span className="text-xs font-bold">{act.duracion}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 text-center" style={{ color: "var(--text-dim)" }}>
          Placeholder — conecta Strava en Configuración para ver actividades reales
        </p>
      </div>

      {/* Análisis IA */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "var(--brand)" }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--brand)" }}>
              Análisis del día
            </p>
          </div>
          <button
            onClick={fetchRecomendacion}
            disabled={loadingRec}
            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide"
            style={{
              background: "var(--bg-surface)",
              color: "var(--brand)",
              border: "1px solid var(--brand)",
              opacity: loadingRec ? 0.6 : 1,
            }}
          >
            {loadingRec ? "Analizando..." : "Generar análisis"}
          </button>
        </div>
        <p className="text-base font-medium leading-relaxed" style={{ color: recomendacion ? "var(--text-primary)" : "var(--text-muted)" }}>
          {recomendacion ??
            'Pulsa "Generar análisis" para recibir una recomendación personalizada basada en tu plan, lo registrado y tu actividad del día.'}
        </p>
      </div>

      {/* Carga de trabajo + energía */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Carga de trabajo
          </p>
          <div className="flex gap-2">
            {(["ligera", "normal", "pesada"] as CargaTrabajo[]).map((c) => (
              <button
                key={c}
                onClick={() => handleCarga(c)}
                className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wide capitalize"
                style={{
                  background: cargaTrabajo === c ? "var(--brand)" : "var(--bg-surface)",
                  color: cargaTrabajo === c ? "#fff" : "var(--text-dim)",
                  border: `1px solid ${cargaTrabajo === c ? "var(--brand)" : "var(--border)"}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            ¿Cómo te sientes?
          </p>
          <div className="flex gap-2">
            {([
              { key: "baja", emoji: "😓", label: "Bajo" },
              { key: "media", emoji: "😐", label: "Normal" },
              { key: "alta", emoji: "⚡", label: "Alto" },
            ] as { key: EnergiaNivel; emoji: string; label: string }[]).map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => handleEnergia(key)}
                className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wide flex flex-col items-center gap-1"
                style={{
                  background: energiaNivel === key ? "var(--brand)" : "var(--bg-surface)",
                  color: energiaNivel === key ? "#fff" : "var(--text-dim)",
                  border: `1px solid ${energiaNivel === key ? "var(--brand)" : "var(--border)"}`,
                }}
              >
                <span className="text-lg">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Predicción proactiva placeholder */}
      <div
        className="rounded-xl p-5 mt-4"
        style={{ background: "var(--bg-base)", border: "1px dashed var(--border)" }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-dim)" }}>
          Alertas proactivas
        </p>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Disponible después de acumular historial de al menos 2 semanas de registros y actividad Strava.
        </p>
      </div>
    </div>
  );
}
