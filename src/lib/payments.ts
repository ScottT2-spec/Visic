import { prisma } from "./db";
import crypto from "crypto";

// ─── PAYSTACK ───────────────────────────────────────────────

export async function initializePaystackPayment(params: {
  secretKey: string;
  email: string;
  amount: number; // in kobo
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Paystack initialization failed");
  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export function verifyPaystackWebhook(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export async function verifyPaystackTransaction(reference: string, secretKey: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const data = await res.json();
  return data;
}

// ─── FLUTTERWAVE ────────────────────────────────────────────

export async function initializeFlutterwavePayment(params: {
  secretKey: string;
  amount: number;
  currency: string;
  email: string;
  reference: string;
  redirectUrl: string;
  customerName: string;
  meta?: Record<string, unknown>;
}) {
  const res = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.reference,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.email,
        name: params.customerName,
      },
      meta: params.meta,
      customizations: {
        title: "Visic Payment",
      },
    }),
  });

  const data = await res.json();
  if (data.status !== "success") throw new Error(data.message || "Flutterwave initialization failed");
  return data.data as { link: string };
}

export function verifyFlutterwaveWebhook(signature: string, secret: string): boolean {
  return signature === secret;
}

// ─── MONNIFY ────────────────────────────────────────────────

export async function getMonnifyAccessToken(apiKey: string, secretKey: string, baseUrl: string) {
  const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
  });
  const data = await res.json();
  if (!data.requestSuccessful) throw new Error("Monnify auth failed");
  return data.responseBody.accessToken as string;
}

export async function initializeMonnifyPayment(params: {
  accessToken: string;
  baseUrl: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  reference: string;
  description: string;
  contractCode: string;
  redirectUrl: string;
  paymentMethods?: string[];
}) {
  const res = await fetch(`${params.baseUrl}/api/v1/merchant/transactions/init-transaction`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      paymentReference: params.reference,
      paymentDescription: params.description,
      contractCode: params.contractCode,
      redirectUrl: params.redirectUrl,
      paymentMethods: params.paymentMethods || ["CARD", "ACCOUNT_TRANSFER", "USSD"],
    }),
  });

  const data = await res.json();
  if (!data.requestSuccessful) throw new Error(data.responseMessage || "Monnify initialization failed");
  return data.responseBody as { transactionReference: string; checkoutUrl: string };
}

export function verifyMonnifyWebhook(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

// ─── MOOLRE ─────────────────────────────────────────────────

export async function initializeMoolrePaymentLink(params: {
  apiUser: string;
  publicKey: string;
  amount: number;
  email: string;
  reference: string;
  callbackUrl: string;
  redirectUrl: string;
  currency: string;
  accountNumber: string;
  metadata?: Record<string, unknown>;
  expirationMinutes?: number;
  baseUrl?: string;
}) {
  const base = params.baseUrl || "https://api.moolre.com";
  const res = await fetch(`${base}/embed/link`, {
    method: "POST",
    headers: {
      "X-API-USER": params.apiUser,
      "X-API-PUBKEY": params.publicKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: 1,
      amount: String(params.amount),
      email: params.email,
      externalref: params.reference,
      callback: params.callbackUrl,
      redirect: params.redirectUrl,
      reusable: "0",
      expiration_time: params.expirationMinutes || 30,
      currency: params.currency,
      accountnumber: params.accountNumber,
      metadata: params.metadata,
    }),
  });

  const data = await res.json();
  if (data.status !== 1) throw new Error(data.message || "Moolre payment link generation failed");
  return data.data as { authorization_url: string; reference: string };
}

export async function initializeMoolreUssdPayment(params: {
  apiUser: string;
  privateKey: string;
  channel: string; // "13"=MTN, "6"=Telecel, "7"=AT
  currency: string;
  payer: string;
  amount: number;
  reference: string;
  accountNumber: string;
  description?: string;
  baseUrl?: string;
}) {
  const base = params.baseUrl || "https://api.moolre.com";
  const res = await fetch(`${base}/open/transact/payment`, {
    method: "POST",
    headers: {
      "X-API-USER": params.apiUser,
      "X-API-KEY": params.privateKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: 1,
      channel: params.channel,
      currency: params.currency,
      payer: params.payer,
      amount: String(params.amount),
      externalref: params.reference,
      reference: params.description || "",
      accountnumber: params.accountNumber,
    }),
  });

  const data = await res.json();
  if (data.status !== 1) throw new Error(data.message || "Moolre USSD payment failed");
  return { sessionId: data.data as string, code: data.code as string };
}

export async function verifyMoolrePayment(params: {
  apiUser: string;
  publicKey: string;
  reference: string;
  accountNumber: string;
  baseUrl?: string;
}) {
  const base = params.baseUrl || "https://api.moolre.com";
  const res = await fetch(`${base}/open/transact/status`, {
    method: "POST",
    headers: {
      "X-API-USER": params.apiUser,
      "X-API-PUBKEY": params.publicKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: 1,
      idtype: "1",
      id: params.reference,
      accountnumber: params.accountNumber,
    }),
  });

  const data = await res.json();
  return data;
}

// ─── COMMON: Process webhook payment confirmation ───────────

export async function processPaymentConfirmation(params: {
  reference: string;
  status: "SUCCESS" | "FAILED";
  method?: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;
}) {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { reference: params.reference },
  });

  if (!transaction) {
    console.error(`Transaction not found: ${params.reference}`);
    return null;
  }

  if (transaction.status !== "PENDING") {
    return transaction; // Already processed
  }

  const updated = await prisma.paymentTransaction.update({
    where: { id: transaction.id },
    data: {
      status: params.status,
      method: params.method,
      externalRef: params.externalRef,
      metadata: params.metadata as any,
      paidAt: params.status === "SUCCESS" ? new Date() : undefined,
    },
  });

  // Update order payment status
  if (transaction.orderId) {
    if (params.status === "SUCCESS") {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paidAt: new Date(),
        },
      });

      await prisma.orderTimeline.create({
        data: {
          orderId: transaction.orderId,
          status: "CONFIRMED",
          note: `Payment confirmed via ${params.method || "unknown"}`,
        },
      });
    } else {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { paymentStatus: "FAILED" },
      });
    }
  }

  return updated;
}
