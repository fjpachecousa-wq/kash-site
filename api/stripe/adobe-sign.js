// /api/webhooks/adobe-sign.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // TODO: validar assinatura do Adobe Sign e atualizar status (agreement signed)
  console.log("Adobe Sign webhook received (stub). Body:", req.body);
  return res.status(200).json({ ok: true });
}

