import "dotenv/config";

async function checkTermsBlocks(siteSlug: string) {
  const url = `http://localhost:3000/api/storefront/${siteSlug}/pages/terms`;
  const res = await fetch(url);
  const data = await res.json();
  
  console.log(`\n=== ${siteSlug} terms page ===`);
  console.log(`Status: ${res.status}`);
  
  if (data.success && data.data) {
    const page = data.data.page;
    const blocks = page.content?.blocks || [];
    console.log(`Total blocks: ${blocks.length}`);
    
    // Find info boxes blocks
    const infoBoxBlocks = blocks.filter((b: any) => b.type === 'cosmeticsInfoBoxes');
    console.log(`Info box blocks: ${infoBoxBlocks.length}`);
    
    if (infoBoxBlocks.length > 0) {
      infoBoxBlocks.forEach((block: any, i: number) => {
        const boxes = block.props?.boxes || [];
        console.log(`  Block ${i}: ${boxes.length} boxes`);
        boxes.forEach((box: any, j: number) => {
          console.log(`    Box ${j}: ${box.number} - ${box.title} - hasImage: ${!!box.image}`);
        });
      });
    }
  }
}

async function main() {
  await checkTermsBlocks('cosmetics');
  await checkTermsBlocks('cosmetics1');
  await checkTermsBlocks('stacj');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
