import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function parseRow<T>(row: { data: string; id: string; [key: string]: unknown }): T {
  return { ...JSON.parse(row.data), id: row.id } as T;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const row = await prisma.testimonial.findUnique({ where: { id } });

    if (!row) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(parseRow(row));
  } catch (error) {
    console.error("GET /api/testimonials/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const row = await prisma.testimonial.update({
      where: { id },
      data: {
        active: body.active ?? true,
        order: body.order ?? 0,
        data: JSON.stringify({ ...body, id }),
      },
    });

    return NextResponse.json(parseRow(row));
  } catch (error) {
    console.error("PUT /api/testimonials/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.testimonial.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/testimonials/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
