const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'components', 'storefront');

const replacements = {
  'ElectronicsTemplateBlocks.tsx': [
    ['<a href={p.link} style={{ position: "absolute", inset: 0, zIndex: 3 }} aria-label={p.title} />',
     '<Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} style={{ position: "absolute", inset: 0, zIndex: 3 }} aria-label={p.title} />'],
  ],
  'GroceryTemplateBlocks.tsx': [
    ['<a href={resolveStoreLink(b.buttonLink, storeCtx?.storeSlug)} className="gc-banner-btn">{b.buttonText}</a>',
     '<Link href={resolveStoreLink(b.buttonLink, storeCtx?.storeSlug)} className="gc-banner-btn">{b.buttonText}</Link>'],
    ['<a href={resolveFooterLink(link.href, link.label, storeCtx?.storeSlug)}>{link.label}</a>',
     '<Link href={resolveFooterLink(link.href, link.label, storeCtx?.storeSlug)}>{link.label}</Link>'],
  ],
  'HealthTemplateBlocks.tsx': [
    ['<a href="#" className="hh-feat-help-link">Contact Us →</a>',
     '<Link href={resolveStoreLink("#", storeCtx?.storeSlug)} className="hh-feat-help-link">Contact Us →</Link>'],
    ['<a href={resolveFooterLink(link.href, link.label, storeCtx?.storeSlug)}>{link.label}</a>',
     '<Link href={resolveFooterLink(link.href, link.label, storeCtx?.storeSlug)}>{link.label}</Link>'],
  ],
  'InteriorDesignTemplateBlocks.tsx': [
    ['{b.buttonText && <a href={resolveStoreLink(b.buttonLink, storeCtx?.storeSlug)} className="id-banner-btn">{b.buttonText}</a>}',
     '{b.buttonText && <Link href={resolveStoreLink(b.buttonLink, storeCtx?.storeSlug)} className="id-banner-btn">{b.buttonText}</Link>}'],
    ['<a href={buttonLink} className="id-cta-btn">{buttonText}</a>',
     '<Link href={resolveStoreLink(buttonLink, storeCtx?.storeSlug)} className="id-cta-btn">{buttonText}</Link>'],
    ['<a href={link.href}>{link.label}</a>',
     '<Link href={resolveFooterLink(link.href, link.label, storeCtx?.storeSlug)}>{link.label}</Link>'],
  ],
  'KidsTemplateBlocks.tsx': [
    ['<a href={pLink}>',
     '<Link href={pLink}>'],
    ['<a href={p.categoryLink || "#"}>{p.category}</a>',
     '<Link href={resolveStoreLink(p.categoryLink || "#", storeCtx?.storeSlug)}>{p.category}</Link>'],
    ['<a href={fixLink(buttonLink)} className="kbp-btn">',
     '<Link href={fixLink(buttonLink)} className="kbp-btn">'],
    ['<a href={p.link} className="kbp2-link" aria-label={p.title} />',
     '<Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} className="kbp2-link" aria-label={p.title} />'],
    ['<a href="/"><img src={logoUrl} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} /></a>',
     '<Link href={resolveStoreLink("/", storeCtx?.storeSlug)}><img src={logoUrl} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} /></Link>'],
    ['<a href={link.url}>{link.label}</a>',
     '<Link href={resolveFooterLink(link.url, link.label, storeCtx?.storeSlug)}>{link.label}</Link>'],
  ],
  'MakeupTemplateBlocks.tsx': [
    ['<a href={fixLink(cat.link, cat.name)} className="mcs-link">{cat.name}</a>',
     '<Link href={fixLink(cat.link, cat.name)} className="mcs-link">{cat.name}</Link>'],
    ['<a href={fixLink(buttonLink)} className="mst-btn">',
     '<Link href={fixLink(buttonLink)} className="mst-btn">'],
    ['<a href={productLink}>',
     '<Link href={productLink}>'],
    ['<a href={p.categoryLink || "#"}>{p.category}</a>',
     '<Link href={resolveStoreLink(p.categoryLink || "#", storeCtx?.storeSlug)}>{p.category}</Link>'],
    ['<a href={b.link} className="mbr-link" title={b.name}>',
     '<Link href={resolveStoreLink(b.link, storeCtx?.storeSlug)} className="mbr-link" title={b.name}>'],
    ['<a href="/"><img src={logoUrl} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} /></a>',
     '<Link href={resolveStoreLink("/", storeCtx?.storeSlug)}><img src={logoUrl} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} /></Link>'],
    ['<a href={link.url}>{link.label}</a>',
     '<Link href={resolveFooterLink(link.url, link.label, storeCtx?.storeSlug)}>{link.label}</Link>'],
    ['<a href="#" className="mf-review-btn">Write a Review</a>',
     '<Link href={resolveStoreLink("#", storeCtx?.storeSlug)} className="mf-review-btn">Write a Review</Link>'],
  ],
  'PerfumesTemplateBlocks.tsx': [
    ['<a href={pLink}>',
     '<Link href={pLink}>'],
    ['<a href={p.link} className="pba-link" aria-label={p.title} />',
     '<Link href={resolveStoreLink(p.link, storeCtx?.storeSlug)} className="pba-link" aria-label={p.title} />'],
    ['<a href="/"><img src={logoUrl} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} /></a>',
     '<Link href={resolveStoreLink("/", storeCtx?.storeSlug)}><img src={logoUrl} alt={logoAlt} style={{ maxWidth: "150px", height: "auto" }} /></Link>'],
    ['<a href={link.url}>{link.label}</a>',
     '<Link href={resolveFooterLink(link.url, link.label, storeCtx?.storeSlug)}>{link.label}</Link>'],
  ],
};

// Also need to fix closing </a> tags that correspond to multi-line <a> → <Link> conversions
const closingTagReplacements = {
  'KidsTemplateBlocks.tsx': [
    // Line after <a href={pLink}> has content then </a>
  ],
  'MakeupTemplateBlocks.tsx': [],
  'PerfumesTemplateBlocks.tsx': [],
};

let totalFixed = 0;
for (const [file, pairs] of Object.entries(replacements)) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  for (const [old, rep] of pairs) {
    const count = content.split(old).length - 1;
    if (count > 0) {
      content = content.split(old).join(rep);
      console.log(`  ${file}: replaced ${count}x: ${old.substring(0, 60)}...`);
      totalFixed += count;
    } else {
      console.log(`  ${file}: NOT FOUND: ${old.substring(0, 60)}...`);
    }
  }
  fs.writeFileSync(fp, content);
}

console.log(`\nTotal replacements: ${totalFixed}`);
