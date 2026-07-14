"use client";
import { ChevronRight, X } from "lucide-react";
import { ShoppingBag, ShoppingCart, Star } from "@/components/icons/FilledIcons";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  description?: string;
  images: Array<{ url: string; alt?: string }>;
  inStock: boolean;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

function formatCurrency(amount: number, currency: string = "NGN"): string {
  const symbols: Record<string, string> = { NGN: "₦", KES: "KSh", GHS: "GH₵", ZAR: "R", USD: "$", GBP: "£", EUR: "€" };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function ComparePage() {
  const { slug } = useParams() as { slug: string };
  const compareKey = `afrostore_compare_${slug}`;

  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(compareKey);
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) setProducts(parsed); }
    } catch { /* ignore */ }
    setLoaded(true);
  }, [compareKey]);

  useEffect(() => {
    if (loaded) localStorage.setItem(compareKey, JSON.stringify(products));
  }, [products, loaded, compareKey]);

  const removeProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearAll = useCallback(() => setProducts([]), []);

  const currency = products[0]?.currency || "NGN";

  const rows: Array<{ label: string; getValue: (p: CompareProduct) => React.ReactNode }> = [
    { label: "Price", getValue: (p) => <span className="font-semibold">{formatCurrency(p.price, currency)}</span> },
    { label: "Availability", getValue: (p) => p.inStock ? <span className="text-green-600 font-medium">In Stock</span> : <span className="text-red-500 font-medium">Out of Stock</span> },
    { label: "Category", getValue: (p) => p.category || "—" },
    { label: "Rating", getValue: (p) => p.rating ? (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        <span>{p.rating.toFixed(1)}</span>
        {p.reviewCount && <span className="text-gray-400">({p.reviewCount})</span>}
      </div>
    ) : "—" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href={`/store/${slug}`} className="flex items-center gap-2 text-gray-900 font-bold text-lg">
            <ShoppingBag className="h-5 w-5" /> Store
          </Link>
          <Link href={`/store/${slug}/shop`} className="text-sm text-gray-500 hover:text-gray-900">Back to Shop →</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href={`/store/${slug}`} className="hover:text-gray-600">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">Compare Products</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
          {products.length > 0 && (
            <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear All</button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products to compare</h2>
            <p className="text-gray-500 mb-6">Add products to compare from the shop page.</p>
            <Link href={`/store/${slug}/shop`} className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left text-sm font-medium text-gray-500 w-32">Product</th>
                  {products.map(p => (
                    <th key={p.id} className="p-4 text-center min-w-[200px]">
                      <div className="relative">
                        <button onClick={() => removeProduct(p.id)} className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                        <Link href={`/store/${slug}/product/${p.slug}`}>
                          <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden bg-gray-100 mb-3">
                            {p.images?.[0]?.url ? (
                              <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mt-12" />
                            )}
                          </div>
                          <div className="font-medium text-gray-900 text-sm hover:text-blue-600 line-clamp-2">{p.name}</div>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i < rows.length - 1 ? "border-b border-gray-100" : ""}>
                    <td className="p-4 text-sm font-medium text-gray-500">{row.label}</td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center text-sm text-gray-700">{row.getValue(p)}</td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-gray-200">
                  <td className="p-4 text-sm font-medium text-gray-500">Action</td>
                  {products.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <Link href={`/store/${slug}/product/${p.slug}`} className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
                        <ShoppingCart className="h-3.5 w-3.5" /> View Product
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
