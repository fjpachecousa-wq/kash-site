// src/utils/collector.js
export function readKashId() {
  try {
    const last = (localStorage.getItem("last_tracking") || "").trim();
    return last ? last.toUpperCase() : "";
  } catch { return ""; }
}

export function readCompanyName() {
  // 1) objeto salvo com a própria chave do tracking
  try {
    const key = (localStorage.getItem("last_tracking") || "").trim();
    if (key) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const j = JSON.parse(raw);
          const val = (j?.company?.companyName || j?.companyName || j?.businessName || j?.legalName || "").trim();
          if (val) return val;
        } catch {}
      }
    }
  } catch {}

  // 2) inputs comuns na página
  try {
    const el = document.querySelector(
      'input[name="companyName"],#companyName,[data-company-name],input[name="empresaNome"],input[name="nomeEmpresa"],input[name="businessName"],input[name="legalName"]'
    );
    if (el?.value?.trim()) return el.value.trim();
  } catch {}

  // 3) fallback em texto renderizado (ex.: contrato)
  try {
    const txt = document.body?.innerText || "";
    const m = txt.match(/(?:Empresa|Company)\s*:\s*([^\n\r]+)/i);
    if (m && m[1]) return m[1].trim();
  } catch {}

  return "";
}
