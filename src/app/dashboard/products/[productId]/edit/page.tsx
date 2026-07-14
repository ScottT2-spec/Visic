"use client";

import ProductForm from "@/components/dashboard/ProductForm";
import { use } from "react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  return <ProductForm productId={productId} />;
}
