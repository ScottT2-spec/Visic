import { prisma } from "@/lib/db";

async function main() {
  console.log("=== REVISED APPROACH FOR EDITOR PREVIEW ===\n");
  
  console.log("ISSUE: Live cosmetics shop page uses shared default rendering with");
  console.log("CosmeticsHeader/CosmeticsFooter, not a standalone component.");
  console.log("My ShopPageContent extraction was based on incorrect assumption.\n");
  
  console.log("REVISED SOLUTION:");
  console.log("Instead of extracting a standalone component, update the editor preview to:");
  console.log("1. Fetch real product/blog data for cosmetics shop/blog pages");
  console.log("2. Render the blocks (header chrome) via RenderBlocks as before");
  console.log("3. Add the real product grid/blog list below the blocks");
  console.log("4. This ensures visual parity without touching live routes\n");
  
  console.log("PROPOSED CHANGES TO /src/app/builder/preview/[siteId]/[pageSlug]/page.tsx:\n");
  
  console.log("CHANGE 1: Add state for product/blog data");
  console.log("```diff");
  console.log("+   const [productData, setProductData] = useState<any>(null);");
  console.log("+   const [blogData, setBlogData] = useState<any>(null);");
  console.log("```");
  console.log();
  
  console.log("CHANGE 2: Fetch product/blog data for cosmetics shop/blog pages");
  console.log("```diff");
  console.log("+   useEffect(() => {");
  console.log("+     if (templateSlug === 'cosmetics' && pageSlug === 'shop') {");
  console.log("+       fetch(`/api/storefront/${siteSlug}`).then(res => res.json()).then(json => {");
  console.log("+         if (json.success) setProductData(json.data);");
  console.log("+       });");
  console.log("+     }");
  console.log("+     if (templateSlug === 'cosmetics' && pageSlug === 'blog') {");
  console.log("+       fetch(`/api/storefront/${siteSlug}/blog`).then(res => res.json()).then(json => {");
  console.log("+         if (json.success) setBlogData(json.data);");
  console.log("+       });");
  console.log("+     }");
  console.log("+   }, [siteSlug, templateSlug, pageSlug]);");
  console.log("```");
  console.log();
  
  console.log("CHANGE 3: Add product grid/blog list rendering after blocks");
  console.log("```diff");
  console.log("+   // Render product grid for cosmetics shop pages");
  console.log("+   const renderProductGrid = () => {");
  console.log("+     if (templateSlug !== 'cosmetics' || pageSlug !== 'shop' || !productData) return null;");
  console.log("+     const products = productData.products || [];");
  console.log("+     return (");
  console.log("+       <div className='max-w-[1222px] mx-auto px-4 pb-16'>");
  console.log("+         <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>");
  console.log("+           {products.map((p: any) => (");
  console.log("+             <div key={p.id} className='group'>");
  console.log("+               <Link href={\\`/store/${storeSlug}/product/${p.slug}\\`} className='block'>");
  console.log("+                 <div className='relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-white'>");
  console.log("+                   {p.images?.[0]?.url ? (");
  console.log("+                     <img src={p.images[0].url} alt={p.name} className='w-full h-full object-cover' />");
  console.log("+                   ) : (");
  console.log("+                     <div className='w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center'>");
  console.log("+                       <span className='text-white/40 text-4xl font-bold'>{p.name.charAt(0)}</span>");
  console.log("+                     </div>");
  console.log("+                   )}");
  console.log("+                 </div>");
  console.log("+                 <h3 className='text-sm font-semibold'>{p.name}</h3>");
  console.log("+                 <p className='text-base font-bold'>₦{Number(p.price).toLocaleString()}</p>");
  console.log("+               </Link>");
  console.log("+             </div>");
  console.log("+           ))}");
  console.log("+         </div>");
  console.log("+       </div>");
  console.log("+     );");
  console.log("+   };");
  console.log("+");
  console.log("+   // Render blog list for cosmetics blog pages");
  console.log("+   const renderBlogList = () => {");
  console.log("+     if (templateSlug !== 'cosmetics' || pageSlug !== 'blog' || !blogData) return null;");
  console.log("+     const blogs = blogData.blogs || [];");
  console.log("+     return (");
  console.log("+       <div className='max-w-[1222px] mx-auto px-4 pb-16'>");
  console.log("+         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>");
  console.log("+           {blogs.map((b: any) => (");
  console.log("+             <Link key={b.id} href={\\`/store/${storeSlug}/blog/${b.slug}\\`} className='block group'>");
  console.log("+               <div className='rounded-2xl overflow-hidden bg-white shadow-sm'>");
  console.log("+                 {b.coverImage ? (");
  console.log("+                   <img src={b.coverImage} alt={b.title} className='w-full aspect-[16/10] object-cover' />");
  console.log("+                 ) : (");
  console.log("+                   <div className='w-full aspect-[16/10] bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center'>");
  console.log("+                     <span className='text-white/40 text-4xl font-bold'>{b.title.charAt(0)}</span>");
  console.log("+                   </div>");
  console.log("+                 )}");
  console.log("+                 <div className='p-6'>");
  console.log("+                   <h2 className='font-bold text-lg'>{b.title}</h2>");
  console.log("+                   {b.excerpt && <p className='text-sm text-gray-600 mt-2'>{b.excerpt}</p>}");
  console.log("+                 </div>");
  console.log("+               </div>");
  console.log("+             </Link>");
  console.log("+           ))}");
  console.log("+         </div>");
  console.log("+       </div>");
  console.log("+     );");
  console.log("+   };");
  console.log("```");
  console.log();
  
  console.log("CHANGE 4: Add the renders after the main content blocks");
  console.log("```diff");
  console.log("+         {renderProductGrid()}");
  console.log("+         {renderBlogList()}");
  console.log("```");
  console.log();
  
  console.log("This approach:");
  console.log("- Keeps live routes completely unchanged");
  console.log("- Adds real product/blog data to editor preview");
  console.log("- Ensures visual parity between editor and live");
  console.log("- Is simpler and less error-prone than component extraction");
}

main().catch(console.error);
