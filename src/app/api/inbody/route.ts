import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const registros = await prisma.inBodyRegistro.findMany({
      orderBy: { fecha: "desc" },
    });
    return Response.json(registros);
  } catch {
    return Response.json({ error: "Error al obtener registros InBody" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registro = await prisma.inBodyRegistro.create({
      data: {
        fecha: new Date(body.fecha + "T12:00:00Z"),
        pesoTotal: parseFloat(body.pesoTotal),
        masaMuscularPct: parseFloat(body.masaMuscularPct),
        grasaCorporalPct: parseFloat(body.grasaCorporalPct),
        metabolismoBasal: parseInt(body.metabolismoBasal),
      },
    });
    return Response.json(registro, { status: 201 });
  } catch {
    return Response.json({ error: "Error al guardar registro InBody" }, { status: 500 });
  }
}
