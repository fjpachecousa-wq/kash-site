// src/utils/collector.js
// ===================================================
// Coleta de dados locais da aplicação (kashId e companyName)
// - kashId: vem de localStorage "last_tracking" (gerado no site)
// - companyName: tenta ler do formulário e de caches conhecidos
// ===================================================

/**
 * Retorna o tracking salvo no navegador em UPPERCASE.
 * Ex.: "KASH-ABC123"
 */
export function readKashId() {
  try {
    const stored = localStorage.getItem("last_tracking");
    return stored ? String(stored).toUpperCase().trim() : "";
  } catch {
    return "";
  }
}

/**
 * Busca o nome da empresa em:
 * 1) Campos do formulário (diferentes nomes)
 * 2) Objetos salvos no localStorage (se existirem)
 * 3) Elementos impressos na página
 */
export function readCompanyName() {
  // 1) Tentar direto nos inputs do formulário (vários nomes comuns)
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

  // 2) Tentar no localStorage (se sua app guarda a aplicação)
  const storageKeys = [
    "last_application",
    "application",
    "kash_application",
    "kash_contract",
  ];
  for (const key of storageKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);

      // caminhos típicos
      if (data?.companyName) return String(data.companyName).trim();
      if (data?.company?.companyName)
        return String(data.company.companyName).trim();
      if (data?.legalName) return String(data.legalName).trim();
      if (data?.businessName) return String(data.businessName).trim();
      if (data?.empresaNome) return String(data.empresaNome).trim();
    } catch {
      /* ignora JSON inválido */
    }
  }

  // 3) Tentar algo já impresso na página
  const printed =
    document.querySelector("[data-company-label]")?.textContent?.trim() || "";
  return printed;
}