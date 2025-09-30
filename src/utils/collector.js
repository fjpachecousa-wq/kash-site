// src/utils/collector.js
// Coleta de dados locais (tracking + nome da empresa)

export function readKashId() {
  try {
    const last = localStorage.getItem("last_tracking") || "";
    return last ? String(last).toUpperCase().trim() : "";
  } catch {
    return "";
  }
}

export function readCompanyName() {
  // 1) Tenta pegar do formulário
  const selectors = [
    'input[name="companyName"]',
    'input[name="company_name"]',
    'input[name="legalName"]',
    'input[name="businessName"]',
    '#companyName',
    '#businessName',
    '[data-company-name]',
  ];
  for (const s of selectors) {
    const el = document.querySelector(s);
    if (el && typeof el.value === "string" && el.value.trim()) {
      return el.value.trim();
    }
  }

  // 2) Tenta localStorage
  const keys = ["last_companyName","last_application","application","kash_application","kash_contract"];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      if (k === "last_companyName") {
        const v = String(raw).trim();
        if (v) return v;
        continue;
      }
      const data = JSON.parse(raw);
      if (data?.companyName) return String(data.companyName).trim();
      if (data?.company?.companyName) return String(data.company.companyName).trim();
      if (data?.legalName) return String(data.legalName).trim();
      if (data?.businessName) return String(data.businessName).trim();
      if (data?.empresaNome) return String(data.empresaNome).trim();
    } catch {}
  }

  // 3) Tenta algo impresso na página
  const printed = document.querySelector("[data-company-label]")?.textContent?.trim() || "";
  return printed;
}

export function saveApplicationData(kashId, companyName) {
  try {
    if (kashId) localStorage.setItem("last_tracking", kashId);
    if (companyName) localStorage.setItem("last_companyName", companyName);
  } catch {}
}
