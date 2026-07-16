"use client";
import { Loader2, Plus, X } from "lucide-react";
import { AlertCircle, CheckCircle2, Clock, Edit, Eye, Grid3X3, ImageIcon, List, MoreHorizontal, Package, Search, Sparkles, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock: number;
  status: string;
  isFeatured: boolean;
  tags: string[];
  images: Array<{ id: string; url: string; alt?: string }>;
  variants: Array<{ id: string; name: string }>;
  category?: { id: string; name: string; slug: string };
  _count: { reviews: number; orderItems: number };
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const statusBadge: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: "Active", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  DRAFT: { label: "Draft", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  ARCHIVED: { label: "Archived", color: "bg-surface-100 text-surface-500 border-surface-200", icon: AlertCircle },
};

export default function ProductsPage() {
  const { currentStore } = useSite();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await api.get<ProductsResponse>(`/api/sites/${currentStore.id}/products?${params}`);
    if (res.success && res.data) {
      setProducts(res.data.products);
      setTotal(res.data.pagination.total);
    }
    setLoading(false);
  }, [currentStore, page, search, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!currentStore || !confirm("Delete this product?")) return;
    await api.delete(`/api/sites/${currentStore.id}/products/${id}`);
    fetchProducts();
  };

  const currency = currentStore?.currency || "GHS";

  return (
    <>
      <DashboardHeader
        title="Products"
        subtitle={`${total} products in your store`}
        action={{ label: "Add Product", onClick: () => router.push("/dashboard/products/new") }}
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-transparent text-sm placeholder:text-surface-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            {["", "ACTIVE", "DRAFT", "ARCHIVED"].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-brand-50 text-brand-700" : "text-surface-500 hover:bg-surface-100"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setView("list")} className={`p-2 rounded-lg ${view === "list" ? "bg-surface-100" : ""}`}>
              <List className="h-4 w-4 text-surface-500" />
            </button>
            <button onClick={() => setView("grid")} className={`p-2 rounded-lg ${view === "grid" ? "bg-surface-100" : ""}`}>
              <Grid3X3 className="h-4 w-4 text-surface-500" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
            <Package className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 mb-2">No products yet</h3>
            <p className="text-sm text-surface-500 mb-6">Add your first product to start selling.</p>
            <Link href="/dashboard/products/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          </div>
        ) : (
          /* Product List */
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400">Product</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden md:table-cell">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-surface-400 hidden sm:table-cell">Stock</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Price</th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-surface-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {products.map((product) => {
                  const sb = statusBadge[product.status] || statusBadge.DRAFT;
                  const StatusIcon = sb.icon;
                  return (
                    <tr key={product.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.images[0] ? (
                              <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover rounded-xl" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-surface-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-surface-900 truncate">{product.name}</div>
                            <div className="text-[10px] text-surface-500">
                              {product.category?.name || "Uncategorized"} · {product._count.orderItems} sold
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${sb.color}`}>
                          <StatusIcon className="h-3 w-3" />{sb.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 hidden sm:table-cell">
                        <span className={`text-sm ${product.stock <= 5 ? "text-accent-600 font-semibold" : "text-surface-700"}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="text-sm font-semibold text-surface-900">
                          {formatCurrency(Number(product.price), currency)}
                        </div>
                        {product.compareAtPrice && (
                          <div className="text-[10px] text-surface-400 line-through">
                            {formatCurrency(Number(product.compareAtPrice), currency)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg text-surface-400 hover:text-accent-600 hover:bg-accent-50 transition-colors" title="Delete product">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-surface-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Prev</button>
              <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

    </>
  );
}
