// /api/contract.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { form } = req.body || {};
    if (!form) return res.status(400).json({ error: "form is required" });

    const protocol = genProtocol();

    // TODO (produção):
    // 1) Preencher template PT/EN (DOCX → PDF)
    // 2) Subir PDF em storage (S3 / Vercel Blob)
    // 3) Criar acordo no Adobe Sign e obter signUrl
    // 4) Persistir {protocol, status, links} (Airtable/Supabase)

    // Fallback para testes (sem credenciais configuradas):
    const pdfUrl = `https://example.com/contract/${protocol}.pdf`;
    const signUrl = `https://example.com/sign/${protocol}`;

    return res.status(200).json({
      ok: true,
      protocol,
      pdfUrl,
      signUrl,
      message: "Mock de contrato gerado (configure Adobe Sign depois).",
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "contract error" });
  }
}

function genProtocol(prefix = "KASH") {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${y}${m}${day}-${rand}`;
}
