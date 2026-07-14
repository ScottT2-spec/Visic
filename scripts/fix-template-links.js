#!/usr/bin/env node
/**
 * Fix template block links:
 * 1. Add imports for Link and resolveStoreLink/resolveFooterLink
 * 2. Replace fixLink inline definitions with resolveStoreLink calls
 * 3. Convert internal <a href> to <Link href>
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "../src/components/storefront");

const FILES = [
  "ElectronicsTemplateBlocks.tsx",
  "BakeryTemplateBlocks.tsx",
  "CosmeticsTemplateBlocks.tsx",
  "GroceryTemplateBlocks.tsx",
  "HealthTemplateBlocks.tsx",
  "InteriorDesignTemplateBlocks.tsx",
  "KidsTemplateBlocks.tsx",
  "MakeupTemplateBlocks.tsx",
  "PerfumesTemplateBlocks.tsx",
];

for (const file of FILES) {
  const fp = path.join(DIR, file);
  let code = fs.readFileSync(fp, "utf8");
  const orig = code;

  // 1. Add imports if not already present
  if (!code.includes("from \"next/link\"")) {
    code = code.replace(
      /^("use client";\n)/,
      '$1import Link from "next/link";\n'
    );
  }
  if (!code.includes("resolveStoreLink")) {
    code = code.replace(
      /^("use client";\n(?:import Link from "next\/link";\n)?)/,
      '$1import { resolveStoreLink, resolveFooterLink } from "@/lib/template-link-utils";\n'
    );
  }

  // 2. Replace all inline fixLink definitions that match the pattern:
  //    const fixLink = (link: string) => {
  //      if (link && link.startsWith("/store/")) return link;
  //      if (storeCtx?.storeSlug || ctx?.storeSlug) return `/store/${...}/shop`;
  //      return link || "#";
  //    };
  // Replace with: const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);
  
  // Pattern for inline fixLink with storeCtx
  code = code.replace(
    /const fixLink = \(link: string\) => \{\s*if \(link && link\.startsWith\("\/store\/"\)\) return link;\s*if \(storeCtx\?\.storeSlug\) return [`']\/store\/\$\{storeCtx\.storeSlug\}\/shop[`'];\s*return link \|\| "#";\s*\};/g,
    'const fixLink = (link: string) => resolveStoreLink(link, storeCtx?.storeSlug);'
  );

  // Pattern for fixLink that takes slug param (product links)
  code = code.replace(
    /const fixLink = \(slug: string\) => \{\s*if \(!storeCtx\?\.storeSlug\) return "#";\s*return [`']\/store\/\$\{storeCtx\.storeSlug\}\/product\/\$\{slug\}[`'];\s*\};/g,
    'const fixLink = (slug: string) => storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}/product/${slug}` : "#";'
  );
  
  // One-liner product fixLink
  code = code.replace(
    /const fixLink = \(slug: string\) => storeCtx\?\.storeSlug \? [`']\/store\/\$\{storeCtx\.storeSlug\}\/product\/\$\{slug\}[`'] : "#";/g,
    'const fixLink = (slug: string) => storeCtx?.storeSlug ? `/store/${storeCtx.storeSlug}/product/${slug}` : "#";'
  );

  // Electronics useFixLink pattern
  code = code.replace(
    /function useFixLink\(\) \{\s*const ctx = useContext\(ElectronicsStoreContext\);\s*return \(link: string\) => \{\s*if \(link && link\.startsWith\("\/store\/"\)\) return link;\s*if \(ctx\?\.storeSlug\) return [`']\/store\/\$\{ctx\.storeSlug\}\/shop[`'];\s*return link \|\| "#";\s*\};\s*\}/g,
    `function useFixLink() {
  const ctx = useContext(ElectronicsStoreContext);
  return (link: string) => resolveStoreLink(link, ctx?.storeSlug);
}`
  );

  // Health fixLink with optional param
  code = code.replace(
    /const fixLink = \(link\?: string\) => \{\s*if \(link && link\.startsWith\("\/store\/"\)\) return link;\s*if \(storeCtx\?\.storeSlug\) return [`']\/store\/\$\{storeCtx\.storeSlug\}\/shop[`'];\s*return link \|\| "#";\s*\};/g,
    'const fixLink = (link?: string) => resolveStoreLink(link || "#", storeCtx?.storeSlug);'
  );

  // Makeup/Kids fixLink with (link, name) pattern for categories
  code = code.replace(
    /const fixLink = \(link: string, name: string\) => \{\s*if \(link && link\.startsWith\("\/store\/"\)\) return link;\s*if \(storeCtx\?\.storeSlug\) \{\s*const catSlug = name\.toLowerCase\(\)\.replace\(\/\[^a-z0-9\]\+\/g, "-"\)\.replace\(\/\(\^-\|-\$\)\/g, ""\);\s*return [`']\/store\/\$\{storeCtx\.storeSlug\}\/shop\?category=\$\{catSlug\}[`'];\s*\}\s*return link \|\| "#";\s*\};/g,
    `const fixLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const catSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return \`/store/\${storeCtx.storeSlug}/shop?category=\${catSlug}\`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };`
  );

  // Perfumes resolveLink with (link, name) pattern
  code = code.replace(
    /const resolveLink = \(link: string, name: string\) => \{\s*if \(link && link\.startsWith\("\/store\/"\)\) return link;\s*if \(storeCtx\?\.storeSlug\) \{\s*const slug = name\.toLowerCase\(\)\.replace\(\/\[^a-z0-9\]\+\/g, "-"\)\.replace\(\/\(\^-\|-\$\)\/g, ""\);\s*return [`']\/store\/\$\{storeCtx\.storeSlug\}\/product\/\$\{slug\}[`'];\s*\}\s*return link \|\| "#";\s*\};/g,
    `const resolveLink = (link: string, name: string) => {
    if (link && link.startsWith("/store/")) return link;
    if (storeCtx?.storeSlug) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return \`/store/\${storeCtx.storeSlug}/product/\${slug}\`;
    }
    return resolveStoreLink(link, storeCtx?.storeSlug);
  };`
  );

  if (code !== orig) {
    fs.writeFileSync(fp, code, "utf8");
    console.log(`✅ ${file} — imports + fixLink updated`);
  } else {
    console.log(`⏭️  ${file} — no regex matches (may need manual fix)`);
  }
}

console.log("\nDone. Run tsc --noEmit to verify.");
