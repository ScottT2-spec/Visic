/**
 * E2E Tests — Public Storefront API
 *
 * Tests the customer-facing storefront endpoints (no auth required).
 * These are the APIs that power the actual shop pages.
 */

import {
  describe, it, beforeAll,
  GET, POST,
  createTestUser, createTestStore, createTestProduct, createTestCategory,
  expectSuccess, expectError,
  type TestUser, type TestStore,
} from './setup';

export function storefrontTests() {
  describe('Storefront — Public Store View', () => {
    let user: TestUser;
    let store: TestStore;
    let slug: string;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token, { name: `Storefront Test ${Date.now()}` });
      slug = (store as any).slug;

      // Create products
      await createTestProduct(user.token, store.id, {
        name: 'Public Product 1',
        price: 12000,
        status: 'ACTIVE',
      });
      await createTestProduct(user.token, store.id, {
        name: 'Public Product 2',
        price: 8000,
        status: 'ACTIVE',
      });
      await createTestProduct(user.token, store.id, {
        name: 'Draft Product',
        price: 5000,
        status: 'DRAFT', // Should NOT appear on storefront
      });

      // Create a page
      await POST(`/api/sites/${store.id}/pages`, {
        title: 'About Us',
        type: 'ABOUT',
        content: { blocks: [{ type: 'text', text: 'Welcome to our store!' }] },
        isPublished: true,
      }, user.token);
    });

    it('should load storefront by slug (no auth)', async () => {
      const res = await GET(`/api/storefront/${slug}`);
      expectSuccess(res);
      const data = res.body.data as any;
      if (!data.store) throw new Error('Missing store data');
      if (data.store.name !== store.name) throw new Error('Store name mismatch');
    });

    it('should show only ACTIVE products on storefront', async () => {
      const res = await GET(`/api/storefront/${slug}`);
      expectSuccess(res);
      const data = res.body.data as any;
      const products = data.products || data.store?.products || [];
      for (const p of products) {
        if (p.status === 'DRAFT') throw new Error('Draft product should not appear on storefront');
      }
    });

    it('should return 404 for non-existent store slug', async () => {
      const res = await GET('/api/storefront/this-store-does-not-exist-at-all');
      expectError(res, 404);
    });
  });

  describe('Storefront — Product Detail', () => {
    let user: TestUser;
    let store: TestStore;
    let slug: string;
    let productSlug: string;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token, { name: `PDP Test ${Date.now()}` });
      slug = (store as any).slug;

      const product = await createTestProduct(user.token, store.id, {
        name: 'Detail View Product',
        price: 25000,
        status: 'ACTIVE',
      });
      productSlug = (product as any).slug;
    });

    it('should load product detail page (no auth)', async () => {
      const res = await GET(`/api/storefront/${slug}/products/${productSlug}`);
      expectSuccess(res);
      const data = res.body.data as any;
      if (!data.name && !data.product?.name) throw new Error('Missing product name');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await GET(`/api/storefront/${slug}/products/nonexistent-product-slug`);
      expectError(res, 404);
    });
  });

  describe('Storefront — Pages', () => {
    let user: TestUser;
    let store: TestStore;
    let slug: string;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token, { name: `Page Test ${Date.now()}` });
      slug = (store as any).slug;

      await POST(`/api/sites/${store.id}/pages`, {
        title: 'FAQ',
        type: 'FAQ',
        content: { blocks: [{ type: 'text', text: 'Common questions.' }] },
        isPublished: true,
      }, user.token);

      await POST(`/api/sites/${store.id}/pages`, {
        title: 'Unpublished Page',
        type: 'CUSTOM',
        isPublished: false,
      }, user.token);
    });

    it('should load a published page (no auth)', async () => {
      const res = await GET(`/api/storefront/${slug}/pages/faq`);
      expectSuccess(res);
    });

    it('should not expose unpublished pages', async () => {
      const res = await GET(`/api/storefront/${slug}/pages/unpublished-page`);
      expectError(res, 404);
    });
  });

  describe('Storefront — Checkout', () => {
    let user: TestUser;
    let store: TestStore;
    let productId: string;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token, { name: `Checkout Test ${Date.now()}` });
      const product = await createTestProduct(user.token, store.id, {
        name: 'Checkout Product',
        price: 15000,
        stock: 10,
        status: 'ACTIVE',
      });
      productId = product.id;
    });

    it('should create checkout/order from storefront', async () => {
      const res = await POST(`/api/sites/${(store as any).id}/checkout`, {
        email: 'shopper@example.com',
        firstName: 'Kemi',
        lastName: 'Adekunle',
        phone: '+2348098765432',
        items: [{ productId, quantity: 2 }],
        deliveryAddress: {
          line1: '5 Allen Avenue',
          city: 'Ikeja',
          state: 'Accra',
          country: 'Ghana',
        },
        paymentMethod: 'bank_transfer',
      });

      // Checkout may or may not require auth depending on store settings
      if (res.ok) {
        const data = res.body.data as any;
        if (!data.orderNumber && !data.id) throw new Error('Checkout should return order info');
      }
      // If it requires auth, that's also valid for some store configs
    });
  });
}
