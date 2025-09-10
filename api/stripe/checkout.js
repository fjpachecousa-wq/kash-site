// /api/stripe/checkout.js
let stripe = null;
try {
  const Stripe = (await import("stripe")).default;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });
} catch (_) {}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { protocol, product } = req.body || {};
    if (!protocol) return res.status(400).json({ error: "protocol is required" });

    const catalog = { llc: 136000, flow30: 30000, scale5: 100000 };
    const nameMap = {
      llc: "Abertura LLC",
      flow30: "Kash Flow 30 (Mensal)",
      scale5: "Kash Scale 5 (Mensal)",
    };
    const price = catalog[product] ?? catalog.llc;
    const name = nameMap[product] ?? nameMap.llc;

    // Modo MOCK se não houver chave Stripe
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      const mock = `${req.headers.origin || ""}/?paid=1&protocol=${encodeURIComponent(protocol)}&mock=1`;
      return res.status(200).json({ url: mock, mock: true });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency: "usd", unit_amount: price, product_data: { name } }, quantity: 1 }],
      metadata: { protocol, product },
      success_url: `${req.headers.origin}/?paid=1&protocol=${encodeURIComponent(protocol)}`,
      cancel_url: `${req.headers.origin}/?cancelled=1&protocol=${encodeURIComponent(protocol)}`,
      automatic_tax: { enabled: false },
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: e.message || "stripe error" });
  }
}
