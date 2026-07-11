"use client";

import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2, ChevronDown } from "lucide-react";

type GrupoAlimento = "proteina" | "carbohidrato" | "grasa" | "fruta" | "verdura" | "lacteo";

interface Producto {
  id: number;
  nombre: string;
  porcionBase: string;
  hidratosG: number;
  azucaresG: number;
  proteinaG: number;
  grasaG: number;
  calorias: number;
  grupo: GrupoAlimento;
}

type FormData = {
  nombre: string;
  porcionBase: string;
  hidratosG: string;
  azucaresG: string;
  proteinaG: string;
  grasaG: string;
  calorias: string;
  grupo: GrupoAlimento | "";
};

const EMPTY_FORM: FormData = {
  nombre: "",
  porcionBase: "",
  hidratosG: "",
  azucaresG: "",
  proteinaG: "",
  grasaG: "",
  calorias: "",
  grupo: "",
};

const GRUPOS: Record<GrupoAlimento, { label: string; color: string }> = {
  proteina: { label: "Proteína", color: "#FC4C02" },
  carbohidrato: { label: "Carbohidrato", color: "#F59E0B" },
  grasa: { label: "Grasa", color: "#8B5CF6" },
  fruta: { label: "Fruta", color: "#10B981" },
  verdura: { label: "Verdura", color: "#059669" },
  lacteo: { label: "Lácteo", color: "#3B82F6" },
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

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function fetchProductos() {
    try {
      const res = await fetch("/api/productos");
      if (res.ok) setProductos(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProductos(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Producto) {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre,
      porcionBase: p.porcionBase,
      hidratosG: String(p.hidratosG),
      azucaresG: String(p.azucaresG),
      proteinaG: String(p.proteinaG),
      grasaG: String(p.grasaG),
      calorias: String(p.calorias),
      grupo: p.grupo,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.grupo) return;
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/productos/${editingId}` : "/api/productos";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchProductos();
        closeForm();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/productos/${id}`, { method: "DELETE" });
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }

  // Group by grupo_alimento
  const grouped = productos.reduce<Record<string, Producto[]>>((acc, p) => {
    if (!acc[p.grupo]) acc[p.grupo] = [];
    acc[p.grupo].push(p);
    return acc;
  }, {});

  const inputStyle = (field: string): React.CSSProperties => ({
    ...INPUT_STYLE,
    borderColor: focusedField === field ? "var(--brand)" : "var(--border)",
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>
            Registro
          </p>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Catálogo de productos
          </h1>
          <p className="mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
            {productos.length > 0 ? `${productos.length} productos registrados` : "Gestiona tus alimentos"}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                {editingId ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button onClick={closeForm} style={{ color: "var(--text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Nombre + Porción */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Nombre
                  </label>
                  <input
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    onFocus={() => setFocusedField("nombre")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("nombre")}
                    placeholder="Ej. Pechuga de pollo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                    Porción base
                  </label>
                  <input
                    required
                    value={form.porcionBase}
                    onChange={(e) => setForm({ ...form, porcionBase: e.target.value })}
                    onFocus={() => setFocusedField("porcionBase")}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle("porcionBase")}
                    placeholder="Ej. 100g o 1 pieza"
                  />
                </div>
              </div>

              {/* Grupo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Grupo de alimento
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.grupo}
                    onChange={(e) => setForm({ ...form, grupo: e.target.value as GrupoAlimento })}
                    onFocus={() => setFocusedField("grupo")}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle("grupo"), appearance: "none" }}
                  >
                    <option value="">Seleccionar grupo...</option>
                    {Object.entries(GRUPOS).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: "hidratosG", label: "Hidratos g" },
                  { key: "azucaresG", label: "Azúcares g" },
                  { key: "proteinaG", label: "Proteína g" },
                  { key: "grasaG", label: "Grasa g" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.1"
                      value={form[key as keyof FormData]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      onFocus={() => setFocusedField(key)}
                      onBlur={() => setFocusedField(null)}
                      style={inputStyle(key)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>

              {/* Calorías */}
              <div className="w-1/2">
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Calorías (kcal)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.calorias}
                  onChange={(e) => setForm({ ...form, calorias: e.target.value })}
                  onFocus={() => setFocusedField("calorias")}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle("calorias")}
                  placeholder="0"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide"
                  style={{ background: "var(--brand)", color: "#fff", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wide"
                  style={{ background: "var(--bg-surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <p style={{ color: "var(--text-muted)" }}>Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div
          className="rounded-xl p-16 flex flex-col items-center justify-center text-center"
          style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
        >
          <p className="text-lg font-bold mb-1" style={{ color: "var(--text-muted)" }}>
            Tu catálogo está vacío
          </p>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Agrega tu primer alimento con el botón de arriba.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {(Object.keys(GRUPOS) as GrupoAlimento[])
            .filter((g) => grouped[g]?.length > 0)
            .map((grupo) => {
              const meta = GRUPOS[grupo];
              return (
                <div key={grupo}>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                      style={{ background: meta.color + "22", color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-xs font-medium" style={{ color: "var(--text-dim)" }}>
                      {grouped[grupo].length} productos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {grouped[grupo].map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl px-5 py-4 flex items-center justify-between"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                            {p.nombre}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {p.porcionBase}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="hidden sm:flex items-center gap-5">
                            {[
                              { label: "HC", value: p.hidratosG },
                              { label: "PRO", value: p.proteinaG },
                              { label: "GRS", value: p.grasaG },
                              { label: "KCAL", value: p.calorias, highlight: true },
                            ].map(({ label, value, highlight }) => (
                              <div key={label} className="text-center">
                                <p className="text-xs font-black" style={{ color: highlight ? "var(--brand)" : "var(--text-primary)" }}>
                                  {value}
                                </p>
                                <p className="text-xs" style={{ color: "var(--text-dim)" }}>{label}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-lg"
                              style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 rounded-lg"
                              style={{ background: "var(--bg-surface)", color: "#ef4444" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
