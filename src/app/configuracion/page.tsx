"use client";

import { useEffect, useState } from "react";
import { Save, Check, Bell, Activity } from "lucide-react";

type Comida = "desayuno" | "comida" | "cena" | "colacion";
type GrupoAlimento = "proteina" | "carbohidrato" | "grasa" | "fruta" | "verdura" | "lacteo";

const COMIDAS: { key: Comida; label: string }[] = [
  { key: "desayuno", label: "Desayuno" },
  { key: "comida", label: "Comida" },
  { key: "cena", label: "Cena" },
  { key: "colacion", label: "Colación" },
];

const GRUPOS: { key: GrupoAlimento; label: string; color: string }[] = [
  { key: "proteina", label: "Proteína", color: "#FC4C02" },
  { key: "carbohidrato", label: "Carb.", color: "#F59E0B" },
  { key: "grasa", label: "Grasa", color: "#8B5CF6" },
  { key: "fruta", label: "Fruta", color: "#10B981" },
  { key: "verdura", label: "Verdura", color: "#059669" },
  { key: "lacteo", label: "Lácteo", color: "#3B82F6" },
];

type PlanMatrix = Record<Comida, Record<GrupoAlimento, number>>;

function emptyMatrix(): PlanMatrix {
  const m = {} as PlanMatrix;
  for (const { key: c } of COMIDAS) {
    m[c] = {} as Record<GrupoAlimento, number>;
    for (const { key: g } of GRUPOS) m[c][g] = 0;
  }
  return m;
}

export default function Configuracion() {
  const [plan, setPlan] = useState<PlanMatrix>(emptyMatrix());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((entries: Array<{ comida: Comida; grupoAlimento: GrupoAlimento; porcionesMeta: number }>) => {
        const m = emptyMatrix();
        for (const e of entries) {
          if (m[e.comida]) m[e.comida][e.grupoAlimento] = e.porcionesMeta;
        }
        setPlan(m);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const entries = [];
      for (const { key: c } of COMIDAS) {
        for (const { key: g } of GRUPOS) {
          entries.push({ comida: c, grupoAlimento: g, porcionesMeta: plan[c][g] });
        }
      }
      await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function updateCell(comida: Comida, grupo: GrupoAlimento, value: string) {
    const n = parseInt(value) || 0;
    setPlan((prev) => ({
      ...prev,
      [comida]: { ...prev[comida], [grupo]: n },
    }));
  }

  const totalPorDia = COMIDAS.reduce(
    (sum, { key: c }) => sum + GRUPOS.reduce((s, { key: g }) => s + plan[c][g], 0),
    0
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
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

      {/* Plan de nutrición */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-black text-lg uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>
              Plan de nutrición
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Porciones meta por comida y grupo de alimento · Total diario:{" "}
              <span style={{ color: "var(--brand)", fontWeight: 700 }}>{totalPorDia} porciones</span>
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide"
            style={{
              background: saved ? "#10B981" : "var(--brand)",
              color: "#fff",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saved ? <Check size={15} /> : <Save size={15} />}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar plan"}
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Cargando plan...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3 pr-4 w-28">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
                      Comida
                    </span>
                  </th>
                  {GRUPOS.map(({ key, label, color }) => (
                    <th key={key} className="pb-3 px-2 text-center">
                      <span
                        className="text-xs font-black uppercase tracking-wide"
                        style={{ color }}
                      >
                        {label}
                      </span>
                    </th>
                  ))}
                  <th className="pb-3 pl-4 text-right">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
                      Total
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMIDAS.map(({ key: c, label }) => {
                  const rowTotal = GRUPOS.reduce((s, { key: g }) => s + plan[c][g], 0);
                  return (
                    <tr key={c} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="py-3 pr-4">
                        <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                          {label}
                        </span>
                      </td>
                      {GRUPOS.map(({ key: g, color }) => {
                        const cellKey = `${c}-${g}`;
                        const focused = focusedCell === cellKey;
                        return (
                          <td key={g} className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={plan[c][g] === 0 ? "" : plan[c][g]}
                              onChange={(e) => updateCell(c, g, e.target.value)}
                              onFocus={() => setFocusedCell(cellKey)}
                              onBlur={() => setFocusedCell(null)}
                              placeholder="0"
                              className="w-14 text-center rounded-lg py-1.5 text-sm font-bold"
                              style={{
                                background: focused ? "var(--bg-surface)" : "var(--bg-base)",
                                border: `1px solid ${focused ? color : "var(--border)"}`,
                                color: plan[c][g] > 0 ? color : "var(--text-dim)",
                                outline: "none",
                              }}
                            />
                          </td>
                        );
                      })}
                      <td className="py-3 pl-4 text-right">
                        <span
                          className="text-sm font-black"
                          style={{ color: rowTotal > 0 ? "var(--brand)" : "var(--text-dim)" }}
                        >
                          {rowTotal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--border)" }}>
                  <td className="pt-3 pr-4">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
                      Total
                    </span>
                  </td>
                  {GRUPOS.map(({ key: g, color }) => {
                    const colTotal = COMIDAS.reduce((s, { key: c }) => s + plan[c][g], 0);
                    return (
                      <td key={g} className="pt-3 px-2 text-center">
                        <span className="text-sm font-black" style={{ color: colTotal > 0 ? color : "var(--text-dim)" }}>
                          {colTotal}
                        </span>
                      </td>
                    );
                  })}
                  <td className="pt-3 pl-4 text-right">
                    <span className="text-base font-black" style={{ color: "var(--brand)" }}>
                      {totalPorDia}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Strava */}
      <div
        className="rounded-xl p-6 mb-4"
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
          Configura una hora fija para tu recordatorio diario.
        </p>
        <button
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          Configurar hora →
        </button>
      </div>
    </div>
  );
}
