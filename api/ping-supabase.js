// Função serverless no Vercel (Node 18+ tem fetch nativo)
module.exports = async (req, res) => {
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;            // já configurada no Vercel
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;       // já configurada no Vercel
    const url  = `${base}/rest/v1/cases?select=id&limit=1`;

    const r = await fetch(url, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` }
    });

    const text = await r.text();
    res.status(r.status).send(text); // devolve exatamente o que o Supabase respondeu
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};
