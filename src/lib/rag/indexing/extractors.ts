/**
 * AfroStore RAG Engine — Document Content Extractors
 *
 * Each document type has a dedicated extractor that produces
 * optimized searchable text and structured metadata.
 *
 * The extractors understand African commerce context:
 * - Currency formatting (GH₵, GHS, KES)
 * - WhatsApp ordering patterns
 * - Delivery zone structures
 * - Local business terminology
 */

import {
  DocumentType,
  type DocumentMetadata,
  type ProductMetadata,
  type OrderMetadata,
  type CustomerMetadata,
  type PageMetadata,
  type PluginMetadata,
  type ReviewMetadata,
} from '../types';
import { normalizeText, normalizeCurrency, stripHtml } from '../utils/normalize';

export interface ExtractedDocument {
  /** Searchable title (gets BM25 title weight boost) */
  title: string;
  /** Full searchable content */
  content: string;
  /** Typed metadata */
  metadata: DocumentMetadata;
}

type EntityData = Record<string, unknown>;

/** Extract searchable content from any supported entity */
export function extractDocument(
  type: DocumentType,
  data: EntityData,
  siteId: string
): ExtractedDocument {
  switch (type) {
    case DocumentType.PRODUCT:
      return extractProduct(data, siteId);
    case DocumentType.ORDER:
      return extractOrder(data, siteId);
    case DocumentType.CUSTOMER:
      return extractCustomer(data, siteId);
    case DocumentType.PAGE:
      return extractPage(data, siteId);
    case DocumentType.PLUGIN:
      return extractPlugin(data, siteId);
    case DocumentType.CATEGORY:
      return extractCategory(data, siteId);
    case DocumentType.COUPON:
      return extractCoupon(data, siteId);
    case DocumentType.REVIEW:
      return extractReview(data, siteId);
    case DocumentType.DELIVERY_ZONE:
      return extractDeliveryZone(data, siteId);
    case DocumentType.STORE_SETTINGS:
      return extractSiteSettings(data, siteId);
    case DocumentType.ANALYTICS_SUMMARY:
      return extractAnalyticsSummary(data, siteId);
    default:
      return extractGeneric(type, data, siteId);
  }
}

// ─── PRODUCT ────────────────────────────────────────────

function extractProduct(data: EntityData, siteId: string): ExtractedDocument {
  const name = str(data.name);
  const description = stripHtml(str(data.description));
  const category = str(data.category) || str(data.categoryName);
  const tags = strArr(data.tags);
  const variants = arr(data.variants);
  const price = num(data.price);
  const compareAtPrice = num(data.compareAtPrice);
  const currency = str(data.currency) || 'GHS';
  const sku = str(data.sku);
  const stock = num(data.stock);
  const images = arr(data.images);

  const contentParts = [
    `Product: ${name}`,
    description && `Description: ${description}`,
    category && `Category: ${category}`,
    `Price: ${formatPrice(price, currency)}`,
    compareAtPrice && compareAtPrice > price
      ? `Compare at: ${formatPrice(compareAtPrice, currency)} (${Math.round((1 - price / compareAtPrice) * 100)}% off)`
      : null,
    sku && `SKU: ${sku}`,
    `Stock: ${stock} units`,
    stock === 0 ? 'Status: Out of stock' : stock <= 5 ? 'Status: Low stock' : 'Status: In stock',
    tags.length > 0 && `Tags: ${tags.join(', ')}`,
    variants.length > 0 &&
      `Variants: ${variants.map((v: EntityData) => str(v.name) || JSON.stringify(v.options)).join(', ')}`,
  ];

  const metadata: ProductMetadata = {
    title: name,
    sourceType: DocumentType.PRODUCT,
    sourceId: str(data.id),
    siteId,
    price,
    compareAtPrice: compareAtPrice || undefined,
    currency,
    category: category || undefined,
    categoryId: str(data.categoryId) || undefined,
    stock,
    status: str(data.status) || 'draft',
    tags,
    sku: sku || undefined,
    isFeatured: bool(data.isFeatured),
    variantCount: variants.length,
    imageCount: images.length,
  };

  return {
    title: name,
    content: normalizeText(contentParts.filter(Boolean).join('\n')),
    metadata,
  };
}

// ─── ORDER ──────────────────────────────────────────────

