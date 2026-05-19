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

    const rows = await prisma.brand.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { order: "asc" },
    });

    const items = rows.map((row) => parseRow(row));

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/brands error:", error);
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
        const row = await prisma.brand.upsert({
          where: { id: item.id },
          update: {
            name: item.name ?? "",
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
          create: {
            id: item.id,
            name: item.name ?? "",
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
        });
        results.push(parseRow(row));
      }
      revalidatePath("/");
      revalidatePath("/about");
      return NextResponse.json(results);
    }

    // Single item creation
    const row = await prisma.brand.create({
      data: {
        id: body.id,
        name: body.name ?? "",
        active: body.active ?? true,
        order: body.order ?? 0,
        data: JSON.stringify(body),
      },
    });

    revalidatePath("/");
    revalidatePath("/about");
    return NextResponse.json(parseRow(row), { status: 201 });
  } catch (error) {
    console.error("POST /api/brands error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "PUT expects an array of brands" }, { status: 400 });
    }

    const results = [];
    for (const item of body) {
      const row = await prisma.brand.upsert({
        where: { id: item.id },
        update: {
          name: item.name ?? "",
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
        create: {
          id: item.id,
          name: item.name ?? "",
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
      });
      results.push(parseRow(row));
    }

    revalidatePath("/");
    revalidatePath("/about");
    return NextResponse.json(results);
  } catch (error) {
    console.error("PUT /api/brands error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
