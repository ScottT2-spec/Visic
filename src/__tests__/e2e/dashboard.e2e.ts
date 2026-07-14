/**
 * E2E Tests — Dashboard & Analytics
 *
 * Tests dashboard stats, analytics, members, themes, plugins.
 */

import {
  describe, it, beforeAll,
  GET, POST, PATCH, DELETE,
  createTestUser, createTestStore, createTestProduct, createTestOrder,
  expectSuccess, expectError,
  type TestUser, type TestStore,
} from './setup';

export function dashboardTests() {
  describe('Dashboard — Stats', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);

      // Seed some data
      const product = await createTestProduct(user.token, store.id, { price: 10000, stock: 50 });
      await createTestOrder(user.token, store.id, product.id);
      await createTestOrder(user.token, store.id, product.id);
    });

    it('should return dashboard stats', async () => {
      const res = await GET(`/api/sites/${store.id}/dashboard`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      // Stats are nested under data.stats
      const stats = data.stats || data;
      if (stats.totalOrders === undefined && stats.totalRevenue === undefined) {
        throw new Error('Dashboard should return order stats');
      }
    });
  });

  describe('Analytics — Events', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should record analytics event', async () => {
      const res = await POST(`/api/sites/${store.id}/analytics`, {
        event: 'page_view',
        page: '/products/ankara-fabric',
        sessionId: 'sess_123',
        source: 'instagram',
        device: 'mobile',
      }, user.token);

      // May return 200 or 201
      if (!res.ok) throw new Error(`Analytics event failed: ${JSON.stringify(res.body)}`);
    });

    it('should get analytics data', async () => {
      const res = await GET(`/api/sites/${store.id}/analytics`, user.token);
      expectSuccess(res);
    });
  });

  describe('Members — Team Management', () => {
    let owner: TestUser;
    let staff: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      owner = await createTestUser();
      staff = await createTestUser();
      store = await createTestStore(owner.token, { name: 'Team Store' });
    });

    it('should add a team member', async () => {
      const res = await POST(`/api/sites/${store.id}/members`, {
        email: staff.email,
        role: 'STAFF',
      }, owner.token);

      expectSuccess(res, 201);
    });

    it('should list team members', async () => {
      const res = await GET(`/api/sites/${store.id}/members`, owner.token);
      expectSuccess(res);
      const data = res.body.data as any;
      const members = Array.isArray(data) ? data : data.members || [];
      if (members.length < 2) throw new Error('Should have owner + staff member');
    });

    it('staff should access store after being added', async () => {
      const res = await GET(`/api/sites/${store.id}/products`, staff.token);
      expectSuccess(res);
    });

    it('should reject non-owner adding members', async () => {
      const newUser = await createTestUser();
      const res = await POST(`/api/sites/${store.id}/members`, {
        email: 'hacker@test.com',
        role: 'ADMIN',
      }, newUser.token);

      expectError(res, 403);
    });
  });

  describe('Themes — Management', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should list available themes', async () => {
      const res = await GET(`/api/sites/${store.id}/themes`, user.token);
      expectSuccess(res);
    });
  });

  describe('Plugins — Management', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should list available plugins', async () => {
      const res = await GET(`/api/sites/${store.id}/plugins`, user.token);
      expectSuccess(res);
    });
  });
}
