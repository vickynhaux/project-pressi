import { prisma } from "@/lib/prisma";
import { GrupoAlimento } from "@/generated/prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const producto = await prisma.producto.update({
      where: { id: parseInt(id) },
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
    return Response.json(producto);
  } catch {
    return Response.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.producto.delete({ where: { id: parseInt(id) } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
