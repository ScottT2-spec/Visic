import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

/**
 * Resolve a store by slug, subdomain, or custom domain.
 */
async function resolveStore(slug: string) {
  return prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { slug },
        { subdomain: slug },
        { customDomain: slug },
      ],
    },
    select: {
      name: true,
      slug: true,
      description: true,
      logo: true,
      coverImage: true,
      subdomain: true,
      customDomain: true,
      businessType: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await resolveStore(slug);

  if (!store) {
    return {
      title: "Store Not Found | AfroStore",
      description: "This store does not exist or is no longer active.",
    };
  }

  const title = store.name;
  const description =
    store.description ||
    `Shop at ${store.name} — discover amazing products and deals.`;
  const storeUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://afrostore.shop/store/${store.slug}`;

  // Use cover image → logo → fallback for OG image
  const ogImage = store.coverImage || store.logo || undefined;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: [store.name, store.businessType || "online store", "shop", "buy online"].filter(Boolean),
    metadataBase: new URL(storeUrl),
    openGraph: {
      type: "website",
      siteName: store.name,
      title,
      description,
      url: storeUrl,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: store.name }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: storeUrl,
    },
  };
}

export default async function StoreLayout({ params, children }: Props) {
  const { slug } = await params;
  const store = await resolveStore(slug);

  // JSON-LD structured data for search engines
  const jsonLd = store
    ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name: store.name,
        description: store.description || `Shop at ${store.name}`,
        url: store.customDomain
          ? `https://${store.customDomain}`
          : `https://afrostore.shop/store/${store.slug}`,
        ...(store.logo ? { logo: store.logo, image: store.coverImage || store.logo } : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
