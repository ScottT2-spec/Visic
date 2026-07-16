import { z } from "zod";

// ─── AUTH ────────────────────────────────────────────────────

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── STORES ─────────────────────────────────────────────────

export const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
  description: z.string().max(500).optional(),
  businessType: z.string().default("general"),
  country: z.string().default("NG"),
  currency: z.string().default("GHS"),
  themeId: z.string().optional(),
  logo: z.string().url().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  logo: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  customDomain: z.string().optional().nullable(),
  currency: z.string().optional(),
  country: z.string().optional(),
  businessType: z.string().optional(),
});

// ─── PRODUCTS ───────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPrice: z.number().positive().optional().nullable(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  trackInventory: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z.array(z.object({
    url: z.string().min(1),
    alt: z.string().optional(),
  })).default([]),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().min(0).default(0),
    image: z.string().optional().nullable(),
    options: z.record(z.string(), z.string()),
  })).default([]),
});

export const updateProductSchema = createProductSchema.partial();

// ─── ORDERS ─────────────────────────────────────────────────

export const createOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
  })).min(1, "At least one item is required"),
  deliveryAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().default("Ghana"),
    postalCode: z.string().optional(),
    deliveryInstructions: z.string().optional(),
  }),
  deliveryZoneId: z.string().optional(),
  paymentMethod: z.string(),
  couponCode: z.string().optional(),
  note: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
});

// ─── CUSTOMERS ──────────────────────────────────────────────

export const createCustomerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.object({
    line1: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
  }).optional(),
  tags: z.array(z.string()).default([]),
  note: z.string().optional(),
});

// ─── CATEGORIES ─────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

// ─── COUPONS ────────────────────────────────────────────────

export const createCouponSchema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ─── DELIVERY ZONES ─────────────────────────────────────────

export const createDeliveryZoneSchema = z.object({
  name: z.string().min(1).max(100),
  areas: z.array(z.string()).min(1),
  fee: z.number().min(0),
  freeAbove: z.number().positive().optional(),
  estimatedDays: z.string().optional(),
});

// ─── PAYMENT GATEWAYS ───────────────────────────────────────

export const setupPaymentGatewaySchema = z.object({
  provider: z.enum(["MONNIFY", "PAYSTACK", "FLUTTERWAVE", "MOOLRE"]),
  publicKey: z.string().min(1),
  secretKey: z.string().min(1),
  webhookSecret: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

// ─── SETTINGS ───────────────────────────────────────────────

export const updateSettingsSchema = z.object({
  allowGuestCheckout: z.boolean().optional(),
  payOnDelivery: z.boolean().optional(),
  bankTransfer: z.boolean().optional(),
  whatsappOrdering: z.boolean().optional(),
  showStockCount: z.boolean().optional(),
  lowDataMode: z.boolean().optional(),
  language: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  googleAnalyticsId: z.string().optional().nullable(),
  facebookPixelId: z.string().optional().nullable(),
  tiktokPixelId: z.string().optional().nullable(),
});

// ─── PAGES ──────────────────────────────────────────────────

export const createPageSchema = z.object({
  title: z.string().min(1, "Page title is required").max(200),
  type: z.enum(["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING"]).default("CUSTOM"),
  content: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
  position: z.number().int().min(0).default(0),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["HOME", "ABOUT", "CONTACT", "FAQ", "POLICY", "CUSTOM", "LANDING"]).optional(),
  content: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// ─── BLOGS ──────────────────────────────────────────────────

export const createBlogSchema = z.object({
  title: z.string().min(1, "Blog title is required").max(300),
  excerpt: z.string().max(1000).optional(),
  content: z.any().optional(),
  contentHtml: z.string().optional(),
  coverImage: z.string().url().optional().nullable(),
  author: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const updateBlogSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.any().optional(),
  contentHtml: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  author: z.string().max(200).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
});

// ─── REVIEWS ────────────────────────────────────────────────

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string().url()).default([]),
});

