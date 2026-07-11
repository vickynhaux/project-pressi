import { prisma } from "@/lib/prisma";
import { GrupoAlimento } from "@/generated/prisma/client";

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: [{ grupo: "asc" }, { nombre: "asc" }],
    });
    return Response.json(productos);
  } catch {
    return Response.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const producto = await prisma.producto.create({
      data: {
        nombre: body.nombre,
        porcionBase: body.porcionBase,
        hidratosG: parseFloat(body.hidratosG),
        azucaresG: parseFloat(body.azucaresG),
        proteinaG: parseFloat(body.proteinaG),
        grasaG: parseFloat(body.grasaG),
        calorias: parseFloat(body.calorias),
        grupo: body.grupo as GrupoAlimento,
      },
    });
    return Response.json(producto, { status: 201 });
  } catch {
    return Response.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
