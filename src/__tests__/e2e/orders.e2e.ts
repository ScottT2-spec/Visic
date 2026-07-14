/**
 * E2E Tests — Order Management
 *
 * Tests the full order lifecycle: creation, status updates, inventory, delivery.
 */

import {
  describe, it, beforeAll,
  GET, POST, PATCH,
  createTestUser, createTestStore, createTestProduct, createTestOrder,
  expectSuccess, expectError,
  type TestUser, type TestStore, type TestProduct,
} from './setup';

export function orderTests() {
  describe('Orders — Create', () => {
    let user: TestUser;
    let store: TestStore;
    let product: TestProduct;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
      product = await createTestProduct(user.token, store.id, {
        name: 'Order Test Product',
        price: 10000,
        stock: 20,
        status: 'ACTIVE',
      });
    });

    it('should create an order with valid data', async () => {
      const res = await POST(`/api/sites/${store.id}/orders`, {
        email: 'buyer@test.com',
        firstName: 'Amara',
        lastName: 'Okafor',
        items: [{ productId: product.id, quantity: 2 }],
        deliveryAddress: {
          line1: '15 Admiralty Way',
          city: 'Lekki',
          state: 'Lagos',
          country: 'Nigeria',
        },
        paymentMethod: 'bank_transfer',
      }, user.token);

      expectSuccess(res, 201);
      const order = res.body.data as any;
      if (!order.orderNumber) throw new Error('Missing order number');
      if (order.orderNumber.indexOf('AF-') !== 0) throw new Error('Order number should start with AF-');
      if (!order.total || order.total <= 0) throw new Error('Invalid total');
    });

    it('should reject order with no items', async () => {
      const res = await POST(`/api/sites/${store.id}/orders`, {
        email: 'buyer@test.com',
        firstName: 'Test',
        lastName: 'Buyer',
        items: [],
        deliveryAddress: {
          line1: '1 Test St',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
        },
        paymentMethod: 'card',
      }, user.token);

      expectError(res, 422);
    });

    it('should reject order with invalid product ID', async () => {
      const res = await POST(`/api/sites/${store.id}/orders`, {
        email: 'buyer@test.com',
        firstName: 'Test',
        lastName: 'Buyer',
        items: [{ productId: 'nonexistent_id', quantity: 1 }],
        deliveryAddress: {
          line1: '1 Test St',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
        },
        paymentMethod: 'card',
      }, user.token);

      // Should fail because product doesn't exist
      if (res.ok && !res.body.error) {
        // If it somehow succeeds, that's a bug
        throw new Error('Should reject order with invalid product');
      }
    });

    it('should create order with delivery instructions', async () => {
      const res = await POST(`/api/sites/${store.id}/orders`, {
        email: 'buyer2@test.com',
        firstName: 'Kofi',
        lastName: 'Mensah',
        items: [{ productId: product.id, quantity: 1 }],
        deliveryAddress: {
          line1: '22 Ring Road',
          city: 'Accra',
          state: 'Greater Accra',
          country: 'Ghana',
          deliveryInstructions: 'Leave with security guard',
        },
        paymentMethod: 'mobile_money',
        note: 'Please wrap as gift',
      }, user.token);

      expectSuccess(res, 201);
    });
  });

  describe('Orders — List & Get', () => {
    let user: TestUser;
    let store: TestStore;
    let product: TestProduct;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
      product = await createTestProduct(user.token, store.id, { price: 5000, stock: 100 });

      // Create a few orders
      for (let i = 0; i < 3; i++) {
        await createTestOrder(user.token, store.id, product.id);
      }
    });

    it('should list orders', async () => {
      const res = await GET(`/api/sites/${store.id}/orders`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      const orders = Array.isArray(data) ? data : data.orders;
      if (!orders || orders.length < 3) throw new Error('Expected at least 3 orders');
    });

    it('should get a single order by ID', async () => {
      const order = await createTestOrder(user.token, store.id, product.id);

      const res = await GET(`/api/sites/${store.id}/orders/${order.id}`, user.token);
      expectSuccess(res);
      const data = res.body.data as any;
      if (data.id !== order.id) throw new Error('Order ID mismatch');
    });
  });

  describe('Orders — Status Lifecycle', () => {
    let user: TestUser;
    let store: TestStore;
    let product: TestProduct;

    beforeAll(async () => {
      user = await createTestUser();
      store = await createTestStore(user.token);
      product = await createTestProduct(user.token, store.id, { price: 8000, stock: 50 });
    });

    it('should update order status: PENDING → CONFIRMED', async () => {
      const order = await createTestOrder(user.token, store.id, product.id);

      const res = await PATCH(`/api/sites/${store.id}/orders/${order.id}`, {
        status: 'CONFIRMED',
        note: 'Payment verified via bank transfer',
      }, user.token);

      expectSuccess(res);
    });

    it('should update order status: CONFIRMED → SHIPPED with tracking', async () => {
      const order = await createTestOrder(user.token, store.id, product.id);

      // Confirm first
      await PATCH(`/api/sites/${store.id}/orders/${order.id}`, {
        status: 'CONFIRMED',
      }, user.token);

      // Then ship
      const res = await PATCH(`/api/sites/${store.id}/orders/${order.id}`, {
        status: 'SHIPPED',
        trackingNumber: 'GIG-12345678',
      }, user.token);

      expectSuccess(res);
    });

    it('should cancel an order', async () => {
      const order = await createTestOrder(user.token, store.id, product.id);

      const res = await PATCH(`/api/sites/${store.id}/orders/${order.id}`, {
        status: 'CANCELLED',
        note: 'Customer requested cancellation',
      }, user.token);

      expectSuccess(res);
    });
  });
}