export const moderateReviewSchema = z.object({
  isApproved: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

// ─── AUTOMATIONS ────────────────────────────────────────────

export const createAutomationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  trigger: z.object({
    type: z.enum(["new_order", "new_lead", "abandoned_cart", "payment_success", "form_submission", "product_purchase", "visitor_activity", "schedule"]),
    conditions: z.record(z.string(), z.unknown()).optional(),
  }),
  actions: z.array(z.object({
    type: z.enum(["send_email", "send_sms", "send_whatsapp", "create_task", "assign_user", "add_crm_tag", "ai_response", "webhook", "delay"]),
    config: z.record(z.string(), z.unknown()).optional(),
  })).min(1, "At least one action is required"),
  isActive: z.boolean().default(false),
});

export const updateAutomationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  trigger: z.object({
    type: z.enum(["new_order", "new_lead", "abandoned_cart", "payment_success", "form_submission", "product_purchase", "visitor_activity", "schedule"]),
    conditions: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
  actions: z.array(z.object({
    type: z.enum(["send_email", "send_sms", "send_whatsapp", "create_task", "assign_user", "add_crm_tag", "ai_response", "webhook", "delay"]),
    config: z.record(z.string(), z.unknown()).optional(),
  })).min(1).optional(),
  isActive: z.boolean().optional(),
});

// ─── POPUPS ─────────────────────────────────────────────────

export const createPopupSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["MODAL", "BANNER", "SLIDE_IN", "FULL_SCREEN", "COUNTDOWN", "NOTIFICATION_BAR"]).default("MODAL"),
  content: z.any().optional(),
  trigger: z.object({
    type: z.enum(["exit_intent", "scroll", "time_delay", "click", "page_load"]),
    config: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
  displayRules: z.object({
    pages: z.array(z.string()).optional(),
    frequency: z.enum(["once", "session", "always"]).optional(),
    devices: z.array(z.enum(["desktop", "mobile", "tablet"])).optional(),
  }).optional(),
  isActive: z.boolean().default(false),
});

export const updatePopupSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["MODAL", "BANNER", "SLIDE_IN", "FULL_SCREEN", "COUNTDOWN", "NOTIFICATION_BAR"]).optional(),
  content: z.any().optional(),
  trigger: z.object({
    type: z.enum(["exit_intent", "scroll", "time_delay", "click", "page_load"]),
    config: z.record(z.string(), z.unknown()).optional(),
  }).optional().nullable(),
  displayRules: z.object({
    pages: z.array(z.string()).optional(),
    frequency: z.enum(["once", "session", "always"]).optional(),
    devices: z.array(z.enum(["desktop", "mobile", "tablet"])).optional(),
  }).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ─── A/B TESTS ──────────────────────────────────────────────

export const createABTestSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  pageId: z.string().optional(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    content: z.any().optional(),
    weight: z.number().min(0).max(100).default(50),
  })).min(2, "At least 2 variants required"),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const updateABTestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  pageId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "RUNNING", "PAUSED", "COMPLETED"]).optional(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string().min(1).max(100),
    content: z.any().optional(),
    weight: z.number().min(0).max(100).default(50),
  })).min(2).optional(),
  winnerVariantId: z.string().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

// ─── FLASH SALES ────────────────────────────────────────────

export const createFlashSaleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  discountValue: z.number().min(0),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(true),
  maxUses: z.number().int().min(0).optional().nullable(),
  productIds: z.array(z.string()).optional(),
});

export const updateFlashSaleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().min(0).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  maxUses: z.number().int().min(0).optional().nullable(),
  productIds: z.array(z.string()).optional(),
});

// ─── LOYALTY ────────────────────────────────────────────────

export const updateLoyaltyProgramSchema = z.object({
  enabled: z.boolean().optional(),
  pointsPerCurrency: z.number().min(0).optional(),
  currencyPerPoint: z.number().min(0).optional(),
  redemptionRate: z.number().min(0).optional(),
  minRedeemPoints: z.number().int().min(0).optional(),
  welcomePoints: z.number().int().min(0).optional(),
  referralPoints: z.number().int().min(0).optional(),
  reviewPoints: z.number().int().min(0).optional(),
});

// ─── REFERRAL PROGRAM ───────────────────────────────────────

