import { BookOpen, Plus } from "lucide-react";

export default function Catalogo() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--brand)" }}>
            Registro
          </p>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
            Catálogo de productos
          </h1>
          <p className="mt-1 font-medium" style={{ color: "var(--text-muted)" }}>
            Gestiona los alimentos disponibles para tu registro diario.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      {/* Empty state */}
      <div
        className="rounded-xl p-16 flex flex-col items-center justify-center text-center"
        style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
      >
        <BookOpen size={40} className="mb-4" style={{ color: "var(--text-dim)" }} />
        <p className="text-lg font-bold mb-1" style={{ color: "var(--text-muted)" }}>
          Tu catálogo está vacío
        </p>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Agrega alimentos con nombre, porción, macros y grupo de alimento.
        </p>
      </div>
    </div>
  );
}
