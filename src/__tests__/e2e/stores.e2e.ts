/**
 * E2E Tests — Store Management
 *
 * Tests store CRUD, settings, multi-tenant isolation.
 */

import {
  describe, it, beforeAll,
  GET, POST, PUT, PATCH, DELETE,
  createTestUser, createTestStore,
  expectSuccess, expectError,
  type TestUser, type TestStore,
} from './setup';

export function storeTests() {
  describe('Stores — Create', () => {
    let user: TestUser;

    beforeAll(async () => {
      user = await createTestUser();
    });

    it('should create a store with valid data', async () => {
      const res = await POST('/api/sites', {
        name: 'Accra Fashion Hub',
        description: 'Premium ankara and fashion',
        businessType: 'fashion',
        currency: 'GHS',
        country: 'GH',
      }, user.token);

      expectSuccess(res, 201);
      const store = res.body.data as any;
      if (!store.id) throw new Error('Missing store id');
      if (store.name !== 'Accra Fashion Hub') throw new Error('Name mismatch');
      if (!store.subdomain) throw new Error('Missing subdomain');
      if (!store.settings) throw new Error('Missing default settings');
    });

    it('should auto-generate subdomain from name', async () => {
      const res = await POST('/api/sites', {
        name: 'My Amazing Store 2026',
      }, user.token);

      expectSuccess(res, 201);
      const store = res.body.data as any;
      if (!store.subdomain.includes('my-amazing')) throw new Error('Subdomain not derived from name');
    });

    it('should reject store creation without auth', async () => {
      const res = await POST('/api/sites', { name: 'No Auth Store' });
      expectError(res, 401);
    });

    it('should reject store without name', async () => {
      const res = await POST('/api/sites', {}, user.token);
      expectError(res, 422);
    });

    it('should create default settings on store creation', async () => {
      const res = await POST('/api/sites', {
        name: 'Settings Test Store',
      }, user.token);

      expectSuccess(res, 201);
      const store = res.body.data as any;
      if (store.settings.allowGuestCheckout !== true) throw new Error('Guest checkout should default true');
      if (store.settings.payOnDelivery !== true) throw new Error('Pay on delivery should default true');
      if (store.settings.whatsappOrdering !== true) throw new Error('WhatsApp ordering should default true');
    });
  });

  describe('Stores — List & Get', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token, { name: 'List Test Store' });
    });

    it('should list user stores', async () => {
      const res = await GET('/api/sites', user.token);
      expectSuccess(res);
      const stores = res.body.data as any[];
      if (!Array.isArray(stores)) throw new Error('Expected array');
      if (stores.length < 1) throw new Error('Should have at least 1 store');
      const found = stores.find((s: any) => s.id === store.id);
      if (!found) throw new Error('Created store not in list');
    });

    it('should get a specific store', async () => {
      const res = await GET(`/api/sites/${store.id}`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      if (data.id !== store.id) throw new Error('Store id mismatch');
    });

    it('should not list stores from another user', async () => {
      const otherUser = await createTestUser();
      const res = await GET('/api/sites', otherUser.token);
      expectSuccess(res);
      const stores = res.body.data as any[];
      const found = stores.find((s: any) => s.id === store.id);
      if (found) throw new Error('Should not see other user store');
    });
  });

  describe('Stores — Update', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should update store name', async () => {
      const res = await PATCH(`/api/sites/${store.id}`, {
        name: 'Updated Store Name',
      }, user.token);

      expectSuccess(res);
      const data = res.body.data as any;
      if (data.name !== 'Updated Store Name') throw new Error('Name not updated');
    });

    it('should reject update from non-owner', async () => {
      const otherUser = await createTestUser();
      const res = await PATCH(`/api/sites/${store.id}`, {
        name: 'Hacked Name',
      }, otherUser.token);

      expectError(res, 403);
    });
  });

  describe('Stores — Settings', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should get store settings', async () => {
      const res = await GET(`/api/sites/${store.id}/settings`, user.token);
      expectSuccess(res);
    });

    it('should update store settings', async () => {
      const res = await PATCH(`/api/sites/${store.id}/settings`, {
        whatsappNumber: '+2348012345678',
        payOnDelivery: false,
        language: 'pcm', // Pidgin
      }, user.token);

      expectSuccess(res);
    });
  });

  describe('Stores — Multi-Tenant Isolation', () => {
    let user1: TestUser;
    let user2: TestUser;
    let store1: TestStore;
    let store2: TestStore;

    beforeAll(async () => {
      user1 = await createTestUser();
      user2 = await createTestUser();
      store1 = await createTestStore(user1.token, { name: 'User1 Store' });
      store2 = await createTestStore(user2.token, { name: 'User2 Store' });
    });

    it('user1 cannot access user2 store products', async () => {
      const res = await GET(`/api/sites/${store2.id}/products`, user1.token);
      expectError(res, 403);
    });

    it('user2 cannot access user1 store orders', async () => {
      const res = await GET(`/api/sites/${store1.id}/orders`, user2.token);
      expectError(res, 403);
    });

    it('user1 cannot create product in user2 store', async () => {
      const res = await POST(`/api/sites/${store2.id}/products`, {
        name: 'Injected Product',
        price: 1000,
      }, user1.token);
      expectError(res, 403);
    });
  });
}
