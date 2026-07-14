import "dotenv/config";
import { prisma } from "./src/lib/db";

async function checkAllTemplates() {
  console.log('Checking all templates in database...');
  
  try {
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        category: true
      },
      orderBy: { slug: 'asc' }
    });

    console.log(`\nFound ${templates.length} templates:\n`);

    for (const template of templates) {
      console.log(`- ${template.slug} (${template.name}) - Category: ${template.category}`);
    }

    // Also check which templates are actively used
    const activeTemplates = await prisma.siteTemplate.findMany({
      where: { isActive: true },
      include: {
        template: true
      },
      distinct: ['templateId']
    });

    console.log(`\n\n${activeTemplates.length} templates are actively used by sites:\n`);
    
    const usedSlugs = new Set();
    for (const st of activeTemplates) {
      if (!usedSlugs.has(st.template.slug)) {
        console.log(`- ${st.template.slug} (${st.template.name})`);
        usedSlugs.add(st.template.slug);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTemplates();
