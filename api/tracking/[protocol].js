// api/tracking/[protocol].js
export default function handler(req, res) {
  const { protocol } = req.query;
  res.status(200).json({
    protocol,
    updatedAt: new Date().toISOString(),
    steps: [
      { key: "recv", label: "Dados recebidos", done: true },
      { key: "review", label: "Revisão de documentos", done: true },
      { key: "filing", label: "Filing no Estado da Flórida", done: false },
      { key: "ein", label: "Aplicação do EIN (IRS)", done: false },
      { key: "deliver", label: "Entrega dos documentos", done: false },
    ],
  });
}
