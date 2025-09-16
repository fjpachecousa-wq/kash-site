// /api/tracking/[protocol].js
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/tracking/:protocol
 * Ex.: /api/tracking/KASH-ABC123
 *
 * Requer no Vercel (Project → Settings → Environment Variables):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE   (chave de servidor; NÃO expor no front)
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Use GET" });
  }

  try {
    const { protocol } = req.query;
    if (!protocol || typeof protocol !== "string") {
      return res.status(400).json({ ok: false, error: "protocol requerido na URL" });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !key) {
      return res.status(500).json({ ok: false, error: "Variáveis do Supabase ausentes" });
    }

    const supabase = createClient(url, key);

    // Busca o case pelo tracking_number
    const { data, error } = await supabase
      .from("cases")
      .select("id, tracking_number, status, timeline, contract_url, updated_at, customer_name")
      .eq("tracking_number", protocol)
      .single();

    if (error || !data) {
      return res.status(404).json({ ok: false, error: "Tracking não encontrado" });
    }

    // Normaliza timeline (lista de { ts, status, note } )
    const events = Array.isArray(data?.timeline?.events) ? data.timeline.events : [];

    return res.status(200).json({
      ok: true,
      protocol: data.tracking_number,
      status: data.status || "NEW_FORM",
      updatedAt: data.updated_at,
      customerName: data.customer_name || null,
      contractUrl: data.contract_url || null,
      steps: events.map((e) => ({
        label: e.status,
        note: e.note || null,
        ts: e.ts,
        done: true
      }))
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
