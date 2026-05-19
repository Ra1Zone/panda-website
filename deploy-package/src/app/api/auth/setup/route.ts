import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if any admin user already exists
    const existingAdmin = await prisma.adminUser.findFirst();
    if (existingAdmin) {
      return NextResponse.json(
        { ok: false, error: "Admin user already exists" },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
      },
    });

    await createSession(user.id, user.email);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
