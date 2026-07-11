import { prisma } from "@/lib/prisma";
import { Comida, GrupoAlimento } from "@/generated/prisma/client";

export async function GET() {
  try {
    const plan = await prisma.planNutricion.findMany();
    return Response.json(plan);
  } catch {
    return Response.json({ error: "Error al obtener plan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const entries: Array<{
      comida: string;
      grupoAlimento: string;
      porcionesMeta: number;
    }> = await request.json();

    const upserts = entries
      .filter((e) => e.porcionesMeta > 0)
      .map((e) =>
        prisma.planNutricion.upsert({
          where: {
            comida_grupoAlimento: {
              comida: e.comida as Comida,
              grupoAlimento: e.grupoAlimento as GrupoAlimento,
            },
          },
          update: { porcionesMeta: e.porcionesMeta },
          create: {
            comida: e.comida as Comida,
            grupoAlimento: e.grupoAlimento as GrupoAlimento,
            porcionesMeta: e.porcionesMeta,
          },
        })
      );

    // Delete entries set to 0
    const zeros = entries.filter((e) => e.porcionesMeta === 0);
    const deletes = zeros.map((e) =>
      prisma.planNutricion
        .delete({
          where: {
            comida_grupoAlimento: {
              comida: e.comida as Comida,
              grupoAlimento: e.grupoAlimento as GrupoAlimento,
            },
          },
        })
        .catch(() => null)
    );

    await Promise.all([...upserts, ...deletes]);
    const updated = await prisma.planNutricion.findMany();
    return Response.json(updated);
  } catch {
    return Response.json({ error: "Error al guardar plan" }, { status: 500 });
  }
}
