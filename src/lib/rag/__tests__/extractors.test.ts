/**
 * Tests for Document Extractors
 */

import { extractDocument } from '../indexing/extractors';
import { DocumentType } from '../types';

const STORE_ID = 'store_test123';

describe('Document Extractors', () => {
  describe('Product Extractor', () => {
    it('extracts searchable content from product data', () => {
      const product = {
        id: 'prod_1',
        name: 'Premium Ankara Fabric',
        description: 'Beautiful handwoven Ankara fabric, 6 yards',
        price: 15000,
        compareAtPrice: 20000,
        currency: 'NGN',
        category: 'Fabrics',
        stock: 25,
        status: 'active',
        tags: ['ankara', 'fabric', 'fashion'],
        sku: 'ANK-001',
        isFeatured: true,
        variants: [{ name: 'Blue', options: { color: 'Blue' } }],
        images: ['img1.jpg', 'img2.jpg'],
      };

      const result = extractDocument(DocumentType.PRODUCT, product, STORE_ID);

      expect(result.title).toBe('Premium Ankara Fabric');
      expect(result.content).toContain('Premium Ankara Fabric');
      expect(result.content).toContain('₦15,000');
      expect(result.content).toContain('25% off');
      expect(result.content).toContain('ankara, fabric, fashion');
      expect(result.content).toContain('SKU: ANK-001');
      expect(result.metadata.sourceType).toBe(DocumentType.PRODUCT);
      expect(result.metadata.siteId).toBe(STORE_ID);
    });

    it('handles out-of-stock products', () => {
      const product = {
        id: 'prod_2',
        name: 'Sold Out Item',
        price: 5000,
        stock: 0,
      };

      const result = extractDocument(DocumentType.PRODUCT, product, STORE_ID);
      expect(result.content).toContain('Out of stock');
    });
  });

  describe('Order Extractor', () => {
    it('extracts order details with items', () => {
      const order = {
        id: 'order_1',
        orderNumber: 'AF-10042',
        email: 'customer@example.com',
        phone: '+2348012345678',
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'paystack',
        total: 45000,
        currency: 'NGN',
        createdAt: '2024-01-15',
        items: [
          { name: 'Ankara Fabric', quantity: 2, price: 15000 },
          { name: 'Thread Set', quantity: 1, price: 15000 },
        ],
      };

      const result = extractDocument(DocumentType.ORDER, order, STORE_ID);

      expect(result.title).toBe('Order #AF-10042');
      expect(result.content).toContain('₦45,000');
      expect(result.content).toContain('delivered');
      expect(result.content).toContain('paid');
      expect(result.content).toContain('Ankara Fabric x2');
    });
  });

  describe('Customer Extractor', () => {
    it('extracts customer profile', () => {
      const customer = {
        id: 'cust_1',
        firstName: 'Amara',
        lastName: 'Okafor',
        email: 'amara@example.com',
        phone: '+2348087654321',
        totalOrders: 12,
        totalSpent: 350000,
        tags: ['vip', 'repeat-buyer'],
        address: { city: 'Lagos', state: 'Lagos', country: 'NG' },
      };

      const result = extractDocument(DocumentType.CUSTOMER, customer, STORE_ID);

      expect(result.title).toBe('Amara Okafor');
      expect(result.content).toContain('amara@example.com');
      expect(result.content).toContain('12');
      expect(result.content).toContain('₦350,000');
      expect(result.content).toContain('vip, repeat-buyer');
      expect(result.content).toContain('Lagos');
    });
  });

  describe('Review Extractor', () => {
    it('extracts review with star rating', () => {
      const review = {
        id: 'rev_1',
        productName: 'Ankara Fabric',
        rating: 5,
        title: 'Amazing quality!',
        body: 'The fabric is beautiful and the delivery was fast.',
        isVerified: true,
      };

      const result = extractDocument(DocumentType.REVIEW, review, STORE_ID);

      expect(result.content).toContain('★★★★★');
      expect(result.content).toContain('5/5');
      expect(result.content).toContain('Verified purchase');
      expect(result.content).toContain('Amazing quality');
    });
  });

  describe('Delivery Zone Extractor', () => {
    it('extracts delivery zone with pricing', () => {
      const zone = {
        id: 'dz_1',
        name: 'Lagos Mainland',
        areas: ['Yaba', 'Surulere', 'Ikeja', 'Mushin'],
        fee: 2000,
        freeAbove: 50000,
        estimatedDays: '1-2 days',
      };

      const result = extractDocument(DocumentType.DELIVERY_ZONE, zone, STORE_ID);

      expect(result.content).toContain('Lagos Mainland');
      expect(result.content).toContain('Yaba');
      expect(result.content).toContain('₦2,000');
      expect(result.content).toContain('₦50,000');
      expect(result.content).toContain('1-2 days');
    });
  });

  describe('Generic Fallback', () => {
    it('handles unknown document types gracefully', () => {
      const data = { id: 'x', name: 'Test Thing', value: 42 };
      const result = extractDocument('unknown_type' as DocumentType, data, STORE_ID);

      expect(result.title).toBe('Test Thing');
      expect(result.content).toBeTruthy();
    });
  });
});
