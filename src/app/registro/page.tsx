import { ClipboardList } from "lucide-react";

const MEALS = ["Desayuno", "Comida", "Cena", "Colación"];

export default function Registro() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>
          Hoy · Jueves 10 Jul
        </p>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
          Registro diario
        </h1>
        <p className="mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
          Marca tus porciones por comida y sigue tu meta del día.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MEALS.map((meal) => (
          <div
            key={meal}
            className="rounded-xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-lg uppercase tracking-tight" style={{ color: "var(--text-primary)" }}>
                {meal}
              </p>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide"
                style={{ background: "var(--bg-surface)", color: "var(--brand)", border: "1px solid var(--brand)" }}
              >
                + Agregar
              </button>
            </div>
            <div
              className="rounded-lg p-4 flex items-center justify-center"
              style={{ background: "var(--bg-surface)", minHeight: 80 }}
            >
              <div className="flex items-center gap-2" style={{ color: "var(--text-dim)" }}>
                <ClipboardList size={16} />
                <p className="text-xs font-medium">Sin alimentos registrados</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
