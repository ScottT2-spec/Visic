/**
 * E2E Tests — Product Management
 *
 * Tests product CRUD, variants, images, search, categories, pagination.
 */

import {
  describe, it, beforeAll,
  GET, POST, PUT, PATCH, DELETE,
  createTestUser, createTestStore, createTestProduct, createTestCategory,
  expectSuccess, expectError,
  type TestUser, type TestStore, type TestProduct,
} from './setup';

export function productTests() {
  describe('Products — Create', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
    });

    it('should create a simple product', async () => {
      const res = await POST(`/api/sites/${store.id}/products`, {
        name: 'Premium Ankara Fabric',
        description: 'Beautiful 6-yard ankara fabric',
        price: 15000,
        stock: 50,
        status: 'ACTIVE',
        tags: ['ankara', 'fabric', 'fashion'],
      }, user.token);

      expectSuccess(res, 201);
      const product = res.body.data as any;
      if (product.name !== 'Premium Ankara Fabric') throw new Error('Name mismatch');
      if (product.price !== 15000) throw new Error('Price mismatch');
      if (!product.slug) throw new Error('Missing auto-generated slug');
    });

    it('should create product with variants', async () => {
      const res = await POST(`/api/sites/${store.id}/products`, {
        name: 'T-Shirt',
        price: 5000,
        stock: 100,
        variants: [
          { name: 'Small Red', sku: 'TS-S-R', price: 5000, stock: 30, options: { size: 'S', color: 'Red' } },
          { name: 'Medium Blue', sku: 'TS-M-B', price: 5500, stock: 40, options: { size: 'M', color: 'Blue' } },
          { name: 'Large Black', sku: 'TS-L-BK', price: 6000, stock: 30, options: { size: 'L', color: 'Black' } },
        ],
      }, user.token);

      expectSuccess(res, 201);
      const product = res.body.data as any;
      if (!product.variants || product.variants.length !== 3) throw new Error('Expected 3 variants');
    });

    it('should create product with images', async () => {
      const res = await POST(`/api/sites/${store.id}/products`, {
        name: 'Bag with Images',
        price: 25000,
        images: [
          { url: 'https://example.com/img1.jpg', alt: 'Front view' },
          { url: 'https://example.com/img2.jpg', alt: 'Side view' },
        ],
      }, user.token);

      expectSuccess(res, 201);
      const product = res.body.data as any;
      if (!product.images || product.images.length !== 2) throw new Error('Expected 2 images');
    });

    it('should create product with category', async () => {
      const category = await createTestCategory(user.token, store.id, 'Shoes');

      const res = await POST(`/api/sites/${store.id}/products`, {
        name: 'Running Shoes',
        price: 35000,
        categoryId: category.id,
      }, user.token);

      expectSuccess(res, 201);
      const product = res.body.data as any;
      if (!product.category) throw new Error('Category not linked');
      if (product.category.name !== 'Shoes') throw new Error('Category name mismatch');
    });

    it('should reject product without name', async () => {
      const res = await POST(`/api/sites/${store.id}/products`, {
        price: 5000,
      }, user.token);

      expectError(res, 422);
    });

    it('should reject product with negative price', async () => {
      const res = await POST(`/api/sites/${store.id}/products`, {
        name: 'Bad Price Product',
        price: -100,
      }, user.token);

      expectError(res, 422);
    });

    it('should auto-generate unique slugs for duplicate names', async () => {
      await POST(`/api/sites/${store.id}/products`, {
        name: 'Duplicate Name',
        price: 1000,
      }, user.token);

      const res = await POST(`/api/sites/${store.id}/products`, {
        name: 'Duplicate Name',
        price: 2000,
      }, user.token);

      expectSuccess(res, 201);
      const product = res.body.data as any;
      if (product.slug === 'duplicate-name') throw new Error('Slug should be unique');
    });
  });

  describe('Products — List & Search', () => {
    let user: TestUser;
    let store: TestStore;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);

      // Create test products
      for (let i = 0; i < 5; i++) {
        await createTestProduct(user.token, store.id, {
          name: `Product ${i}`,
          price: 1000 * (i + 1),
          status: i < 3 ? 'ACTIVE' : 'DRAFT',
        });
      }
    });

    it('should list all products', async () => {
      const res = await GET(`/api/sites/${store.id}/products`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      if (!data.products || data.products.length < 5) throw new Error('Expected at least 5 products');
      if (!data.pagination) throw new Error('Missing pagination');
    });

    it('should filter products by status', async () => {
      const res = await GET(`/api/sites/${store.id}/products?status=ACTIVE`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      for (const p of data.products) {
        if (p.status !== 'ACTIVE') throw new Error('Filter not working — found non-ACTIVE product');
      }
    });

    it('should search products by name', async () => {
      await createTestProduct(user.token, store.id, { name: 'Ankara Special Edition' });

      const res = await GET(`/api/sites/${store.id}/products?search=ankara`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      if (data.products.length < 1) throw new Error('Search should find ankara product');
    });

    it('should paginate products', async () => {
      const res = await GET(`/api/sites/${store.id}/products?page=1&limit=2`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      if (data.products.length > 2) throw new Error('Pagination limit not respected');
      if (data.pagination.page !== 1) throw new Error('Page number wrong');
    });
  });

  describe('Products — Update & Delete', () => {
    let user: TestUser;
    let store: TestStore;
    let product: TestProduct;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
      product = await createTestProduct(user.token, store.id, { name: 'Updatable Product' });
    });

    it('should update product price', async () => {
      const res = await PATCH(`/api/sites/${store.id}/products/${product.id}`, {
        price: 7500,
      }, user.token);

      expectSuccess(res);
      const data = res.body.data as any;
      if (data.price !== 7500) throw new Error('Price not updated');
    });

    it('should update product status to archived', async () => {
      const res = await PATCH(`/api/sites/${store.id}/products/${product.id}`, {
        status: 'ARCHIVED',
      }, user.token);

      expectSuccess(res);
    });

    it('should delete a product', async () => {
      const tempProduct = await createTestProduct(user.token, store.id, { name: 'To Delete' });

      const res = await DELETE(`/api/sites/${store.id}/products/${tempProduct.id}`, user.token);
      expectSuccess(res);

      // Verify it's gone
      const getRes = await GET(`/api/sites/${store.id}/products/${tempProduct.id}`, user.token);
      expectError(getRes, 404);
    });
  });
}
