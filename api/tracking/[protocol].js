// api/tracking/[protocol].js
export default function handler(req, res) {
  const { protocol } = req.query;

  if (!protocol) {
    return res.status(400).json({ error: "Protocolo não informado." });
  }

  res.status(200).json({
    protocol,
    updatedAt: new Date().toISOString(),
    steps: [
      { key: "form", label: "Formulário recebido", done: true },
      { key: "contract", label: "Contrato gerado", done: true },
      { key: "signature", label: "Assinatura pendente", done: false },
      { key: "payment", label: "Pagamento pendente", done: false },
      { key: "filing", label: "Registro na Flórida", done: false },
      { key: "ein", label: "Aplicação EIN (IRS)", done: false },
    ],
  });
}
