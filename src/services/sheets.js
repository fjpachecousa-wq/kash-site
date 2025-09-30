// src/services/sheets.js
const APPS_URL = (import.meta.env?.VITE_APPS_SCRIPT_URL) 
  || (window.CONFIG && window.CONFIG.appsScriptUrl) 
  || "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

export async function sendToSheet({ kashId, companyName, faseAtual = 1, subFase = 0, acao = "create" }) {
  const payload = {
    kashId,
    companyName,
    faseAtual,
    subFase,
    atualizadoEm: new Date().toISOString(),
    acao
  };
  try {
    await fetch(APPS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {}
}
