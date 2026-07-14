import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const site = await prisma.site.findFirst({
    where: { status: "ACTIVE", OR: [{ slug }, { subdomain: slug }, { customDomain: slug }] },
    select: { name: true, slug: true, description: true, customDomain: true },
  });

  if (!site) return { title: "Shop" };

  const storeUrl = site.customDomain ? `https://${site.customDomain}` : `https://afrostore.shop/store/${site.slug}`;

  return {
    title: "Shop",
    description: `Browse all products at ${site.name}. ${site.description || ""}`.trim(),
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `Shop | ${site.name}`,
      description: `Browse all products at ${site.name}.`,
      url: `${storeUrl}/shop`,
    },
    alternates: { canonical: `${storeUrl}/shop` },
  };
}

export default function ShopLayout({ children }: Props) {
  return <>{children}</>;
}
