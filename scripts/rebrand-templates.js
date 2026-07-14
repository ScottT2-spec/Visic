#!/usr/bin/env node

/**
 * Surgical Template Rebranding Script
 * 
 * This script performs clean branding changes from Woodmart → Prokip Ltd
 * while preserving all technical infrastructure (CSS classes, fonts, paths).
 * 
 * RULES:
 * - Replace visible branding only (WoodMart → Prokip Ltd, woodmart → prokip in text)
 * - Update URLs to https://prokip.africa/
 * - DO NOT touch CSS class names (woodmart-*, wd-*)
 * - DO NOT touch font references or core asset paths
 * - Preserve all WordPress/WooCommerce infrastructure
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIRS = [
  '/Users/mav/Documents/afrostore/extracted-templates',
  '/Users/mav/Documents/afrostore/public/templates'
];

// Surgical replacements - ONLY visible branding and URLs
const REPLACEMENTS = [
  // Visible branding - case sensitive to avoid breaking CSS classes
  {
    pattern: /WoodMart/g,
    replacement: 'Prokip Ltd',
    description: 'Visible WoodMart brand name'
  },
  {
    pattern: /Woodmart/g,
    replacement: 'Prokip Ltd',
    description: 'Visible Woodmart brand name (capitalized)'
  },
  // Replace woodmart with prokip ONLY in visible text contexts
  // We'll use context-aware replacements below
  {
    pattern: /woodmart\.xtemos\.com/g,
    replacement: 'prokip.africa',
    description: 'Domain URLs'
  },
  {
    pattern: /https:\/\/woodmart\.xtemos\.com/g,
    replacement: 'https://prokip.africa',
    description: 'Full URLs'
  },
  {
    pattern: /http:\/\/woodmart\.xtemos\.com/g,
    replacement: 'https://prokip.africa',
    description: 'HTTP URLs to HTTPS'
  },
  // Xtemos branding
  {
    pattern: /Xtemos/g,
    replacement: 'Prokip Ltd',
    description: 'Xtemos company name'
  },
  {
    pattern: /xtemos\.com/g,
    replacement: 'prokip.africa',
    description: 'Xtemos domain'
  },
  // Demo references
  {
    pattern: /WoodMart Demos/g,
    replacement: 'Prokip Ltd Demos',
    description: 'Demo titles'
  },
  // Footer copyright
  {
    pattern: /WoodMart\. (\d{4}) created by Prokip Ltd\./g,
    replacement: 'Prokip Ltd. $1',
    description: 'Footer copyright'
  },
  // Schema.org JSON-LD - update URLs but keep structure
  {
    pattern: /"url":"https:\/\/woodmart\.xtemos\.com\/[^"]+"/g,
    replacement: (match) => match.replace('woodmart.xtemos.com', 'prokip.africa'),
    description: 'Schema.org URLs'
  },
];

// Context-aware replacements for "woodmart" → "prokip" in visible text
// This avoids breaking CSS classes and font references
const CONTEXTUAL_REPLACEMENTS = [
  // Replace in title tags and meta tags
  {
    pattern: /(<title>.*?)(woodmart)(.*?<\/title>)/gis,
    replacement: '$1prokip$3',
    description: 'Title tags'
  },
  {
    pattern: /(meta name="description" content=".*?)(woodmart)(.*?")/gis,
    replacement: '$1prokip$3',
    description: 'Meta descriptions'
  },
  {
    pattern: /(meta property="og:title" content=".*?)(woodmart)(.*?")/gis,
    replacement: '$1prokip$3',
    description: 'OG titles'
  },
  // Replace in visible text content (not in URLs or CSS)
  {
    pattern: /(>)([^<]*)(woodmart)([^<]*)(<)/g,
    replacement: (match, p1, p2, p3, p4, p5) => {
      // Skip if it looks like a URL or CSS class
      if (p2.includes('http') || p2.includes('url') || p2.includes('href') || 
          p2.includes('src') || p2.includes('class') || p2.includes('font')) {
        return match;
      }
      return p1 + p2 + 'prokip' + p4 + p5;
    },
    description: 'Visible text content'
  },
];

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply standard replacements
  for (const { pattern, replacement, description } of REPLACEMENTS) {
    const originalContent = content;
    content = content.replace(pattern, replacement);
    if (content !== originalContent) {
      console.log(`  ✓ Applied: ${description}`);
      modified = true;
    }
  }
  
  // Apply contextual replacements
  for (const { pattern, replacement, description } of CONTEXTUAL_REPLACEMENTS) {
    const originalContent = content;
    content = content.replace(pattern, replacement);
    if (content !== originalContent) {
      console.log(`  ✓ Applied: ${description}`);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ File updated`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
  
  return modified;
}

function processDirectory(dir) {
  console.log(`\n📁 Processing directory: ${dir}`);
  
  const files = [];
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  
  console.log(`Found ${files.length} HTML files`);
  
  let modifiedCount = 0;
  for (const file of files) {
    if (processFile(file)) {
      modifiedCount++;
    }
  }
  
  console.log(`\n✅ Modified ${modifiedCount} files in ${dir}`);
  return modifiedCount;
}

function main() {
  console.log('🚀 Starting surgical template rebranding...\n');
  console.log('RULES:');
  console.log('  • Replace visible branding: WoodMart → Prokip Ltd');
  console.log('  • Update URLs to https://prokip.africa/');
  console.log('  • Preserve CSS classes (woodmart-*, wd-*)');
  console.log('  • Preserve font references and asset paths');
  console.log('  • Preserve WordPress/WooCommerce infrastructure\n');
  
  let totalModified = 0;
  
  for (const dir of TEMPLATE_DIRS) {
    if (fs.existsSync(dir)) {
      totalModified += processDirectory(dir);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  }
  
  console.log(`\n🎉 Rebranding complete! Total files modified: ${totalModified}`);
}

main();
