"use client";

import { BlogListingContent } from "@/components/storefront/BlogListingContent";
import { DesignableWrapper } from "./DesignableWrapper";
import type { SectionStyleOverrides } from "@/types";

interface DesignableBlogPageProps {
  storeSlug: string;
  storeData: any;
  labelOverrides?: any;
  styleOverrides?: SectionStyleOverrides;
}

/**
 * DesignableBlogPage - A wrapper around BlogListingContent that makes it editable in the builder
 * The underlying blog data remains dynamic, but the layout/appearance can be customized
 */
export function DesignableBlogPage({
  storeSlug,
  storeData,
  labelOverrides,
  styleOverrides,
}: DesignableBlogPageProps) {
  return (
    <DesignableWrapper styleOverrides={styleOverrides} blockType="blogPage">
      <BlogListingContent
        storeSlug={storeSlug}
        storeData={storeData}
        labelOverrides={labelOverrides}
      />
    </DesignableWrapper>
  );
}
