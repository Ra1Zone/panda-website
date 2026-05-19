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
    const category = searchParams.get("category");
    const featuredOnly = searchParams.get("featured") === "true";

    const where: Record<string, unknown> = {};
    if (activeOnly) where.active = true;
    if (category) where.category = category;
    if (featuredOnly) where.featured = true;

    const rows = await prisma.portfolioItem.findMany({
      where,
      orderBy: { order: "asc" },
    });

    const items = rows.map((row) => parseRow(row));

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
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
        const row = await prisma.portfolioItem.upsert({
          where: { id: item.id },
          update: {
            slug: item.slug,
            category: item.category ?? "branding",
            featured: item.featured ?? false,
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
          create: {
            id: item.id,
            slug: item.slug,
            category: item.category ?? "branding",
            featured: item.featured ?? false,
            active: item.active ?? true,
            order: item.order ?? 0,
            data: JSON.stringify(item),
          },
        });
        results.push(parseRow(row));
      }
      revalidatePath("/portfolio");
      revalidatePath("/");
      return NextResponse.json(results);
    }

    // Single item creation
    const row = await prisma.portfolioItem.create({
      data: {
        id: body.id,
        slug: body.slug,
        category: body.category ?? "branding",
        featured: body.featured ?? false,
        active: body.active ?? true,
        order: body.order ?? 0,
        data: JSON.stringify(body),
      },
    });

    revalidatePath("/portfolio");
    revalidatePath("/");
    return NextResponse.json(parseRow(row), { status: 201 });
  } catch (error) {
    console.error("POST /api/portfolio error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "PUT expects an array of portfolio items" }, { status: 400 });
    }

    const results = [];
    for (const item of body) {
      const row = await prisma.portfolioItem.upsert({
        where: { id: item.id },
        update: {
          slug: item.slug,
          category: item.category ?? "branding",
          featured: item.featured ?? false,
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
        create: {
          id: item.id,
          slug: item.slug,
          category: item.category ?? "branding",
          featured: item.featured ?? false,
          active: item.active ?? true,
          order: item.order ?? 0,
          data: JSON.stringify(item),
        },
      });
      results.push(parseRow(row));
    }

    revalidatePath("/portfolio");
    revalidatePath("/");
    return NextResponse.json(results);
  } catch (error) {
    console.error("PUT /api/portfolio error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
