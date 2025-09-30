// src/services/sheets.js

function getScriptUrl() {
  if (typeof window !== "undefined" && window.KASH_WIREFIX?.SCRIPT_URL) {
    return window.KASH_WIREFIX.SCRIPT_URL;
  }
  if (typeof SCRIPT_URL !== "undefined" && SCRIPT_URL) {
    return SCRIPT_URL;
  }
  // fallback fixo
  return "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";
}

export async function sendToSheet(payload = {}) {
  const url = getScriptUrl();

  const body = JSON.stringify({
    kashId: (payload.kashId || "").toString().trim(),
    companyName: (payload.companyName || "").toString().trim(),
    faseAtual: Number(payload.faseAtual ?? 1),
    subFase: Number(payload.subFase ?? 0),
    acao: payload.acao || "create",
  });

  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
