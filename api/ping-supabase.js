export default async function handler(req, res) {
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!base || !anon) {
      return res.status(500).json({ error: "Variáveis de ambiente não encontradas" });
    }

    const url = `${base}/rest/v1/cases?select=id&limit=1`;
    const r = await fetch(url, {
      headers: { apikey: anon, Authorization: `Bearer ${anon}` }
    });

    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
