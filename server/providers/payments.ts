/**
 * payments.checkout / payments.webhooks capability (M1 §1 provider rewiring).
 * Business logic depends on this interface, never on the Stripe SDK directly.
 * Unconfigured -> capability is null and routes fail closed with a clear error,
 * matching the provider registry's 'unconfigured' probe status.
 */
import Stripe from "stripe";

export interface CheckoutSessionRequest {
  productName: string;
  productDescription: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string | null;
}

/** Vendor-neutral view of a completed checkout, for webhook consumers. */
export interface CheckoutCompleted {
  kind: "checkout.completed";
  sessionId: string;
  customerEmail: string | null;
  amountTotalCents: number | null;
  paymentIntentId: string | null;
  metadata: Record<string, string>;
}

export interface WebhookIgnored {
  kind: "ignored";
  eventType: string;
}

export type PaymentsWebhookEvent = CheckoutCompleted | WebhookIgnored;

export interface PaymentsCapability {
  createCheckoutSession(req: CheckoutSessionRequest): Promise<CheckoutSessionResult>;
  /** Verifies the webhook signature and parses the event. Throws on bad signature. */
  verifyWebhook(rawBody: Buffer, signature: string, webhookSecret: string): PaymentsWebhookEvent;
}

function stripePayments(secretKey: string): PaymentsCapability {
  const stripe = new Stripe(secretKey, { apiVersion: "2025-10-29.clover" });
  return {
    async createCheckoutSession(req) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: req.currency,
              product_data: { name: req.productName, description: req.productDescription },
              unit_amount: req.amountCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: req.successUrl,
        cancel_url: req.cancelUrl,
        customer_email: req.customerEmail,
        metadata: req.metadata,
      });
      return { sessionId: session.id, url: session.url };
    },
    verifyWebhook(rawBody, signature, webhookSecret) {
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      if (event.type !== "checkout.session.completed") {
        return { kind: "ignored", eventType: event.type };
      }
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata: Record<string, string> = {};
      for (const [k, v] of Object.entries(session.metadata ?? {})) metadata[k] = v ?? "";
      return {
        kind: "checkout.completed",
        sessionId: session.id,
        customerEmail: session.customer_email,
        amountTotalCents: session.amount_total,
        paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        metadata,
      };
    },
  };
}

/** null when unconfigured — callers fail closed, same visibility rule as the registry probe. */
export const payments: PaymentsCapability | null = process.env.STRIPE_SECRET_KEY
  ? stripePayments(process.env.STRIPE_SECRET_KEY)
  : null;
