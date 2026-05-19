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

    const rows = await prisma.service.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: "asc" },
    });

    const services = rows.map((row) => parseRow(row));

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /api/services error:", error);
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
        const row = await prisma.service.upsert({
          where: { id: item.id },
          update: {
            slug: item.slug,
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
          create: {
            id: item.id,
            slug: item.slug,
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
        });
        results.push(parseRow(row));
      }
      revalidatePath("/services");
      revalidatePath("/");
      return NextResponse.json(results);
    }

    // Single service creation
    const row = await prisma.service.create({
      data: {
        id: body.id,
        slug: body.slug,
        active: body.active ?? true,
        order: body.order ?? 0,
        data: JSON.stringify(body),
      },
    });

    revalidatePath("/services");
    revalidatePath("/");
    return NextResponse.json(parseRow(row), { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Bulk save (for reordering)
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "PUT expects an array of services" }, { status: 400 });
    }

    const results = [];
    for (const item of body) {
      const row = await prisma.service.upsert({
        where: { id: item.id },
        update: {
          slug: item.slug,
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
        create: {
          id: item.id,
          slug: item.slug,
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
      });
      results.push(parseRow(row));
    }

    revalidatePath("/services");
    revalidatePath("/");
    return NextResponse.json(results);
  } catch (error) {
    console.error("PUT /api/services error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
