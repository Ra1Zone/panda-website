import { prisma } from "@/lib/db";
import ContactPage from "@/views/Contact";

export const dynamic = "force-dynamic";

export default async function Page() {
  const settingsRow = await prisma.siteContent.findUnique({ where: { key: "settings" } });
  const settings = settingsRow ? JSON.parse(settingsRow.data) : null;

  return <ContactPage settings={settings} />;
}
