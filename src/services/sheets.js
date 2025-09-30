// src/services/sheets.js
// ===================================================
// Envio para Google Apps Script (Processos KASH)
// - carrega kashId e companyName do collector
// - formata payload; o Apps Script já cuida das datas/formato BR
// ===================================================

import { readKashId, readCompanyName } from "../utils/collector";

// 👉 Se você preferir usar variável de ambiente na Vercel,
// troque pela linha comentada abaixo e configure VITE_APPS_SCRIPT_URL.
// const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

/**
 * Envia um registro para a planilha:
 * - kashId (tracking)
 * - companyName (nome da empresa)
 * - faseAtual/subFase (fixos durante teste; ajuste se necessário)
 * - extra: objeto com campos adicionais se quiser
 */
export async function sendToSheets(extra = {}) {
  const payload = {
    kashId: readKashId(),
    companyName: readCompanyName(),
    faseAtual: 1,
    subFase: 0,
    ...extra,
  };

  // Evita enviar placeholders vazios; Apps Script também filtra
  if (!payload.kashId && !payload.companyName) {
    console.warn("Nada para enviar (kashId/companyName vazios).");
  }

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Erro ao enviar para Sheets:", err);
  }
}