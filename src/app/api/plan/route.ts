import { prisma } from "@/lib/prisma";
import { Comida, GrupoAlimento, TipoDia } from "@/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = (searchParams.get("tipo") ?? "sin_entreno") as TipoDia;
    const plan = await prisma.planNutricion.findMany({ where: { tipoDia: tipo } });
    return Response.json(plan);
  } catch {
    return Response.json({ error: "Error al obtener plan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: { tipo: TipoDia; entries: Array<{ comida: string; grupoAlimento: string; porcionesMeta: number }> } =
      await request.json();

    const tipo = body.tipo as TipoDia;
    const entries = body.entries;

    const upserts = entries
      .filter((e) => e.porcionesMeta > 0)
      .map((e) =>
        prisma.planNutricion.upsert({
          where: {
            tipoDia_comida_grupoAlimento: {
              tipoDia: tipo,
              comida: e.comida as Comida,
              grupoAlimento: e.grupoAlimento as GrupoAlimento,
            },
          },
          update: { porcionesMeta: e.porcionesMeta },
          create: {
            tipoDia: tipo,
            comida: e.comida as Comida,
            grupoAlimento: e.grupoAlimento as GrupoAlimento,
            porcionesMeta: e.porcionesMeta,
          },
        })
      );

    const deletes = entries
      .filter((e) => e.porcionesMeta === 0)
      .map((e) =>
        prisma.planNutricion
          .delete({
            where: {
              tipoDia_comida_grupoAlimento: {
                tipoDia: tipo,
                comida: e.comida as Comida,
                grupoAlimento: e.grupoAlimento as GrupoAlimento,
              },
            },
          })
          .catch(() => null)
      );

    await Promise.all([...upserts, ...deletes]);
    const updated = await prisma.planNutricion.findMany({ where: { tipoDia: tipo } });
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Error al guardar plan" }, { status: 500 });
  }
}
