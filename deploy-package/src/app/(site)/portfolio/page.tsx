import { prisma } from "@/lib/db";
import PortfolioPage from "@/views/Portfolio";

export const dynamic = "force-dynamic";

export default async function Page() {
  const rows = await prisma.portfolioItem.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  const portfolio = rows.map(r => JSON.parse(r.data));

  const featuredRow = await prisma.portfolioItem.findFirst({
    where: { active: true, featured: true },
    orderBy: { order: "asc" },
  });
  const featured = featuredRow ? JSON.parse(featuredRow.data) : (portfolio[0] ?? null);

  return <PortfolioPage portfolio={portfolio} featured={featured} />;
}
