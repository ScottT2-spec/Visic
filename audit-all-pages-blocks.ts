import "dotenv/config";
import { prisma } from "./src/lib/db";

interface AuditResult {
  siteSlug: string;
  siteName: string;
  templateSlug: string | null;
  pages: {
    pageId: string;
    pageSlug: string;
    pageTitle: string;
    pageType: string;
    blocksCount: number;
    hasBlocks: boolean;
    isRelyingOnFallback: boolean;
  }[];
}

interface SummaryStats {
  totalSites: number;
  totalPages: number;
  pagesWithEmptyBlocks: number;
  pagesWithRealBlocks: number;
  pagesRelyingOnFallback: number;
  breakdownByTemplate: Record<string, {
    totalSites: number;
    totalPages: number;
    pagesWithEmptyBlocks: number;
    pagesWithRealBlocks: number;
    pagesRelyingOnFallback: number;
  }>;
}

async function auditAllPages() {
  console.log('=== FULL DATABASE AUDIT: Page Content Blocks ===\n');
  console.log('This audit examines EVERY site and EVERY page in the database...\n');

  const results: AuditResult[] = [];
  const summary: SummaryStats = {
    totalSites: 0,
    totalPages: 0,
    pagesWithEmptyBlocks: 0,
    pagesWithRealBlocks: 0,
    pagesRelyingOnFallback: 0,
    breakdownByTemplate: {}
  };

  try {
    // Get ALL sites with their templates and pages
    const sites = await prisma.site.findMany({
      include: {
        templates: {
          where: { isActive: true },
          include: { template: true }
        },
        pages: {
          orderBy: { position: 'asc' }
        }
      }
    });

    summary.totalSites = sites.length;

    for (const site of sites) {
      const activeTemplate = site.templates[0];
      const templateSlug = activeTemplate?.template?.slug || null;

      const siteResult: AuditResult = {
        siteSlug: site.slug,
        siteName: site.name,
        templateSlug,
        pages: []
      };

      // Initialize template breakdown if not exists
      if (templateSlug && !summary.breakdownByTemplate[templateSlug]) {
        summary.breakdownByTemplate[templateSlug] = {
          totalSites: 0,
          totalPages: 0,
          pagesWithEmptyBlocks: 0,
          pagesWithRealBlocks: 0,
          pagesRelyingOnFallback: 0
        };
      }

      if (templateSlug) {
        summary.breakdownByTemplate[templateSlug].totalSites++;
      }

      for (const page of site.pages) {
        const content = page.content as any;
        const blocks = Array.isArray(content?.blocks) ? content.blocks : [];
        const blocksCount = blocks.length;
        const hasBlocks = blocksCount > 0;
        
        // A page is relying on fallback if it has empty blocks
        // (mergeBespokeTemplateBlocks would be called to generate content)
        const isRelyingOnFallback = !hasBlocks;

        siteResult.pages.push({
          pageId: page.id,
          pageSlug: page.slug,
          pageTitle: page.title,
          pageType: page.type,
          blocksCount,
          hasBlocks,
          isRelyingOnFallback
        });

        // Update summary stats
        summary.totalPages++;
        if (hasBlocks) {
          summary.pagesWithRealBlocks++;
          if (templateSlug) {
            summary.breakdownByTemplate[templateSlug].pagesWithRealBlocks++;
          }
        } else {
          summary.pagesWithEmptyBlocks++;
          summary.pagesRelyingOnFallback++;
          if (templateSlug) {
            summary.breakdownByTemplate[templateSlug].pagesWithEmptyBlocks++;
            summary.breakdownByTemplate[templateSlug].pagesRelyingOnFallback++;
          }
        }

        if (templateSlug) {
          summary.breakdownByTemplate[templateSlug].totalPages++;
        }
      }

      results.push(siteResult);
    }

    // Print detailed report
    console.log('=== DETAILED REPORT BY SITE ===\n');

    for (const result of results) {
      console.log(`\n--- Site: ${result.siteName} (${result.siteSlug}) ---`);
      console.log(`Template: ${result.templateSlug || 'none'}`);
      console.log(`Total Pages: ${result.pages.length}`);
      console.log(`Pages with Empty Blocks: ${result.pages.filter(p => !p.hasBlocks).length}`);
      console.log(`Pages with Real Blocks: ${result.pages.filter(p => p.hasBlocks).length}`);

      if (result.pages.some(p => !p.hasBlocks)) {
        console.log('\n  Pages relying on fallback (empty blocks):');
        for (const page of result.pages) {
          if (!page.hasBlocks) {
            console.log(`    - ${page.pageTitle} (${page.pageSlug}) [${page.pageType}] - 0 blocks`);
          }
        }
      }

      if (result.pages.some(p => p.hasBlocks)) {
        console.log('\n  Pages with real content:');
        for (const page of result.pages) {
          if (page.hasBlocks) {
            console.log(`    - ${page.pageTitle} (${page.pageSlug}) [${page.pageType}] - ${page.blocksCount} blocks`);
          }
        }
      }
    }

    // Print summary statistics
    console.log('\n\n=== SUMMARY STATISTICS ===\n');
    console.log(`Total Sites: ${summary.totalSites}`);
    console.log(`Total Pages: ${summary.totalPages}`);
    console.log(`Pages with Empty Blocks (relying on fallback): ${summary.pagesWithEmptyBlocks} (${((summary.pagesWithEmptyBlocks / summary.totalPages) * 100).toFixed(1)}%)`);
    console.log(`Pages with Real Blocks: ${summary.pagesWithRealBlocks} (${((summary.pagesWithRealBlocks / summary.totalPages) * 100).toFixed(1)}%)`);
    console.log(`Total Pages Relying on Fallback: ${summary.pagesRelyingOnFallback} (${((summary.pagesRelyingOnFallback / summary.totalPages) * 100).toFixed(1)}%)`);

    console.log('\n=== BREAKDOWN BY TEMPLATE ===\n');
    
    const sortedTemplates = Object.entries(summary.breakdownByTemplate).sort((a, b) => b[1].totalPages - a[1].totalPages);

    for (const [templateSlug, stats] of sortedTemplates) {
      console.log(`\n--- Template: ${templateSlug} ---`);
      console.log(`  Sites: ${stats.totalSites}`);
      console.log(`  Total Pages: ${stats.totalPages}`);
      console.log(`  Pages with Empty Blocks: ${stats.pagesWithEmptyBlocks} (${((stats.pagesWithEmptyBlocks / stats.totalPages) * 100).toFixed(1)}%)`);
      console.log(`  Pages with Real Blocks: ${stats.pagesWithRealBlocks} (${((stats.pagesWithRealBlocks / stats.totalPages) * 100).toFixed(1)}%)`);
      console.log(`  Pages Relying on Fallback: ${stats.pagesRelyingOnFallback} (${((stats.pagesRelyingOnFallback / stats.totalPages) * 100).toFixed(1)}%)`);
    }

    // Sites with no template
    const sitesWithoutTemplate = results.filter(r => !r.templateSlug);
    if (sitesWithoutTemplate.length > 0) {
      console.log('\n=== SITES WITHOUT TEMPLATE ===\n');
      for (const result of sitesWithoutTemplate) {
        console.log(`- ${result.siteName} (${result.siteSlug}) - ${result.pages.length} pages`);
      }
    }

    // Export results to JSON for further analysis
    const auditOutput = {
      summary,
      results
    };

    require('fs').writeFileSync('./audit-results.json', JSON.stringify(auditOutput, null, 2));
    console.log('\n\nFull audit results exported to: audit-results.json');

  } catch (err) {
    console.error('Error during audit:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

auditAllPages();