export const updateReferralProgramSchema = z.object({
  enabled: z.boolean().optional(),
  commissionType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  commissionValue: z.number().min(0).optional(),
  cookieDays: z.number().int().min(1).optional(),
  minPayoutAmount: z.number().min(0).optional(),
  autoApprove: z.boolean().optional(),
  welcomeMessage: z.string().max(2000).optional().nullable(),
  termsText: z.string().max(5000).optional().nullable(),
});

// ─── MEDIA ──────────────────────────────────────────────────

export const createMediaItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  url: z.string().url("Valid URL required"),
  type: z.enum(["IMAGE", "VIDEO", "DOCUMENT", "AUDIO"]).default("IMAGE"),
  mimeType: z.string().max(100).optional(),
  size: z.number().int().min(0).optional(),
  width: z.number().int().min(0).optional(),
  height: z.number().int().min(0).optional(),
  alt: z.string().max(255).optional(),
  folder: z.string().max(255).default("/"),
});

export const updateMediaItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  alt: z.string().max(255).optional().nullable(),
  folder: z.string().max(255).optional(),
});

// ─── RETURNS ────────────────────────────────────────────────

export const createReturnSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(1, "Reason is required").max(2000),
  items: z.any().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateReturnSchema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED", "CLOSED"]).optional(),
  refundAmount: z.number().min(0).optional(),
  refundMethod: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// ─── TAX RULES ──────────────────────────────────────────────

export const createTaxRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  rate: z.number().min(0).max(100),
  country: z.string().max(2).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateTaxRuleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  rate: z.number().min(0).max(100).optional(),
  country: z.string().max(2).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ─── EMAIL CAMPAIGNS ────────────────────────────────────────

export const createEmailCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200),
  subject: z.string().min(1, "Subject is required").max(500),
  fromName: z.string().max(200).optional(),
  fromEmail: z.string().email().optional(),
  content: z.any().optional(),
  contentHtml: z.string().optional(),
  type: z.enum(["BROADCAST", "AUTOMATED", "TRANSACTIONAL"]).default("BROADCAST"),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const updateEmailCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(500).optional(),
  fromName: z.string().max(200).optional().nullable(),
  fromEmail: z.string().email().optional().nullable(),
  content: z.any().optional(),
  contentHtml: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "PAUSED", "CANCELLED"]).optional(),
  type: z.enum(["BROADCAST", "AUTOMATED", "TRANSACTIONAL"]).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

// ─── SMS CAMPAIGNS ──────────────────────────────────────────

export const createSmsCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200),
  message: z.string().min(1, "Message is required").max(1600),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const updateSmsCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(1600).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "PAUSED", "CANCELLED"]).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

// ─── WHATSAPP CAMPAIGNS ─────────────────────────────────────

export const createWhatsAppCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(200),
  message: z.string().min(1, "Message is required").max(4096),
  mediaUrl: z.string().url().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const updateWhatsAppCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(4096).optional(),
  mediaUrl: z.string().url().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "SENDING", "SENT", "PAUSED", "CANCELLED"]).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

// ─── NOTIFICATIONS ──────────────────────────────────────────

export const createSiteNotificationSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(300),
  message: z.string().min(1).max(5000),
  data: z.record(z.string(), z.unknown()).optional(),
});

// ─── FUNNELS ────────────────────────────────────────────────

export const funnelStepSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["LANDING", "LEAD_FORM", "THANK_YOU", "CHECKOUT", "UPSELL", "DOWNSELL", "CONFIRMATION", "WEBINAR", "VIDEO"]).default("LANDING"),
  pageContent: z.any().optional(),
  position: z.number().int().min(0).default(0),
  settings: z.object({
    redirectUrl: z.string().url().optional(),
    delaySeconds: z.number().int().min(0).optional(),
    buttonText: z.string().max(100).optional(),
  }).optional(),
});

export const createFunnelSchema = z.object({
  name: z.string().min(1, "Funnel name is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).default("DRAFT"),
  steps: z.array(funnelStepSchema).optional(),
});

export const updateFunnelSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).optional(),
  isActive: z.boolean().optional(),
});

export const createFunnelStepSchema = funnelStepSchema;

