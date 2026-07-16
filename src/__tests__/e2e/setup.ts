/**
 * AfroStore E2E Test Setup
 *
 * Configures the test environment:
 * - Base URL for API requests
 * - Helper functions for auth, requests, cleanup
 * - Test data factories
 *
 * Requires: A running AfroStore instance with a test database.
 * Set TEST_BASE_URL env var (defaults to http://localhost:3000).
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// ─── HTTP HELPERS ───────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  status: number;
  ok: boolean;
  body: {
    success: boolean;
    data?: T;
    error?: string;
    details?: unknown;
  };
  headers: Headers;
  cookies: Record<string, string>;
}

export async function api<T = unknown>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
  } = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (options.body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  const body = await response.json().catch(() => ({}));

  // Parse cookies from Set-Cookie header
  const cookies: Record<string, string> = {};
  const setCookies = response.headers.getSetCookie?.() || [];
  for (const cookie of setCookies) {
    const [nameValue] = cookie.split(';');
    const [name, value] = nameValue.split('=');
    if (name && value) cookies[name.trim()] = value.trim();
  }

  return {
    status: response.status,
    ok: response.ok,
    body,
    headers: response.headers,
    cookies,
  };
}

export const GET = <T = unknown>(path: string, token?: string) =>
  api<T>('GET', path, { token });

export const POST = <T = unknown>(path: string, body: unknown, token?: string) =>
  api<T>('POST', path, { body, token });

export const PUT = <T = unknown>(path: string, body: unknown, token?: string) =>
  api<T>('PUT', path, { body, token });

export const PATCH = <T = unknown>(path: string, body: unknown, token?: string) =>
  api<T>('PATCH', path, { body, token });

export const DELETE = <T = unknown>(path: string, token?: string) =>
  api<T>('DELETE', path, { token });

// ─── AUTH HELPERS ───────────────────────────────────────────

let testUserCounter = 0;

export function generateTestEmail(): string {
  testUserCounter++;
  return `test_e2e_${Date.now()}_${testUserCounter}@afrostore-test.com`;
}

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  password: string;
}

/**
 * Create a new test user and return their credentials + token.
 */
export async function createTestUser(overrides: Partial<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}> = {}): Promise<TestUser> {
  const email = overrides.email || generateTestEmail();
  const password = overrides.password || 'TestPass123!';
  const firstName = overrides.firstName || 'Test';
  const lastName = overrides.lastName || 'User';

  const res = await POST('/api/auth/signup', {
    email,
    password,
    firstName,
    lastName,
  });

  if (!res.ok) {
    throw new Error(`Failed to create test user: ${JSON.stringify(res.body)}`);
  }

  const data = res.body.data as { user: { id: string }; token: string };

  return {
    id: data.user.id,
    email,
    firstName,
    lastName,
    token: data.token,
    password,
  };
}

/**
 * Login an existing user and return the token.
 */
export async function loginUser(email: string, password: string): Promise<string> {
  const res = await POST('/api/auth/login', { email, password });
  if (!res.ok) {
    throw new Error(`Login failed: ${JSON.stringify(res.body)}`);
  }
  return (res.body.data as { token: string }).token;
}

// ─── TEST DATA FACTORIES ────────────────────────────────────

export interface TestStore {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
}

export async function createTestStore(
  token: string,
  overrides: Partial<{
    name: string;
    description: string;
    businessType: string;
    currency: string;
    country: string;
  }> = {}
): Promise<TestStore> {
  const name = overrides.name || `Test Store ${Date.now()}`;

  const res = await POST('/api/sites', {
    name,
    description: overrides.description || 'E2E test store',
    businessType: overrides.businessType || 'general',
    currency: overrides.currency || 'GHS',
    country: overrides.country || 'NG',
  }, token);

  if (!res.ok) {
    throw new Error(`Failed to create test store: ${JSON.stringify(res.body)}`);
  }

  const store = res.body.data as TestStore;
  return store;
}

export interface TestProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
}

export async function createTestProduct(
  token: string,
  siteId: string,
  overrides: Partial<{
    name: string;
    description: string;
    price: number;
    stock: number;
    status: string;
    tags: string[];
    categoryId: string;
  }> = {}
): Promise<TestProduct> {
  const res = await POST(`/api/sites/${siteId}/products`, {
    name: overrides.name || `Test Product ${Date.now()}`,
    description: overrides.description || 'A test product',
    price: overrides.price || 5000,
    stock: overrides.stock ?? 10,
    status: overrides.status || 'ACTIVE',
    tags: overrides.tags || ['test'],
    categoryId: overrides.categoryId,
  }, token);

  if (!res.ok) {
    throw new Error(`Failed to create test product: ${JSON.stringify(res.body)}`);
  }

  return res.body.data as TestProduct;
}

