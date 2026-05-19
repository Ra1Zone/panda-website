import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: "about" } });

    if (!row) {
      return NextResponse.json({ error: "About content not found" }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(row.data));
  } catch (error) {
    console.error("GET /api/about error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const row = await prisma.siteContent.upsert({
      where: { key: "about" },
      update: { data: JSON.stringify(body) },
      create: { key: "about", data: JSON.stringify(body) },
    });

    revalidatePath("/about");
    return NextResponse.json(JSON.parse(row.data));
  } catch (error) {
    console.error("PUT /api/about error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
