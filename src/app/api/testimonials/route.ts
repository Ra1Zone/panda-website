import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function parseRow<T>(row: { data: string; id: string; [key: string]: unknown }): T {
  return { ...JSON.parse(row.data), id: row.id } as T;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const rows = await prisma.testimonial.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: "asc" },
    });

    const items = rows.map((row) => parseRow(row));

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // If body is an array, treat as bulk save (for reordering)
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        const row = await prisma.testimonial.upsert({
          where: { id: item.id },
          update: {
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
          create: {
            id: item.id,
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
        });
        results.push(parseRow(row));
      }
      revalidatePath("/");
      return NextResponse.json(results);
    }

    // Single item creation
    const row = await prisma.testimonial.create({
      data: {
        id: body.id,
        active: body.active ?? true,
        order: body.order ?? 0,
        data: JSON.stringify(body),
      },
    });

    revalidatePath("/");
    return NextResponse.json(parseRow(row), { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "PUT expects an array of testimonials" }, { status: 400 });
    }

    const results = [];
    for (const item of body) {
      const row = await prisma.testimonial.upsert({
        where: { id: item.id },
        update: {
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
        create: {
          id: item.id,
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
      });
      results.push(parseRow(row));
    }

    revalidatePath("/");
    return NextResponse.json(results);
  } catch (error) {
    console.error("PUT /api/testimonials error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
