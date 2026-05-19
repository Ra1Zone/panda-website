import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: "settings" } });

    if (!row) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(row.data));
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const row = await prisma.siteContent.upsert({
      where: { key: "settings" },
      update: { data: JSON.stringify(body) },
      create: { key: "settings", data: JSON.stringify(body) },
    });

    revalidatePath("/contact");
    return NextResponse.json(JSON.parse(row.data));
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
