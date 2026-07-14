import "dotenv/config";

async function verifyTermsRender(siteSlug: string) {
  const url = `http://localhost:3000/store/${siteSlug}/terms`;
  const res = await fetch(url);
  const text = await res.text();
  
  console.log(`\n=== ${siteSlug} terms page render ===`);
  console.log(`Status: ${res.status}`);
  
  // Count occurrences of box titles
  const titles = [
    "General Terms",
    "Products & Pricing",
    "Orders & Payment",
    "Shipping & Delivery",
    "Returns & Refunds",
    "Privacy & Data",
    "Cookies",
    "Limitation of Liability",
    "Contact Information"
  ];
  
  let foundCount = 0;
  titles.forEach(title => {
    const count = (text.match(new RegExp(title, 'g')) || []).length;
    if (count > 0) {
      console.log(`✓ ${title}: ${count} occurrence(s)`);
      foundCount++;
    } else {
      console.log(`✗ ${title}: NOT FOUND`);
    }
  });
  
  console.log(`\nTotal titles found: ${foundCount}/9`);
  
  // Check for cib-card class (should be 9 if all boxes render)
  const cardCount = (text.match(/cib-card/g) || []).length;
  console.log(`cib-card elements: ${cardCount}`);
}

async function main() {
  await verifyTermsRender('cosmetics');
  await verifyTermsRender('stacj');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
