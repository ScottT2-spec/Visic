#!/usr/bin/env tsx
/**
 * AfroStore E2E Test Runner
 *
 * Runs all end-to-end tests against a live server.
 *
 * Usage:
 *   # Start the app first:
 *   DATABASE_URL="postgresql://..." npm run dev
 *
 *   # Then run tests:
 *   npx tsx src/__tests__/e2e/run.ts
 *
 *   # Or with custom URL:
 *   TEST_BASE_URL=http://localhost:3000 npx tsx src/__tests__/e2e/run.ts
 *
 *   # Run specific suite:
 *   npx tsx src/__tests__/e2e/run.ts --suite auth
 *   npx tsx src/__tests__/e2e/run.ts --suite products
 */

import { runAllTests } from './setup';
import { authTests } from './auth.e2e';
import { storeTests } from './stores.e2e';
import { productTests } from './products.e2e';
import { orderTests } from './orders.e2e';
import { customerAndCatalogTests } from './customers.e2e';
import { storefrontTests } from './storefront.e2e';
import { dashboardTests } from './dashboard.e2e';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const args = process.argv.slice(2);
const suiteFilter = args.includes('--suite') ? args[args.indexOf('--suite') + 1] : null;

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          AfroStore — End-to-End Test Suite              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  Target: ${BASE_URL}`);
  console.log(`  Filter: ${suiteFilter || 'ALL'}`);
  console.log(`  Time:   ${new Date().toISOString()}\n`);

  // Check server is reachable
  try {
    const res = await fetch(BASE_URL, { method: 'HEAD' }).catch(() => null);
    if (!res) {
      console.error('❌ Server not reachable at', BASE_URL);
      console.error('   Start the app first: npm run dev');
      process.exit(1);
    }
    console.log('  ✅ Server is reachable\n');
  } catch {
    console.error('❌ Server not reachable at', BASE_URL);
    process.exit(1);
  }

  // Register test suites
  const suites: Record<string, () => void> = {
    auth: authTests,
    stores: storeTests,
    products: productTests,
    orders: orderTests,
    customers: customerAndCatalogTests,
    storefront: storefrontTests,
    dashboard: dashboardTests,
  };

  if (suiteFilter) {
    const suiteFn = suites[suiteFilter];
    if (!suiteFn) {
      console.error(`❌ Unknown suite: "${suiteFilter}"`);
      console.error(`   Available: ${Object.keys(suites).join(', ')}`);
      process.exit(1);
    }
    suiteFn();
  } else {
    // Run all suites
    for (const [name, fn] of Object.entries(suites)) {
      fn();
    }
  }

  // Execute
  const result = await runAllTests();

  // Exit code
  if (result.failed > 0) {
    console.log('\n💥 Some tests failed!\n');

    if (result.errors.length > 0) {
      console.log('Failed tests:');
      for (const err of result.errors) {
        console.log(`  ❌ [${err.suite}] ${err.test}`);
        console.log(`     ${err.error}\n`);
      }
    }

    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
