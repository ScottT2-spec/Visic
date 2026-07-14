"use client";

import { ShopPageContent } from "@/components/storefront/ShopPageContent";
import { DesignableWrapper } from "./DesignableWrapper";
import type { SectionStyleOverrides } from "@/types";

interface DesignableShopPageProps {
  storeSlug: string;
  storeData: any;
  labelOverrides?: any;
  cartCount?: number;
  wishlistCount?: number;
  onCartClick?: () => void;
  onWishlistClick?: () => void;
  styleOverrides?: SectionStyleOverrides;
}

/**
 * DesignableShopPage - A wrapper around ShopPageContent that makes it editable in the builder
 * The underlying product data remains dynamic, but the layout/appearance can be customized
 */
export function DesignableShopPage({
  storeSlug,
  storeData,
  labelOverrides,
  cartCount,
  wishlistCount,
  onCartClick,
  onWishlistClick,
  styleOverrides,
}: DesignableShopPageProps) {
  return (
    <DesignableWrapper styleOverrides={styleOverrides} blockType="shopPage">
      <ShopPageContent
        storeSlug={storeSlug}
        storeData={storeData}
        labelOverrides={labelOverrides}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartClick={onCartClick}
        onWishlistClick={onWishlistClick}
      />
    </DesignableWrapper>
  );
}
