// /api/webhooks/stripe.js
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // TODO: validar assinatura do Stripe (STRIPE_WEBHOOK_SECRET) e processar eventos
  // Aqui deixamos stub para não travar desenvolvimento.
  if (import.meta.env && import.meta.env.DEV) console.log("Stripe webhook received (stub).");
  return res.status(200).json({ ok: true });
}