export async function createTestCategory(
  token: string,
  siteId: string,
  name?: string
): Promise<{ id: string; name: string; slug: string }> {
  const res = await POST(`/api/sites/${siteId}/categories`, {
    name: name || `Category ${Date.now()}`,
  }, token);

  if (!res.ok) {
    throw new Error(`Failed to create category: ${JSON.stringify(res.body)}`);
  }

  return res.body.data as { id: string; name: string; slug: string };
}

export async function createTestCustomer(
  token: string,
  siteId: string,
  overrides: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }> = {}
): Promise<{ id: string; email: string }> {
  const res = await POST(`/api/sites/${siteId}/customers`, {
    email: overrides.email || `customer_${Date.now()}@test.com`,
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'Customer',
    phone: overrides.phone,
  }, token);

  if (!res.ok) {
    throw new Error(`Failed to create customer: ${JSON.stringify(res.body)}`);
  }

  return res.body.data as { id: string; email: string };
}

export async function createTestOrder(
  token: string,
  siteId: string,
  productId: string,
  overrides: Partial<{
    email: string;
    quantity: number;
    paymentMethod: string;
  }> = {}
): Promise<{ id: string; orderNumber: string; total: number }> {
  const res = await POST(`/api/sites/${siteId}/orders`, {
    email: overrides.email || `buyer_${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: 'Buyer',
    items: [{ productId, quantity: overrides.quantity || 1 }],
    deliveryAddress: {
      line1: '123 Test Street',
      city: 'Accra',
      state: 'Accra',
      country: 'Ghana',
    },
    paymentMethod: overrides.paymentMethod || 'bank_transfer',
  }, token);

  if (!res.ok) {
    throw new Error(`Failed to create order: ${JSON.stringify(res.body)}`);
  }

  return res.body.data as { id: string; orderNumber: string; total: number };
}

// ─── ASSERTION HELPERS ──────────────────────────────────────

export function expectSuccess(res: ApiResponse, expectedStatus = 200): void {
  if (res.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus}, got ${res.status}: ${JSON.stringify(res.body)}`
    );
  }
  if (!res.body.success) {
    throw new Error(`Expected success=true: ${JSON.stringify(res.body)}`);
  }
}

export function expectError(res: ApiResponse, expectedStatus: number): void {
  if (res.status !== expectedStatus) {
    throw new Error(
      `Expected error status ${expectedStatus}, got ${res.status}: ${JSON.stringify(res.body)}`
    );
  }
}

// ─── TEST RUNNER ────────────────────────────────────────────

interface TestCase {
  name: string;
  fn: () => Promise<void>;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeAll?: () => Promise<void>;
  afterAll?: () => Promise<void>;
}

const suites: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

export function describe(name: string, fn: () => void): void {
  currentSuite = { name, tests: [] };
  fn();
  suites.push(currentSuite);
  currentSuite = null;
}

export function it(name: string, fn: () => Promise<void>): void {
  if (!currentSuite) throw new Error('it() must be called inside describe()');
  currentSuite.tests.push({ name, fn });
}

export function beforeAll(fn: () => Promise<void>): void {
  if (!currentSuite) throw new Error('beforeAll() must be called inside describe()');
  currentSuite.beforeAll = fn;
}

export function afterAll(fn: () => Promise<void>): void {
  if (!currentSuite) throw new Error('afterAll() must be called inside describe()');
  currentSuite.afterAll = fn;
}

export async function runAllTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  errors: Array<{ suite: string; test: string; error: string }>;
  durationMs: number;
}> {
  const startTime = performance.now();
  let total = 0;
  let passed = 0;
  let failed = 0;
  const errors: Array<{ suite: string; test: string; error: string }> = [];

  for (const suite of suites) {
    console.log(`\n📦 ${suite.name}`);

    if (suite.beforeAll) {
      try {
        await suite.beforeAll();
      } catch (err) {
        console.log(`  ❌ beforeAll failed: ${(err as Error).message}`);
        for (const test of suite.tests) {
          total++;
          failed++;
          errors.push({ suite: suite.name, test: test.name, error: `beforeAll failed: ${(err as Error).message}` });
        }
        continue;
      }
    }

    for (const test of suite.tests) {
      total++;
      const testStart = performance.now();
      try {
        await test.fn();
        passed++;
        const ms = Math.round(performance.now() - testStart);
        console.log(`  ✅ ${test.name} (${ms}ms)`);
      } catch (err) {
        failed++;
        const ms = Math.round(performance.now() - testStart);
        const errMsg = (err as Error).message;
        errors.push({ suite: suite.name, test: test.name, error: errMsg });
        console.log(`  ❌ ${test.name} (${ms}ms)`);
        console.log(`     ${errMsg}`);
      }
    }

    if (suite.afterAll) {
      try {
        await suite.afterAll();
      } catch {}
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Total: ${total} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log(`  Duration: ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`${'═'.repeat(60)}\n`);

  // Clear suites for re-runs
  suites.length = 0;

  return { total, passed, failed, errors, durationMs };
}
