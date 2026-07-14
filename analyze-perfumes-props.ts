import fs from 'fs';
import path from 'path';

// Load backup data
const backupPath = path.join(process.cwd(), 'perfumes-chrome-backup.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

console.log('=== ANALYZING PERFUMES HEADER/FOOTER PROPS VARIATION ===\n');

// Group by site
const sites = new Map<string, any[]>();
backupData.forEach(record => {
  if (!sites.has(record.siteId)) {
    sites.set(record.siteId, []);
  }
  sites.get(record.siteId)!.push(record);
});

// Analyze each site
for (const [siteId, records] of sites) {
  const siteName = records[0].siteName;
  console.log(`=== SITE: ${siteName} (${siteId}) ===`);
  
  const headerRecords = records.filter(r => r.blockType === 'perfumesHeader');
  const footerRecords = records.filter(r => r.blockType === 'perfumesFooter');
  
  console.log(`\nperfumesHeader (${headerRecords.length} pages):`);
  
  // Check for categories presence
  const withCategories = headerRecords.filter(r => r.props.categories);
  const withoutCategories = headerRecords.filter(r => !r.props.categories);
  
  console.log(`  With categories: ${withCategories.length}`);
  console.log(`  Without categories: ${withoutCategories.length}`);
  
  if (withCategories.length > 0) {
    // Check if categories are identical across all
    const firstCategories = JSON.stringify(withCategories[0].props.categories);
    const allIdentical = withCategories.every(r => JSON.stringify(r.props.categories) === firstCategories);
    
    console.log(`  Categories identical across pages: ${allIdentical ? 'YES' : 'NO'}`);
    
    if (allIdentical) {
      console.log(`  Categories content:`);
      withCategories[0].props.categories.forEach((cat: any) => {
        console.log(`    - ${cat.name} (${cat.slug})`);
      });
    } else {
      console.log(`  WARNING: Categories differ across pages!`);
      withCategories.forEach(r => {
        console.log(`    ${r.pageTitle}:`, JSON.stringify(r.props.categories));
      });
    }
  }
  
  console.log(`\nperfumesFooter (${footerRecords.length} pages):`);
  
  // Check for description presence
  const withDescription = footerRecords.filter(r => r.props.description);
  const withoutDescription = footerRecords.filter(r => !r.props.description);
  
  console.log(`  With description: ${withDescription.length}`);
  console.log(`  Without description: ${withoutDescription.length}`);
  
  if (withDescription.length > 0) {
    // Check if descriptions are identical across all
    const firstDescription = withDescription[0].props.description;
    const allIdentical = withDescription.every(r => r.props.description === firstDescription);
    
    console.log(`  Description identical across pages: ${allIdentical ? 'YES' : 'NO'}`);
    
    if (allIdentical) {
      console.log(`  Description content: "${firstDescription}"`);
    } else {
      console.log(`  WARNING: Descriptions differ across pages!`);
      withDescription.forEach(r => {
        console.log(`    ${r.pageTitle}: "${r.props.description}"`);
      });
    }
  }
  
  console.log('\n---\n');
}

// Show proposed normalization props
console.log('=== PROPOSED NORMALIZATION PROPS ===\n');

const sampleHeaderWithCategories = backupData.find(r => 
  r.blockType === 'perfumesHeader' && r.props.categories
);

const sampleFooterWithDescription = backupData.find(r => 
  r.blockType === 'perfumesFooter' && r.props.description
);

console.log('perfumesHeader (most complete):');
console.log(JSON.stringify(sampleHeaderWithCategories?.props, null, 2));

console.log('\nperfumesFooter (most complete):');
console.log(JSON.stringify(sampleFooterWithDescription?.props, null, 2));
