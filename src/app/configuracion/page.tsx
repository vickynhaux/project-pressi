"use client";

import { useEffect, useState } from "react";
import { Save, Check, Bell, Activity, Plus, X, Dumbbell } from "lucide-react";

type Comida = "desayuno" | "comida" | "cena" | "colacion";
type GrupoAlimento = "proteina" | "carbohidrato" | "grasa" | "fruta" | "verdura" | "lacteo";
type TipoDia = "con_entreno" | "sin_entreno";

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

interface InBodyRegistro {
  id: number;
  fecha: string;
  pesoTotal: number;
  masaMuscularPct: number;
  grasaCorporalPct: number;
  metabolismoBasal: number;
}

type InBodyForm = {
  fecha: string;
  pesoTotal: string;
  masaMuscularPct: string;
  grasaCorporalPct: string;
  metabolismoBasal: string;
};

const INPUT_STYLE: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 14,
  width: "100%",
  outline: "none",
};

// ──────────────────────────────────────────
// PlanGrid — reusable grid for one plan type
// ──────────────────────────────────────────
function PlanGrid({ tipoDia }: { tipoDia: TipoDia }) {
  const [plan, setPlan] = useState<PlanMatrix>(emptyMatrix());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/plan?tipo=${tipoDia}`)
      .then((r) => r.json())
      .then((entries: Array<{ comida: Comida; grupoAlimento: GrupoAlimento; porcionesMeta: number }>) => {
        const m = emptyMatrix();
        for (const e of entries) {
          if (m[e.comida]) m[e.comida][e.grupoAlimento] = e.porcionesMeta;
        }
        setPlan(m);
      })
      .finally(() => setLoading(false));
  }, [tipoDia]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const entries = [];
    for (const { key: c } of COMIDAS) {
      for (const { key: g } of GRUPOS) {
        entries.push({ comida: c, grupoAlimento: g, porcionesMeta: plan[c][g] });
      }
    }
    await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: tipoDia, entries }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const totalDia = COMIDAS.reduce(
    (s, { key: c }) => s + GRUPOS.reduce((ss, { key: g }) => ss + plan[c][g], 0),
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Total diario:{" "}
          <span style={{ color: "var(--brand)", fontWeight: 700 }}>{totalDia} porciones</span>
        </p>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
          style={{ background: saved ? "#10B981" : "var(--brand)", color: "#fff", opacity: saving ? 0.7 : 1 }}
        >
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-3 pr-4 w-28">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Comida</span>
                </th>
                {GRUPOS.map(({ key, label, color }) => (
                  <th key={key} className="pb-3 px-2 text-center">
                    <span className="text-xs font-black uppercase" style={{ color }}>{label}</span>
                  </th>
                ))}
                <th className="pb-3 pl-4 text-right">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Total</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMIDAS.map(({ key: c, label }) => {
                const rowTotal = GRUPOS.reduce((s, { key: g }) => s + plan[c][g], 0);
                return (
                  <tr key={c} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{label}</span>
                    </td>
                    {GRUPOS.map(({ key: g, color }) => {
                      const cellKey = `${tipoDia}-${c}-${g}`;
                      const focused = focusedCell === cellKey;
                      return (
                        <td key={g} className="py-3 px-2 text-center">
                          <input
                            type="number" min="0" max="20"
                            value={plan[c][g] === 0 ? "" : plan[c][g]}
                            onChange={(e) => {
                              const n = parseInt(e.target.value) || 0;
                              setPlan((prev) => ({ ...prev, [c]: { ...prev[c], [g]: n } }));
                            }}
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
                      <span className="text-sm font-black" style={{ color: rowTotal > 0 ? "var(--brand)" : "var(--text-dim)" }}>
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
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Total</span>
                </td>
                {GRUPOS.map(({ key: g, color }) => {
                  const col = COMIDAS.reduce((s, { key: c }) => s + plan[c][g], 0);
                  return (
                    <td key={g} className="pt-3 px-2 text-center">
                      <span className="text-sm font-black" style={{ color: col > 0 ? color : "var(--text-dim)" }}>{col}</span>
                    </td>
                  );
                })}
                <td className="pt-3 pl-4 text-right">
                  <span className="text-base font-black" style={{ color: "var(--brand)" }}>{totalDia}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Main page
// ──────────────────────────────────────────
export default function Configuracion() {
  const [planTab, setPlanTab] = useState<TipoDia>("sin_entreno");

  // InBody state
  const [inbodyRegistros, setInbodyRegistros] = useState<InBodyRegistro[]>([]);
  const [showInbodyForm, setShowInbodyForm] = useState(false);
  const [inbodyForm, setInbodyForm] = useState<InBodyForm>({
    fecha: new Date().toISOString().split("T")[0],
    pesoTotal: "",
    masaMuscularPct: "",
    grasaCorporalPct: "",
    metabolismoBasal: "",
  });
  const [savingInbody, setSavingInbody] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/inbody")
      .then((r) => r.json())
      .then(setInbodyRegistros)
      .catch(() => null);
  }, []);

  async function handleInbodySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingInbody(true);
    try {
      const res = await fetch("/api/inbody", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inbodyForm),
      });
      if (res.ok) {
        const nuevo = await res.json();
        setInbodyRegistros((prev) => [nuevo, ...prev]);
        setShowInbodyForm(false);
        setInbodyForm({ fecha: new Date().toISOString().split("T")[0], pesoTotal: "", masaMuscularPct: "", grasaCorporalPct: "", metabolismoBasal: "" });
      }
    } finally {
      setSavingInbody(false);
    }
  }

  const inputStyle = (f: string): React.CSSProperties => ({
    ...INPUT_STYLE,
    borderColor: focusedField === f ? "var(--brand)" : "var(--border)",
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>Ajustes</p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>Configuración</h1>
        <p className="mt-1 font-medium" style={{ color: "var(--text-muted)" }}>Plan de nutrición, InBody, conexiones y preferencias.</p>
      </div>

      {/* Plan de nutrición — dos tabs */}
      <div className="rounded-xl p-6 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="font-black text-lg uppercase tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
          Plan de nutrición
        </p>
        <div className="flex gap-2 mb-5">
          {([
            { key: "sin_entreno" as TipoDia, label: "🧘 Día sin entreno" },
            { key: "con_entreno" as TipoDia, label: "⚡ Día con entreno" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPlanTab(key)}
              className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest"
              style={{
                background: planTab === key ? "var(--brand)" : "var(--bg-surface)",
                color: planTab === key ? "#fff" : "var(--text-muted)",
                border: `1px solid ${planTab === key ? "var(--brand)" : "var(--border)"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <PlanGrid key={planTab} tipoDia={planTab} />
      </div>

      {/* InBody */}
      <div className="rounded-xl p-6 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Dumbbell size={18} style={{ color: "var(--brand)" }} />
            <p className="font-black text-base uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>InBody</p>
          </div>
          <button
            onClick={() => setShowInbodyForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            {showInbodyForm ? <X size={13} /> : <Plus size={13} />}
            {showInbodyForm ? "Cancelar" : "Nuevo escaneo"}
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Registra manualmente los resultados de tu escaneo InBody. Se usarán para mejorar las recomendaciones.
        </p>

        {showInbodyForm && (
          <form onSubmit={handleInbodySubmit} className="mb-5 p-4 rounded-xl flex flex-col gap-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>Fecha del escaneo</label>
                <input type="date" required value={inbodyForm.fecha}
                  onChange={(e) => setInbodyForm({ ...inbodyForm, fecha: e.target.value })}
                  onFocus={() => setFocusedField("fecha")} onBlur={() => setFocusedField(null)}
                  style={inputStyle("fecha")} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>Peso total (kg)</label>
                <input type="number" step="0.1" min="0" required value={inbodyForm.pesoTotal}
                  onChange={(e) => setInbodyForm({ ...inbodyForm, pesoTotal: e.target.value })}
                  onFocus={() => setFocusedField("peso")} onBlur={() => setFocusedField(null)}
                  style={inputStyle("peso")} placeholder="65.0" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>Masa muscular (%)</label>
                <input type="number" step="0.1" min="0" max="100" required value={inbodyForm.masaMuscularPct}
                  onChange={(e) => setInbodyForm({ ...inbodyForm, masaMuscularPct: e.target.value })}
                  onFocus={() => setFocusedField("musculo")} onBlur={() => setFocusedField(null)}
                  style={inputStyle("musculo")} placeholder="35.0" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>Grasa corporal (%)</label>
                <input type="number" step="0.1" min="0" max="100" required value={inbodyForm.grasaCorporalPct}
                  onChange={(e) => setInbodyForm({ ...inbodyForm, grasaCorporalPct: e.target.value })}
                  onFocus={() => setFocusedField("grasa")} onBlur={() => setFocusedField(null)}
                  style={inputStyle("grasa")} placeholder="22.0" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>Metabolismo basal (kcal)</label>
              <input type="number" min="0" required value={inbodyForm.metabolismoBasal}
                onChange={(e) => setInbodyForm({ ...inbodyForm, metabolismoBasal: e.target.value })}
                onFocus={() => setFocusedField("metabolismo")} onBlur={() => setFocusedField(null)}
                style={{ ...inputStyle("metabolismo"), width: "50%" }} placeholder="1450" />
            </div>
            <button type="submit" disabled={savingInbody}
              className="px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide w-fit"
              style={{ background: "var(--brand)", color: "#fff", opacity: savingInbody ? 0.7 : 1 }}>
              {savingInbody ? "Guardando..." : "Guardar escaneo"}
            </button>
          </form>
        )}

        {inbodyRegistros.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>No hay escaneos registrados aún.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {inbodyRegistros.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: "var(--bg-surface)" }}>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {new Date(r.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <div className="flex gap-5">
                  {[
                    { label: "Peso", value: `${r.pesoTotal} kg` },
                    { label: "Músculo", value: `${r.masaMuscularPct}%`, color: "#FC4C02" },
                    { label: "Grasa", value: `${r.grasaCorporalPct}%`, color: "#8B5CF6" },
                    { label: "BMR", value: `${r.metabolismoBasal} kcal` },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs font-black" style={{ color: color ?? "var(--text-primary)" }}>{value}</p>
                      <p className="text-xs" style={{ color: "var(--text-dim)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strava */}
      <div className="rounded-xl p-6 mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-2">
          <Activity size={18} style={{ color: "var(--brand)" }} />
          <p className="font-black text-base uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>Conexión Strava</p>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Conecta tu cuenta de Strava para sincronizar actividades automáticamente.
        </p>
        <button className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
          style={{ background: "var(--brand)", color: "#fff" }}>
          Conectar Strava →
        </button>
      </div>

      {/* Vitaminas */}
      <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 mb-2">
          <Bell size={18} style={{ color: "var(--brand)" }} />
          <p className="font-black text-base uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>Recordatorio de vitaminas</p>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Configura una hora fija para tu recordatorio diario.
        </p>
        <button className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide"
          style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          Configurar hora →
        </button>
      </div>
    </div>
  );
}
