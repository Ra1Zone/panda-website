import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProjectDetailPage from "@/views/ProjectDetail";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await prisma.portfolioItem.findUnique({ where: { slug } });
  if (!row) notFound();
  const project = JSON.parse(row.data);
  return <ProjectDetailPage project={project} />;
}