function extractOrder(data: EntityData, siteId: string): ExtractedDocument {
  const orderNumber = str(data.orderNumber);
  const items = arr(data.items);
  const status = str(data.status);
  const paymentStatus = str(data.paymentStatus);
  const paymentMethod = str(data.paymentMethod);
  const total = num(data.total);
  const currency = str(data.currency) || 'GHS';
  const email = str(data.email);
  const phone = str(data.phone);
  const createdAt = str(data.createdAt);
  const note = str(data.note);

  const itemLines = items.map(
    (item: EntityData) =>
      `${str(item.name)} x${num(item.quantity)} @ ${formatPrice(num(item.price), currency)}`
  );

  const contentParts = [
    `Order #${orderNumber}`,
    `Status: ${status}`,
    `Payment: ${paymentStatus}${paymentMethod ? ` via ${paymentMethod}` : ''}`,
    `Total: ${formatPrice(total, currency)}`,
    `Customer: ${email}${phone ? ` (${phone})` : ''}`,
    `Date: ${createdAt}`,
    itemLines.length > 0 && `Items:\n${itemLines.join('\n')}`,
    note && `Note: ${note}`,
  ];

  const metadata: OrderMetadata = {
    title: `Order #${orderNumber}`,
    sourceType: DocumentType.ORDER,
    sourceId: str(data.id),
    siteId,
    orderNumber,
    status,
    paymentStatus,
    paymentMethod: paymentMethod || undefined,
    total,
    currency,
    itemCount: items.length,
    customerEmail: email,
    customerId: str(data.customerId) || undefined,
    createdAt,
  };

  return {
    title: `Order #${orderNumber}`,
    content: normalizeText(contentParts.filter(Boolean).join('\n')),
    metadata,
  };
}

// ─── CUSTOMER ───────────────────────────────────────────

function extractCustomer(data: EntityData, siteId: string): ExtractedDocument {
  const firstName = str(data.firstName);
  const lastName = str(data.lastName);
  const name = `${firstName} ${lastName}`.trim() || str(data.name);
  const email = str(data.email);
  const phone = str(data.phone);
  const totalOrders = num(data.totalOrders);
  const totalSpent = num(data.totalSpent);
  const currency = str(data.currency) || 'GHS';
  const tags = strArr(data.tags);
  const address = data.address as EntityData | null;

  const contentParts = [
    `Customer: ${name}`,
    `Email: ${email}`,
    phone && `Phone: ${phone}`,
    `Total orders: ${totalOrders}`,
    `Total spent: ${formatPrice(totalSpent, currency)}`,
    tags.length > 0 && `Tags: ${tags.join(', ')}`,
    address && `Location: ${[str(address.city), str(address.state), str(address.country)].filter(Boolean).join(', ')}`,
    str(data.note) && `Note: ${str(data.note)}`,
  ];

  const metadata: CustomerMetadata = {
    title: name,
    sourceType: DocumentType.CUSTOMER,
    sourceId: str(data.id),
    siteId,
    email,
    phone: phone || undefined,
    totalOrders,
    totalSpent,
    currency,
    tags,
    city: address ? str(address.city) : undefined,
    state: address ? str(address.state) : undefined,
    country: address ? str(address.country) : undefined,
  };

  return {
    title: name,
    content: normalizeText(contentParts.filter(Boolean).join('\n')),
    metadata,
  };
}

// ─── PAGE ───────────────────────────────────────────────

function extractPage(data: EntityData, siteId: string): ExtractedDocument {
  const title = str(data.title);
  const content = data.content;
  const pageType = str(data.type) || str(data.pageType);
  const slug = str(data.slug);

  // Page content can be builder blocks (JSON) or HTML
  let textContent = '';
  if (typeof content === 'string') {
    textContent = stripHtml(content);
  } else if (content && typeof content === 'object') {
    textContent = extractBuilderBlockText(content);
  }

  const contentParts = [
    `Page: ${title}`,
    `Type: ${pageType}`,
    `URL: /${slug}`,
    textContent && textContent,
    str(data.metaDescription) && `Meta: ${str(data.metaDescription)}`,
  ];

  const metadata: PageMetadata = {
    title,
    sourceType: DocumentType.PAGE,
    sourceId: str(data.id),
    siteId,
    pageType,
    slug,
    isPublished: bool(data.isPublished),
  };

  return {
    title,
    content: normalizeText(contentParts.filter(Boolean).join('\n')),
    metadata,
  };
}

// ─── PLUGIN ─────────────────────────────────────────────

