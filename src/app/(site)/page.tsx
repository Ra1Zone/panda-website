import { prisma } from "@/lib/db";
import IndexPage from "@/views/Index";

export const dynamic = "force-dynamic";

export default async function Page() {
  const homeRow = await prisma.siteContent.findUnique({ where: { key: "home" } });
  const home = homeRow ? JSON.parse(homeRow.data) : null;

  const serviceRows = await prisma.service.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const services = serviceRows.map(r => JSON.parse(r.data));

  const portfolioRows = await prisma.portfolioItem.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const portfolio = portfolioRows.map(r => JSON.parse(r.data));

  const testimonialRows = await prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const testimonials = testimonialRows.map(r => JSON.parse(r.data));

  const brandRows = await prisma.brand.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const brands = brandRows.map(r => JSON.parse(r.data));

  return <IndexPage home={home} services={services} portfolio={portfolio} testimonials={testimonials} brands={brands} />;
}
