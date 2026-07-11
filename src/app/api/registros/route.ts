import { prisma } from "@/lib/prisma";
import { CargaTrabajo, EnergiaNivel, TipoDia } from "@/generated/prisma/client";

// GET /api/registros?fecha=2026-07-11  — get or create the day's registro
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaStr = searchParams.get("fecha") ?? new Date().toISOString().split("T")[0];
    const fecha = new Date(fechaStr + "T12:00:00Z"); // noon UTC to avoid timezone off-by-one

    let registro = await prisma.registroDiario.findUnique({ where: { fecha } });
    if (!registro) {
      registro = await prisma.registroDiario.create({ data: { fecha } });
    }
    return Response.json(registro);
  } catch {
    return Response.json({ error: "Error al obtener registro" }, { status: 500 });
  }
}

// PATCH /api/registros  — update day-level fields (carga, energia, tipoDia)
export async function PATCH(request: Request) {
  try {
    const body: {
      fecha?: string;
      cargaTrabajo?: string;
      energiaNivel?: string;
      tipoDia?: string;
    } = await request.json();

    const fechaStr = body.fecha ?? new Date().toISOString().split("T")[0];
    const fecha = new Date(fechaStr + "T12:00:00Z");

    const registro = await prisma.registroDiario.upsert({
      where: { fecha },
      create: {
        fecha,
        cargaTrabajo: body.cargaTrabajo ? (body.cargaTrabajo as CargaTrabajo) : undefined,
        energiaNivel: body.energiaNivel ? (body.energiaNivel as EnergiaNivel) : undefined,
        tipoDia: body.tipoDia ? (body.tipoDia as TipoDia) : undefined,
      },
      update: {
        ...(body.cargaTrabajo && { cargaTrabajo: body.cargaTrabajo as CargaTrabajo }),
        ...(body.energiaNivel && { energiaNivel: body.energiaNivel as EnergiaNivel }),
        ...(body.tipoDia && { tipoDia: body.tipoDia as TipoDia }),
      },
    });
    return Response.json(registro);
  } catch {
    return Response.json({ error: "Error al actualizar registro" }, { status: 500 });
  }
}