function extractPlugin(data: EntityData, siteId: string): ExtractedDocument {
  const name = str(data.name);
  const description = str(data.description);
  const category = str(data.category);
  const author = str(data.author);

  const contentParts = [
    `Plugin: ${name}`,
    description && `Description: ${description}`,
    `Category: ${category}`,
    `Author: ${author}`,
    `Version: ${str(data.version)}`,
    bool(data.isPremium) && 'Premium plugin',
    bool(data.isAIGenerated) && 'AI-generated plugin',
    `Rating: ${num(data.rating)}/5`,
    `Installs: ${num(data.installs)}`,
  ];

  const metadata: PluginMetadata = {
    title: name,
    sourceType: DocumentType.PLUGIN,
    sourceId: str(data.id),
    siteId,
    category,
    author,
    version: str(data.version) || '1.0.0',
    isPremium: bool(data.isPremium),
    rating: num(data.rating),
    installs: num(data.installs),
    isAIGenerated: bool(data.isAIGenerated),
  };

  return {
    title: name,
    content: normalizeText(contentParts.filter(Boolean).join('\n')),
    metadata,
  };
}

// ─── REVIEW ─────────────────────────────────────────────

function extractReview(data: EntityData, siteId: string): ExtractedDocument {
  const productName = str(data.productName) || str(data.name);
  const rating = num(data.rating);
  const title = str(data.title);
  const body = str(data.body);

  const contentParts = [
    `Review for ${productName}`,
    `Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)`,
    title && `Title: ${title}`,
    body && body,
    bool(data.isVerified) && 'Verified purchase',
  ];

  const metadata: ReviewMetadata = {
    title: title || `Review for ${productName}`,
    sourceType: DocumentType.REVIEW,
    sourceId: str(data.id),
    siteId,
    productId: str(data.productId),
    productName,
    rating,
    isVerified: bool(data.isVerified),
    isApproved: bool(data.isApproved),
  };

  return {
    title: title || `Review for ${productName}`,
    content: normalizeText(contentParts.filter(Boolean).join('\n')),
    metadata,
  };
}

// ─── CATEGORY ───────────────────────────────────────────

function extractCategory(data: EntityData, siteId: string): ExtractedDocument {
  const name = str(data.name);
  const description = str(data.description);

  return {
    title: name,
    content: normalizeText(
      [`Category: ${name}`, description && `Description: ${description}`]
        .filter(Boolean)
        .join('\n')
    ),
    metadata: {
      title: name,
      sourceType: DocumentType.CATEGORY,
      sourceId: str(data.id),
      siteId,
      slug: str(data.slug),
      parentId: str(data.parentId) || null,
    },
  };
}

// ─── COUPON ─────────────────────────────────────────────

function extractCoupon(data: EntityData, siteId: string): ExtractedDocument {
  const code = str(data.code);
  const type = str(data.type);
  const value = num(data.value);

  const discountText =
    type === 'PERCENTAGE'
      ? `${value}% off`
      : type === 'FREE_SHIPPING'
        ? 'Free shipping'
        : `${formatPrice(value, 'GHS')} off`;

  return {
    title: `Coupon: ${code}`,
    content: normalizeText(
      [
        `Coupon code: ${code}`,
        `Discount: ${discountText}`,
        num(data.minOrderAmount) && `Minimum order: ${formatPrice(num(data.minOrderAmount), 'GHS')}`,
        num(data.maxUses) && `Max uses: ${num(data.maxUses)} (used: ${num(data.usedCount)})`,
        str(data.expiresAt) && `Expires: ${str(data.expiresAt)}`,
        bool(data.isActive) ? 'Status: Active' : 'Status: Inactive',
      ]
        .filter(Boolean)
        .join('\n')
    ),
    metadata: {
      title: `Coupon: ${code}`,
      sourceType: DocumentType.COUPON,
      sourceId: str(data.id),
      siteId,
      code,
      type,
      value,
      isActive: bool(data.isActive),
    },
  };
}

// ─── DELIVERY ZONE ──────────────────────────────────────

function extractDeliveryZone(data: EntityData, siteId: string): ExtractedDocument {
  const name = str(data.name);
  const areas = arr(data.areas);
  const fee = num(data.fee);
  const freeAbove = num(data.freeAbove);

  return {
    title: `Delivery: ${name}`,
    content: normalizeText(
      [
        `Delivery zone: ${name}`,
        `Areas: ${areas.join(', ')}`,
        `Fee: ${formatPrice(fee, 'GHS')}`,
        freeAbove && `Free delivery above ${formatPrice(freeAbove, 'GHS')}`,
        str(data.estimatedDays) && `Estimated delivery: ${str(data.estimatedDays)}`,
      ]
        .filter(Boolean)
        .join('\n')
    ),
    metadata: {
      title: `Delivery: ${name}`,
      sourceType: DocumentType.DELIVERY_ZONE,
      sourceId: str(data.id),
      siteId,
      areas,
      fee,
      freeAbove: freeAbove || null,
    },
  };
}

