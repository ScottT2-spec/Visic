#!/usr/bin/env node
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

  // Convert internal <a href={...}> patterns to <Link href={...}>
  // BUT skip external links (target="_blank", rel="noopener", social links, instagram)

  // Pattern: <a href={fixLink(...)} className="...-btn">...</a>
  // → <Link href={fixLink(...)} className="...-btn">...</Link>
  code = code.replace(
    /<a href=\{fixLink\(([^)]+)\)\} className="([^"]*-btn[^"]*)">([^<]*)<\/a>/g,
    '<Link href={fixLink($1)} className="$2">$3</Link>'
  );

  // Pattern: <a href={fixLink(...)} className="...-btn-...">...</a>
  code = code.replace(
    /<a href=\{fixLink\(([^)]+)\)\} className=\{([^}]+)\}>([^<]*)<\/a>/g,
    '<Link href={fixLink($1)} className={$2}>$3</Link>'
  );

  // Product name links: <a href={...Link}>{p.name}</a> or similar
  // <a href={productLink}>{p.name}</a> → <Link href={productLink}>{p.name}</Link>
  code = code.replace(
    /<a href=\{((?:product|p)Link)\}>(\{[^}]+\})<\/a>/g,
    '<Link href={$1}>$2</Link>'
  );
  
  // <a href={fixLink(p.slug)}>{p.name}</a>
  code = code.replace(
    /<a href=\{fixLink\(p\.slug\)\}>\{p\.name\}<\/a>/g,
    '<Link href={fixLink(p.slug)}>{p.name}</Link>'
  );

  // <a href={pLink}>{p.name}</a>
  code = code.replace(
    /<a href=\{pLink\}>\{p\.name\}<\/a>/g,
    '<Link href={pLink}>{p.name}</Link>'
  );

  // Category links: <a href={fixLink(c.link, c.name)} className="...-link" aria-label={c.name} />
  code = code.replace(
    /<a href=\{fixLink\(([^)]+)\)\} className="([^"]*-link[^"]*)" aria-label=\{([^}]+)\} \/>/g,
    '<Link href={fixLink($1)} className="$2" aria-label={$3} />'
  );

  // Category name links: <a href={fixLink(c.link, c.name)}>{c.name}</a>
  code = code.replace(
    /<a href=\{fixLink\(([^)]+)\)\}>\{c\.name\}<\/a>/g,
    '<Link href={fixLink($1)}>{c.name}</Link>'
  );

  // Banner overlay links: <a href={fixLink(...)} className="...-link" aria-label={...} />
  code = code.replace(
    /<a href=\{fixLink\(([^)]+)\)\} className="([^"]*)" aria-label=\{([^}]+)\} \/>/g,
    '<Link href={fixLink($1)} className="$2" aria-label={$3} />'
  );

  // Blog links: <a href={p.link} ... >
  code = code.replace(
    /<a href=\{p\.link\} className="([^"]*read-more[^"]*)">([^<]*)<\/a>/g,
    '<Link href={p.link} className="$1">$2</Link>'
  );
  code = code.replace(
    /<a href=\{p\.link\}>\{p\.title\}<\/a>/g,
    '<Link href={p.link}>{p.title}</Link>'
  );
  code = code.replace(
    /<a href=\{b\.link\}>\{b\.title\}<\/a>/g,
    '<Link href={b.link}>{b.title}</Link>'
  );

  // Resolve href="#" or href={"#"} to resolveStoreLink  
  code = code.replace(
    /<a href=\{(cat|c)\.link \|\| "#"\}>/g,
    '<Link href={resolveStoreLink($1.link, storeCtx?.storeSlug)}>'
  );

  // Fix corresponding closing tags for converted multi-line patterns
  // This is tricky — the simple replacements above handle single-line cases

  if (code !== orig) {
    fs.writeFileSync(fp, code, "utf8");
    const changes = code.split("Link").length - orig.split("Link").length;
    console.log(`✅ ${file} — ~${Math.abs(changes)} Link conversions`);
  } else {
    console.log(`⏭️  ${file} — no changes`);
  }
}
