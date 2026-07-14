/**
 * AfroStore Plugin System — Types
 *
 * WordPress-level plugin architecture adapted for Next.js serverless.
 * Plugins are config-driven with declarative hooks, settings schemas,
 * and sandboxed execution.
 */

// ─── Hook System ────────────────────────────────────────────

export type HookName =
  // Checkout hooks
  | "checkout:before"        // Before checkout starts — can add fees, validate
  | "checkout:after"         // After successful checkout
  | "checkout:validate"      // Validate cart before payment
  // Order hooks
  | "order:created"          // New order placed
  | "order:status_changed"   // Order status updated
  | "order:paid"             // Payment confirmed
  | "order:shipped"          // Order shipped
  | "order:delivered"        // Order delivered
  | "order:cancelled"        // Order cancelled
  // Product hooks
  | "product:created"        // New product added
  | "product:updated"        // Product updated
  | "product:viewed"         // Product page viewed (storefront)
  // Customer hooks
  | "customer:created"       // New customer registered
  | "customer:order_placed"  // Customer placed an order
  // Cart hooks
  | "cart:updated"           // Cart modified
  | "cart:item_added"        // Item added to cart
  // Page/Storefront hooks
  | "storefront:head"        // Inject into <head> (pixels, analytics)
  | "storefront:footer"      // Inject before </body>
  | "storefront:product_card"// Modify product card rendering
  // Admin/Dashboard hooks
  | "dashboard:widget"       // Add widget to dashboard
  // Scheduled hooks
  | "cron:daily"             // Runs daily
  | "cron:hourly";           // Runs hourly

export interface HookContext {
  siteId: string;
  hook: HookName;
  data: Record<string, unknown>;
  pluginSettings: Record<string, unknown>;
  store: {
    name: string;
    currency: string;
    country: string;
  };
}

export interface HookResult {
  modified?: Record<string, unknown>;  // Modified data to pass forward
  actions?: HookAction[];              // Side effects to execute
  inject?: string;                     // HTML/script to inject (for head/footer hooks)
  fees?: AddedFee[];                   // Fees to add (checkout hooks)
  errors?: string[];                   // Validation errors (validate hooks)
  widgets?: DashboardWidget[];         // Widgets to add (dashboard hooks)
  notifications?: Notification[];      // Notifications to send
}

export interface HookAction {
  type: "send_whatsapp" | "send_email" | "send_sms" | "log" | "update_order" | "update_product" | "create_coupon" | "add_points";
  params: Record<string, unknown>;
}

export interface AddedFee {
  name: string;
  amount: number;
  description?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: "stat" | "chart" | "list" | "html";
  data: Record<string, unknown>;
  position?: number;
}

export interface Notification {
  channel: "whatsapp" | "email" | "sms";
  to: string;
  message: string;
  template?: string;
}

// ─── Plugin Definition ──────────────────────────────────────

export interface PluginManifest {
  slug: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  icon?: string;
  isPremium: boolean;
  tags: string[];

  // What hooks this plugin subscribes to
  hooks: PluginHookDef[];

  // Settings schema (rendered as form in dashboard)
  settingsSchema: SettingsField[];

  // Default settings values
  defaultSettings: Record<string, unknown>;

  // Storefront blocks this plugin adds to the builder
  blocks?: PluginBlock[];

  // Permissions this plugin needs
  permissions: PluginPermission[];
}

export interface PluginHookDef {
  hook: HookName;
  priority: number;        // Lower = runs first (like WordPress)
  handler: string;         // Handler function name (maps to built-in handlers)
  description?: string;
}

export type PluginCategory =
  | "payments"
  | "delivery"
  | "communication"
  | "marketing"
  | "analytics"
  | "inventory"
  | "seo"
  | "social"
  | "security"
  | "productivity"
  | "design"
  | "other";

export type PluginPermission =
  | "read:orders"
  | "write:orders"
  | "read:products"
  | "write:products"
  | "read:customers"
  | "write:customers"
  | "read:analytics"
  | "send:notifications"
  | "modify:checkout"
  | "modify:storefront"
  | "manage:coupons";

// ─── Settings Schema ────────────────────────────────────────

export interface SettingsField {
  key: string;
  label: string;
  type: "text" | "number" | "toggle" | "select" | "textarea" | "color" | "url" | "email" | "phone" | "json" | "group";
  description?: string;
  placeholder?: string;
  required?: boolean;
  default?: unknown;
  options?: { label: string; value: string }[];  // For select type
  min?: number;
  max?: number;
  fields?: SettingsField[];  // For group type
  condition?: { field: string; value: unknown };  // Show only when condition met
}

// ─── Plugin Block (for builder) ─────────────────────────────

export interface PluginBlock {
  type: string;
  label: string;
  icon: string;
  category: string;
  defaultProps: Record<string, unknown>;
  settingsSchema: SettingsField[];
  renderTemplate: string;  // HTML template with {{variable}} placeholders
}

// ─── Execution Result ───────────────────────────────────────

export interface PluginExecResult {
  pluginSlug: string;
  pluginName: string;
  hook: HookName;
  success: boolean;
  result?: HookResult;
  error?: string;
  durationMs: number;
}
