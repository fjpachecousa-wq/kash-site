import PDFDocument from "pdfkit";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/formspree-hook
 * Recebe o JSON do formulário, cria o case no Supabase, gera PDF e sobe no Storage.
 *
 * Requisitos em Vercel (Settings → Environment Variables):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE   (NÃO expor no front)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  try {
    // Se o Formspree enviar content-type application/json, req.body já vem parseado
    const body = req.body || {};

    // Se sua página já gera tracking, usamos; senão geramos aqui
    const tracking_number =
      body.tracking ||
      `KASH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;

    // Campos principais
    const companyName =
      body?.company?.companyName || body?.companyName || body?.customer_name || "";
    const customerEmail =
      body?.company?.email || body?.email || body?.customer_email || "";

    // 1) Conecta no Supabase (chave de servidor)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ ok: false, error: "Supabase env vars ausentes" });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    // 2) Insere o case
    const payload = {
      tracking_number,
      customer_email: customerEmail,
      customer_name: companyName,
      status: "NEW_FORM",
      timeline: {
        events: [{ ts: new Date().toISOString(), status: "Formulário recebido" }],
      },
      raw: body, // guarda tudo que veio do form (útil para conferência)
    };

    const { data: inserted, error: insertError } = await supabase
      .from("cases")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      return res.status(400).json({ ok: false, stage: "insert", error: insertError });
    }

    // 3) Gera PDF simples do contrato
    const pdfBuffer = await makeContractPdf({
      tracking: tracking_number,
      companyName,
      email: customerEmail,
    });

    // 4) Sobe o PDF no Storage (bucket: contracts)
    const objectPath = `contracts/${tracking_number}.pdf`;
    const upload = await supabase.storage
      .from("contracts")
      .upload(objectPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (upload.error) {
      return res.status(400).json({ ok: false, stage: "upload", error: upload.error });
    }

    // 5) Pega URL pública e atualiza a linha
    const { data: pub } = supabase.storage
      .from("contracts")
      .getPublicUrl(objectPath);
    const contract_url = pub?.publicUrl || null;

    await supabase
      .from("cases")
      .update({ contract_url })
      .eq("id", inserted.id);

    // 6) Resposta final (usada pelo Formspree ou pelo seu front)
    return res.status(200).json({
      ok: true,
      tracking_number,
      contract_url,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}

/** Gera PDF em memória e retorna Buffer */
function makeContractPdf({ tracking, companyName, email }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text("Contrato de Serviços — KASH", { align: "center" }).moveDown();
      doc.fontSize(12).text(`Tracking: ${tracking}`);
      doc.text(`Empresa/Cliente: ${companyName || "-"}`);
      doc.text(`E-mail: ${email || "-"}`).moveDown();
      doc.text("Cláusulas resumidas:");
      doc.text("1) Constituição LLC (Florida) e emissão de EIN.");
      doc.text("2) Endereço e agente por 12 meses.");
      doc.text("3) Pagamento conforme proposta no site.");
      doc.text("4) Entrega digital; prazos dependem de órgãos públicos.");
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
