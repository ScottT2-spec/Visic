/**
 * E2E Tests — Customer, Category, Coupon, Delivery Zone, Review Management
 */

import {
  describe, it, beforeAll,
  GET, POST, PATCH, DELETE,
  createTestUser, createTestStore, createTestProduct, createTestCustomer,
  expectSuccess, expectError,
  type TestUser, type TestStore,
} from './setup';

export function customerAndCatalogTests() {
  // ─── CUSTOMERS ────────────────────────────────────────

  describe('Customers — CRUD', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should create a customer', async () => {
      const res = await POST(`/api/sites/${store.id}/customers`, {
        email: 'amara@example.com',
        firstName: 'Amara',
        lastName: 'Okafor',
        phone: '+2348012345678',
        tags: ['vip'],
      }, user.token);

      expectSuccess(res, 201);
      const data = res.body.data as any;
      if (data.email !== 'amara@example.com') throw new Error('Email mismatch');
    });

    it('should list customers', async () => {
      await createTestCustomer(user.token, store.id);
      const res = await GET(`/api/sites/${store.id}/customers`, user.token);
      expectSuccess(res);
    });

    it('should reject duplicate customer email per store', async () => {
      const email = `dup_${Date.now()}@test.com`;
      await POST(`/api/sites/${store.id}/customers`, {
        email, firstName: 'A', lastName: 'B',
      }, user.token);

      const res = await POST(`/api/sites/${store.id}/customers`, {
        email, firstName: 'C', lastName: 'D',
      }, user.token);

      // Should be 409 or 400
      if (res.ok) throw new Error('Should reject duplicate customer email');
    });
  });

  // ─── CATEGORIES ───────────────────────────────────────

  describe('Categories — CRUD', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should create a category', async () => {
      const res = await POST(`/api/sites/${store.id}/categories`, {
        name: 'Electronics',
        description: 'Phones, laptops, accessories',
      }, user.token);

      expectSuccess(res, 201);
      const data = res.body.data as any;
      if (data.name !== 'Electronics') throw new Error('Name mismatch');
      if (!data.slug) throw new Error('Missing slug');
    });

    it('should create nested category', async () => {
      const parent = await POST(`/api/sites/${store.id}/categories`, {
        name: 'Fashion',
      }, user.token);
      const parentId = (parent.body.data as any).id;

      const res = await POST(`/api/sites/${store.id}/categories`, {
        name: 'Shoes',
        parentId,
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should list categories', async () => {
      const res = await GET(`/api/sites/${store.id}/categories`, user.token);
      expectSuccess(res);
    });
  });

  // ─── COUPONS ──────────────────────────────────────────

  describe('Coupons — CRUD', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should create a percentage coupon', async () => {
      const res = await POST(`/api/sites/${store.id}/coupons`, {
        code: 'SAVE20',
        type: 'PERCENTAGE',
        value: 20,
        minOrderAmount: 10000,
      }, user.token);

      expectSuccess(res, 201);
      const data = res.body.data as any;
      if (data.code !== 'SAVE20') throw new Error('Code mismatch');
    });

    it('should create a fixed amount coupon', async () => {
      const res = await POST(`/api/sites/${store.id}/coupons`, {
        code: 'FLAT5000',
        type: 'FIXED',
        value: 5000,
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should create a free shipping coupon', async () => {
      const res = await POST(`/api/sites/${store.id}/coupons`, {
        code: 'FREESHIP',
        type: 'FREE_SHIPPING',
        value: 0.01, // Required by validator but irrelevant for free shipping
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should list coupons', async () => {
      const res = await GET(`/api/sites/${store.id}/coupons`, user.token);
      expectSuccess(res);
    });

    it('should uppercase coupon code', async () => {
      const res = await POST(`/api/sites/${store.id}/coupons`, {
        code: 'lowercase',
        type: 'PERCENTAGE',
        value: 10,
      }, user.token);

      expectSuccess(res, 201);
      const data = res.body.data as any;
      if (data.code !== 'LOWERCASE') throw new Error('Code should be uppercased');
    });
  });

  // ─── DELIVERY ZONES ──────────────────────────────────

  describe('Delivery Zones — CRUD', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should create delivery zone for Lagos Mainland', async () => {
      const res = await POST(`/api/sites/${store.id}/delivery-zones`, {
        name: 'Lagos Mainland',
        areas: ['Yaba', 'Surulere', 'Ikeja', 'Mushin', 'Oshodi'],
        fee: 2000,
        freeAbove: 50000,
        estimatedDays: '1-2 days',
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should create delivery zone for Lagos Island', async () => {
      const res = await POST(`/api/sites/${store.id}/delivery-zones`, {
        name: 'Lagos Island',
        areas: ['Victoria Island', 'Lekki', 'Ikoyi', 'Ajah'],
        fee: 3500,
        freeAbove: 75000,
        estimatedDays: '1-2 days',
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should list delivery zones', async () => {
      const res = await GET(`/api/sites/${store.id}/delivery-zones`, user.token);
      expectSuccess(res);
    });
  });

  // ─── REVIEWS ──────────────────────────────────────────

  describe('Reviews — CRUD', () => {
    let user: TestUser;
    let store: TestStore;
    let productId: string;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
      const product = await createTestProduct(user.token, store.id, { name: 'Reviewed Product', status: 'ACTIVE' });
      productId = product.id;
    });

    it('should create a review', async () => {
      const res = await POST(`/api/sites/${store.id}/reviews`, {
        productId,
        name: 'Happy Customer',
        email: 'happy@test.com',
        rating: 5,
        title: 'Amazing quality!',
        body: 'The product exceeded my expectations. Delivery was fast too.',
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should reject review with invalid rating', async () => {
      const res = await POST(`/api/sites/${store.id}/reviews`, {
        productId,
        name: 'Bad Rating',
        email: 'bad@test.com',
        rating: 10, // Max is 5
      }, user.token);

      expectError(res, 422);
    });

    it('should list reviews', async () => {
      const res = await GET(`/api/sites/${store.id}/reviews`, user.token);
      expectSuccess(res);
    });
  });

  // ─── PAGES ────────────────────────────────────────────

  describe('Pages — CRUD', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should create an about page', async () => {
      const res = await POST(`/api/sites/${store.id}/pages`, {
        title: 'About Us',
        type: 'ABOUT',
        content: { blocks: [{ type: 'text', text: 'We are a Lagos-based fashion brand.' }] },
        isPublished: true,
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should create a custom landing page', async () => {
      const res = await POST(`/api/sites/${store.id}/pages`, {
        title: 'Valentine Sale 2026',
        type: 'LANDING',
        isPublished: false,
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should list pages', async () => {
      const res = await GET(`/api/sites/${store.id}/pages`, user.token);
      expectSuccess(res);
    });
  });

  // ─── PAYMENT GATEWAYS ────────────────────────────────

  describe('Payment Gateways — Setup', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should setup Paystack gateway', async () => {
      const res = await POST(`/api/sites/${store.id}/payment-gateways`, {
        provider: 'PAYSTACK',
        publicKey: 'pk_test_xxx',
        secretKey: 'sk_test_xxx',
      }, user.token);

      expectSuccess(res, 201);
    });

    it('should list payment gateways', async () => {
      const res = await GET(`/api/sites/${store.id}/payment-gateways`, user.token);
      expectSuccess(res);
    });
  });
}
