import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { KidsFontLoader, KidsFooterFull, KidsHeader } from "@/components/storefront/KidsTemplateBlocks";
import { Heart, ImageIcon, ShoppingCart, Star } from "@/components/icons/FilledIcons";

type Props = {
  params: Promise<{ slug: string; categorySlug: string }>;
};

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default async function ProductCategoryPage({ params }: Props) {
  const { slug, categorySlug } = await params;

  const site = await prisma.site.findFirst({
    where: {
      status: "ACTIVE",
      OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
    },
    include: {
      templates: {
        where: { isActive: true },
        take: 1,
        include: { template: true },
      },
    },
  });

  if (!site) notFound();

  const activeTemplateSlug = site.templates?.[0]?.template?.slug || null;
  if (activeTemplateSlug !== "kids" && slug !== "kids") {
    notFound();
  }

  const [category, categories, products] = await Promise.all([
    prisma.category.findFirst({
      where: { siteId: site.id, slug: categorySlug },
    }),
    prisma.category.findMany({
      where: { siteId: site.id },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      orderBy: { position: "asc" },
    }),
    prisma.product.findMany({
      where: {
        siteId: site.id,
        status: "ACTIVE",
        category: { slug: categorySlug },
      },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const categoryName = category?.name || "Gifts";
  const currency = site.currency || "NGN";
  const giftLinks = [
    { label: "All Products", href: `/store/${slug}/shop` },
    { label: "Gifts", href: `/store/${slug}/product-category/gifts` },
    { label: "Blog", href: `/store/${slug}/blog` },
  ];

  return (
    <div className="min-h-screen bg-[#fffef8] text-[#3b3344]">
      <KidsFontLoader />
      <KidsHeader
        storeName={site.name}
        storeSlug={slug}
        logo={site.logo}
        templateSlug="kids"
        cartCount={0}
        wishlistCount={0}
      />

      <main>
        <section className="bg-gradient-to-br from-[#fff7df] via-[#fffdf4] to-[#ffeef1] px-4 py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f5857c]">Product Category</p>
              <h1 className="mt-4 font-serif text-4xl text-[#3b3344] sm:text-5xl">{categoryName}</h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#6d6277]">
                Carefully picked gifts, toys, and sweet little surprises from the Kids collection.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {giftLinks.map((item) => (
                <Link key={item.label} href={item.href} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#3b3344] shadow-[0_12px_30px_rgba(59,51,68,0.06)] transition hover:text-[#f5857c]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="rounded-[30px] border border-[#efe6da] bg-white p-6 shadow-[0_20px_50px_rgba(59,51,68,0.05)]">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a69cad]">Categories</p>
              <div className="mt-4 space-y-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/store/${slug}/product-category/${cat.slug}`}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      cat.slug === categorySlug ? "bg-[#f5857c] text-white" : "bg-[#fffaf1] text-[#3b3344] hover:bg-[#fff4de]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs opacity-70">{cat._count.products}</span>
                  </Link>
                ))}
              </div>
            </aside>

            <div>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-[#6d6277]">
                  {products.length} product{products.length === 1 ? "" : "s"} in {categoryName}
                </p>
                <Link href={`/store/${slug}/shop`} className="text-sm font-semibold text-[#f5857c] transition hover:text-[#ef7067]">
                  View all products
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="rounded-[30px] border border-[#efe6da] bg-white px-6 py-20 text-center shadow-[0_20px_50px_rgba(59,51,68,0.05)]">
                  <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-[#d8c9b7]" />
                  <h2 className="text-xl font-bold text-[#3b3344]">No gifts found yet</h2>
                  <p className="mt-2 text-sm text-[#6d6277]">
                    This category will show real products once matching items are assigned to Gifts.
                  </p>
                  <Link href={`/store/${slug}/shop`} className="mt-6 inline-flex rounded-full bg-[#3b3344] px-5 py-2.5 text-sm font-semibold text-white">
                    Browse the shop
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    const hasImage = product.images[0]?.url;
                    return (
                      <div key={product.id} className="group">
                        <Link href={`/store/${slug}/product/${product.slug}`} className="block">
                          <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-[30px] bg-white shadow-[0_14px_32px_rgba(59,51,68,0.08)]">
                            {hasImage ? (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f5857c] to-[#f7b267]">
                                <ImageIcon className="h-10 w-10 text-white/50" />
                              </div>
                            )}
                            {product.isFeatured && (
                              <span className="absolute left-3 top-3 rounded-full bg-[#3b3344] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                                Featured
                              </span>
                            )}
                            <div className="absolute right-3 top-3 flex gap-2">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#3b3344] shadow-sm">
                                <Heart className="h-4 w-4" />
                              </span>
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#3b3344] shadow-sm">
                                <ShoppingCart className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </Link>
                        <Link href={`/store/${slug}/product/${product.slug}`}>
                          <h3 className="text-sm font-semibold text-[#3b3344] transition group-hover:text-[#f5857c]">{product.name}</h3>
                        </Link>
                        {product.category && <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#a69cad]">{product.category.name}</p>}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-base font-bold text-[#3b3344]">{formatCurrency(Number(product.price), currency)}</span>
                          <Star className="h-3.5 w-3.5 fill-[#f7b267] text-[#f7b267]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <KidsFooterFull
        storeName={site.name}
        storeSlug={slug}
        logo={site.logo}
        templateSlug="kids"
        description={site.description || "Bright, playful kids fashion and gifts with a premium WoodMart-inspired finish."}
      />
    </div>
  );
}
