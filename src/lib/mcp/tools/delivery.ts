/**
 * MCP Tools — Delivery Zones
 */

import { prisma } from "@/lib/db";
import type { MCPToolDef } from "../types";

const listDeliveryZones: MCPToolDef = {
  name: "list_delivery_zones",
  description: "List all delivery zones with areas, fees, and free-shipping thresholds.",
  category: "delivery",
  parameters: { type: "object", properties: {}, required: [] },
  mutates: false,
  requiresVerification: false,
  execute: async (_params, ctx) => {
    const zones = await prisma.deliveryZone.findMany({
      where: { siteId: ctx.siteId },
      orderBy: { position: "asc" },
    });

    return {
      action: "data",
      message: zones.length > 0
        ? `Found ${zones.length} delivery zone${zones.length !== 1 ? "s" : ""}.`
        : "No delivery zones set up yet. Would you like me to help create some?",
      data: {
        zones: zones.map((z) => ({
          id: z.id,
          name: z.name,
          areas: z.areas,
          fee: Number(z.fee),
          freeAbove: z.freeAbove ? Number(z.freeAbove) : null,
          estimatedDays: z.estimatedDays,
          isActive: z.isActive,
        })),
        currency: ctx.currency,
      },
    };
  },
};

const createDeliveryZone: MCPToolDef = {
  name: "create_delivery_zone",
  description: `Create a delivery zone. Before calling, ask:
- Zone name (e.g., "East Legon", "Within Accra", "Nationwide")
- Areas covered (list of areas/cities/states)
- Delivery fee
- Free shipping threshold (optional)
- Estimated delivery time

Suggest zones based on the store's country (e.g., for Ghana: Accra Central, East Legon, Southwest, Nationwide).`,
  category: "delivery",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string" },
      areas: { type: "array", items: { type: "string" }, description: "Areas/cities/states covered" },
      fee: { type: "number", description: "Delivery fee" },
      free_above: { type: "number", description: "Free delivery for orders above this amount" },
      estimated_days: { type: "string", description: "Estimated delivery time (e.g., '1-2 business days')" },
    },
    required: ["name", "areas", "fee"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    return {
      action: "verify",
      message: `I'll create delivery zone "${params.name}" covering ${(params.areas as string[]).join(", ")} with a ${ctx.currency} ${(params.fee as number).toLocaleString()} fee${params.free_above ? ` (free above ${ctx.currency} ${(params.free_above as number).toLocaleString()})` : ""}. Taking you to delivery settings to review.`,
      navigateTo: "delivery",
      prefill: {
        name: params.name,
        areas: params.areas,
        fee: params.fee,
        freeAbove: params.free_above || null,
        estimatedDays: params.estimated_days || "",
        _action: "create",
      },
    };
  },
};

const bulkCreateDeliveryZones: MCPToolDef = {
  name: "bulk_create_delivery_zones",
  description: "Create multiple delivery zones at once. Great for initial store setup.",
  category: "delivery",
  parameters: {
    type: "object",
    properties: {
      zones: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            areas: { type: "array", items: { type: "string" } },
            fee: { type: "number" },
            free_above: { type: "number" },
            estimated_days: { type: "string" },
          },
          required: ["name", "areas", "fee"],
        },
      },
    },
    required: ["zones"],
  },
  mutates: true,
  requiresVerification: true,
  execute: async (params, ctx) => {
    const zones = params.zones as any[];
    return {
      action: "verify",
      message: `I've prepared ${zones.length} delivery zones: ${zones.map((z: any) => z.name).join(", ")}. Taking you to delivery settings to review.`,
      navigateTo: "delivery",
      prefill: {
        _action: "bulk_create",
        zones: zones.map((z: any) => ({
          name: z.name,
          areas: z.areas,
          fee: z.fee,
          freeAbove: z.free_above || null,
          estimatedDays: z.estimated_days || "",
        })),
      },
    };
  },
};

const deleteDeliveryZone: MCPToolDef = {
  name: "delete_delivery_zone",
  description: "Delete a delivery zone.",
  category: "delivery",
  parameters: {
    type: "object",
    properties: {
      zone_id: { type: "string" },
    },
    required: ["zone_id"],
  },
  mutates: true,
  requiresVerification: false,
  execute: async (params, ctx) => {
    const zone = await prisma.deliveryZone.findFirst({
      where: { id: params.zone_id as string, siteId: ctx.siteId },
    });
    if (!zone) return { action: "error", message: "Delivery zone not found.", errorCode: "NOT_FOUND" };

    await prisma.deliveryZone.delete({ where: { id: zone.id } });
    return { action: "done", message: `Delivery zone "${zone.name}" deleted.` };
  },
};

export const deliveryTools: MCPToolDef[] = [
  listDeliveryZones,
  createDeliveryZone,
  bulkCreateDeliveryZones,
  deleteDeliveryZone,
];