// ─── STORE SETTINGS ─────────────────────────────────────

function extractSiteSettings(data: EntityData, siteId: string): ExtractedDocument {
  const features: string[] = [];
  if (bool(data.allowGuestCheckout)) features.push('Guest checkout enabled');
  if (bool(data.payOnDelivery)) features.push('Pay on delivery available');
  if (bool(data.bankTransfer)) features.push('Bank transfer accepted');
  if (bool(data.whatsappOrdering)) features.push('WhatsApp ordering enabled');
  if (bool(data.lowDataMode)) features.push('Low data mode enabled');

  return {
    title: 'Store Settings',
    content: normalizeText(
      [
        'Store Settings',
        `Language: ${str(data.language) || 'en'}`,
        str(data.whatsappNumber) && `WhatsApp: ${str(data.whatsappNumber)}`,
        features.join('\n'),
      ]
        .filter(Boolean)
        .join('\n')
    ),
    metadata: {
      title: 'Store Settings',
      sourceType: DocumentType.STORE_SETTINGS,
      sourceId: siteId,
      siteId,
    },
  };
}

// ─── ANALYTICS SUMMARY ──────────────────────────────────

function extractAnalyticsSummary(data: EntityData, siteId: string): ExtractedDocument {
  const period = str(data.period) || 'unknown';

  return {
    title: `Analytics: ${period}`,
    content: normalizeText(
      [
        `Analytics summary for ${period}`,
        num(data.totalRevenue) && `Total revenue: ${formatPrice(num(data.totalRevenue), str(data.currency) || 'GHS')}`,
        num(data.totalOrders) && `Total orders: ${num(data.totalOrders)}`,
        num(data.totalCustomers) && `Total customers: ${num(data.totalCustomers)}`,
        num(data.conversionRate) && `Conversion rate: ${(num(data.conversionRate) * 100).toFixed(1)}%`,
        num(data.averageOrderValue) && `Average order value: ${formatPrice(num(data.averageOrderValue), str(data.currency) || 'GHS')}`,
        str(data.topProduct) && `Top product: ${str(data.topProduct)}`,
        str(data.topSource) && `Top traffic source: ${str(data.topSource)}`,
      ]
        .filter(Boolean)
        .join('\n')
    ),
    metadata: {
      title: `Analytics: ${period}`,
      sourceType: DocumentType.ANALYTICS_SUMMARY,
      sourceId: str(data.id) || `analytics-${period}`,
      siteId,
      period,
    },
  };
}

// ─── GENERIC FALLBACK ───────────────────────────────────

function extractGeneric(
  type: DocumentType,
  data: EntityData,
  siteId: string
): ExtractedDocument {
  const title = str(data.name) || str(data.title) || `${type} document`;
  const content = Object.entries(data)
    .filter(([, v]) => typeof v === 'string' || typeof v === 'number')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  return {
    title,
    content: normalizeText(content),
    metadata: {
      title,
      sourceType: type,
      sourceId: str(data.id),
      siteId,
    },
  };
}

// ─── BUILDER BLOCKS ─────────────────────────────────────

/** Recursively extract text from drag-and-drop builder JSON blocks */
function extractBuilderBlockText(blocks: unknown): string {
  if (!blocks) return '';

  const parts: string[] = [];

  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }

    const obj = node as Record<string, unknown>;

    // Extract text content from common block properties
    for (const key of ['text', 'content', 'title', 'heading', 'label', 'description', 'value', 'placeholder']) {
      const val = obj[key];
      if (typeof val === 'string' && val.trim()) {
        parts.push(stripHtml(val.trim()));
      }
    }

    // Recurse into children/blocks
    if (obj.children) walk(obj.children);
    if (obj.blocks) walk(obj.blocks);
    if (obj.props && typeof obj.props === 'object') walk(obj.props);
  }

  walk(blocks);
  return parts.join('\n');
}

// ─── TYPE HELPERS ───────────────────────────────────────

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function bool(v: unknown): boolean {
  return v === true || v === 'true' || v === 1;
}

function arr(v: unknown): EntityData[] {
  return Array.isArray(v) ? v : [];
}

function strArr(v: unknown): string[] {
  return Array.isArray(v) ? v.map((item) => String(item)) : [];
}

function formatPrice(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    GHS: 'GH₵',
    GHS: 'GH₵',
    KES: 'KSh',
    ZAR: 'R',
    USD: '$',
    GBP: '£',
    EUR: '€',
    XOF: 'CFA',
    XAF: 'CFA',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toLocaleString()}`;
}
