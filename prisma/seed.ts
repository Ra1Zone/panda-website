import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  defaultHomeContent,
  defaultAboutContent,
  defaultSettings,
  defaultServices,
  defaultPortfolio,
  defaultTestimonials,
  defaultBrands,
} from "../src/store/defaults";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Site Content (singletons) ---
  await prisma.siteContent.upsert({
    where: { key: "home" },
    update: { data: JSON.stringify(defaultHomeContent) },
    create: { key: "home", data: JSON.stringify(defaultHomeContent) },
  });

  await prisma.siteContent.upsert({
    where: { key: "about" },
    update: { data: JSON.stringify(defaultAboutContent) },
    create: { key: "about", data: JSON.stringify(defaultAboutContent) },
  });

  await prisma.siteContent.upsert({
    where: { key: "settings" },
    update: { data: JSON.stringify(defaultSettings) },
    create: { key: "settings", data: JSON.stringify(defaultSettings) },
  });

  console.log("  Site content seeded.");

  // --- Services ---
  for (const svc of defaultServices) {
    await prisma.service.upsert({
      where: { id: svc.id },
      update: {
        slug: svc.slug,
        active: svc.active,
        order: svc.order,
        data: JSON.stringify(svc),
      },
      create: {
        id: svc.id,
        slug: svc.slug,
        active: svc.active,
        order: svc.order,
        data: JSON.stringify(svc),
      },
    });
  }
  console.log(`  ${defaultServices.length} services seeded.`);

  // --- Portfolio ---
  for (const item of defaultPortfolio) {
    await prisma.portfolioItem.upsert({
      where: { id: item.id },
      update: {
        slug: item.slug,
        category: item.category,
        featured: item.featured,
        active: item.active,
        order: item.order,
        data: JSON.stringify(item),
      },
      create: {
        id: item.id,
        slug: item.slug,
        category: item.category,
        featured: item.featured,
        active: item.active,
        order: item.order,
        data: JSON.stringify(item),
      },
    });
  }
  console.log(`  ${defaultPortfolio.length} portfolio items seeded.`);

  // --- Testimonials ---
  for (const t of defaultTestimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {
        active: t.active,
        order: t.order,
        data: JSON.stringify(t),
      },
      create: {
        id: t.id,
        active: t.active,
        order: t.order,
        data: JSON.stringify(t),
      },
    });
  }
  console.log(`  ${defaultTestimonials.length} testimonials seeded.`);

  // --- Brands ---
  for (const b of defaultBrands) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: {
        name: b.name,
        active: b.active,
        order: b.order,
        data: JSON.stringify(b),
      },
      create: {
        id: b.id,
        name: b.name,
        active: b.active,
        order: b.order,
        data: JSON.stringify(b),
      },
    });
  }
  console.log(`  ${defaultBrands.length} brands seeded.`);

  // --- Admin User ---
  const adminEmail = "admin@pandamarketing.ps";
  const adminPassword = "pandaAdmin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });
  console.log(`  Admin user seeded (${adminEmail}).`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