export const updateFunnelStepSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["LANDING", "LEAD_FORM", "THANK_YOU", "CHECKOUT", "UPSELL", "DOWNSELL", "CONFIRMATION", "WEBINAR", "VIDEO"]).optional(),
  pageContent: z.any().optional(),
  position: z.number().int().min(0).optional(),
  settings: z.object({
    redirectUrl: z.string().url().optional(),
    delaySeconds: z.number().int().min(0).optional(),
    buttonText: z.string().max(100).optional(),
  }).optional().nullable(),
});

// ─── CRM CONTACTS ───────────────────────────────────────────

export const createCrmContactSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "UNSUBSCRIBED"]).default("NEW"),
  score: z.number().int().min(0).max(1000).default(0),
  tags: z.array(z.string().max(50)).max(20).default([]),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export const updateCrmContactSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "UNSUBSCRIBED"]).optional(),
  score: z.number().int().min(0).max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  customFields: z.record(z.string(), z.unknown()).optional().nullable(),
});

// ─── BRANDS ─────────────────────────────────────────────────

export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required").max(200),
  logo: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().nullable(),
  position: z.number().int().min(0).default(0),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  logo: z.string().url().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  website: z.string().url().optional().nullable(),
  position: z.number().int().min(0).optional(),
});

// ─── FORMS ──────────────────────────────────────────────────

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "phone", "textarea", "number", "select", "radio", "checkbox", "date", "url", "file"]),
  label: z.string().min(1).max(200),
  placeholder: z.string().max(200).optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // for select, radio, checkbox
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

export const createFormSchema = z.object({
  name: z.string().min(1, "Form name is required").max(200),
  description: z.string().max(2000).optional(),
  fields: z.array(formFieldSchema).min(1, "At least one field is required"),
  settings: z.object({
    redirectUrl: z.string().url().optional(),
    emailNotify: z.boolean().optional(),
    notifyEmail: z.string().email().optional(),
    successMessage: z.string().max(500).optional(),
    submitButtonText: z.string().max(100).optional(),
  }).optional(),
  submitButtonText: z.string().max(100).default("Submit"),
  successMessage: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const updateFormSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  fields: z.array(formFieldSchema).min(1).optional(),
  settings: z.object({
    redirectUrl: z.string().url().optional(),
    emailNotify: z.boolean().optional(),
    notifyEmail: z.string().email().optional(),
    successMessage: z.string().max(500).optional(),
    submitButtonText: z.string().max(100).optional(),
  }).optional().nullable(),
  submitButtonText: z.string().max(100).optional(),
  successMessage: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ─── MEMBERS ────────────────────────────────────────────────

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]).default("STAFF"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
});

// ─── PRODUCT VARIANTS ───────────────────────────────────────

export const createProductVariantSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z.string().max(100).optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  image: z.string().url().optional().nullable(),
  options: z.record(z.string(), z.unknown()),
  position: z.number().int().min(0).default(0),
});

export const updateProductVariantSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sku: z.string().max(100).optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).optional(),
  image: z.string().url().optional().nullable(),
  options: z.record(z.string(), z.unknown()).optional(),
  position: z.number().int().min(0).optional(),
});

// ─── PRODUCT IMAGES ─────────────────────────────────────────

export const createProductImageSchema = z.object({
  url: z.string().url("Valid URL required"),
  alt: z.string().max(255).optional().nullable(),
  position: z.number().int().min(0).default(0),
});

export const updateProductImageSchema = z.object({
  alt: z.string().max(255).optional().nullable(),
  position: z.number().int().min(0).optional(),
});

// ─── MARKETPLACE ────────────────────────────────────────────

export const createMarketplaceItemSchema = z.object({
  type: z.enum(["THEME", "PLUGIN", "TEMPLATE", "FUNNEL", "AUTOMATION"]),
  themeId: z.string().optional().nullable(),
  pluginId: z.string().optional().nullable(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).default(0),
  currency: z.string().max(3).default("GHS"),
  thumbnail: z.string().url().optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const updateMarketplaceItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  price: z.number().min(0).optional(),
  thumbnail: z.string().url().optional().nullable(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// ─── ANALYTICS ──────────────────────────────────────────────

export const analyticsEventSchema = z.object({
  event: z.string().min(1, "Event type is required"),
  page: z.string().optional(),
  productId: z.string().optional(),
  orderId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  device: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
