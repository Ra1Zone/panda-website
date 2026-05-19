import { prisma } from "@/lib/db";
import ServicesPage from "@/views/Services";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await prisma.service.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const services = rows.map(r => JSON.parse(r.data));
  return <ServicesPage services={services} />;
}
