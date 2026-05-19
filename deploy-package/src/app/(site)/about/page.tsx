import { prisma } from "@/lib/db";
import AboutPage from "@/views/About";

export const dynamic = "force-dynamic";

export default async function Page() {
  const aboutRow = await prisma.siteContent.findUnique({ where: { key: "about" } });
  const about = aboutRow ? JSON.parse(aboutRow.data) : null;

  const serviceRows = await prisma.service.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const services = serviceRows.map(r => JSON.parse(r.data));

  const brandRows = await prisma.brand.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const brands = brandRows.map(r => JSON.parse(r.data));

  return <AboutPage about={about} services={services} brands={brands} />;
}
