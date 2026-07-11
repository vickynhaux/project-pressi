import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface RecomendacionRequest {
  tipoDia: "con_entreno" | "sin_entreno";
  cargaTrabajo?: string;
  energiaNivel?: string;
  plan: Array<{ comida: string; grupoAlimento: string; porcionesMeta: number }>;
  registrado: Array<{ comida: string; productoNombre: string; grupo: string; porciones: number }>;
  actividad?: { tipo: string; duracionMin: number; caloriasEstimadas: number } | null;
  catalogo: Array<{ nombre: string; grupo: string; porcionBase: string }>;
}

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json({ recomendacion: null, error: "ANTHROPIC_API_KEY no configurada" }, { status: 503 });
    }

    const data: RecomendacionRequest = await request.json();

    const planResumen = data.plan.reduce<Record<string, Record<string, number>>>((acc, e) => {
      if (!acc[e.comida]) acc[e.comida] = {};
      acc[e.comida][e.grupoAlimento] = e.porcionesMeta;
      return acc;
    }, {});

    const registradoResumen = data.registrado.reduce<Record<string, string[]>>((acc, e) => {
      if (!acc[e.comida]) acc[e.comida] = [];
      acc[e.comida].push(`${e.porciones} porción(es) de ${e.productoNombre} (${e.grupo})`);
      return acc;
    }, {});

    const catalogoPorGrupo = data.catalogo.reduce<Record<string, string[]>>((acc, p) => {
      if (!acc[p.grupo]) acc[p.grupo] = [];
      acc[p.grupo].push(`${p.nombre} (${p.porcionBase})`);
      return acc;
    }, {});

    const prompt = `Eres un asistente de nutrición y rendimiento deportivo. Analiza el día de la atleta y da una recomendación concreta y accionable.

CONTEXTO DEL DÍA:
- Tipo de día: ${data.tipoDia === "con_entreno" ? "CON ENTRENO" : "SIN ENTRENO"}
- Carga de trabajo: ${data.cargaTrabajo ?? "no registrada"}
- Energía percibida: ${data.energiaNivel ?? "no registrada"}
${data.actividad ? `- Actividad Strava: ${data.actividad.tipo}, ${data.actividad.duracionMin} min, ~${data.actividad.caloriasEstimadas} kcal` : "- Sin actividad Strava registrada hoy"}

PLAN DEL DÍA (porciones meta por comida):
${Object.entries(planResumen).map(([comida, grupos]) =>
  `${comida}: ${Object.entries(grupos).map(([g, p]) => `${p} ${g}`).join(", ")}`
).join("\n")}

LO REGISTRADO HASTA AHORA:
${Object.keys(registradoResumen).length === 0
  ? "Nada registrado aún"
  : Object.entries(registradoResumen).map(([comida, items]) => `${comida}: ${items.join("; ")}`).join("\n")}

PRODUCTOS DISPONIBLES EN SU CATÁLOGO:
${Object.entries(catalogoPorGrupo).map(([grupo, productos]) =>
  `${grupo}: ${productos.join(", ")}`
).join("\n")}

Devuelve ÚNICAMENTE una recomendación breve en español (máximo 3 oraciones, tono directo). Menciona productos específicos del catálogo cuando sea relevante. No uses listas ni viñetas. Sé concreto: di exactamente qué comer, no solo el grupo de alimento.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [{ role: "user", content: prompt }],
    });

    const recomendacion = message.content[0].type === "text" ? message.content[0].text : null;
    return Response.json({ recomendacion });
  } catch (err) {
    console.error("Error en /api/recomendacion:", err);
    return Response.json({ error: "Error al generar recomendación" }, { status: 500 });
  }
}
