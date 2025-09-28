/* kash-datafix.js — persistir e enviar kashId + companyName para o Apps Script
   • Não altera layout
   • Funciona com <form action=".../exec"> e com fetch() para o Apps Script
*/
if (typeof window !== "undefined" && !window.__KASH_DATAFIX__) {
  window.__KASH_DATAFIX__ = true;

  const API = () => {
    try { return (window.SCRIPT_URL || (window.CONFIG && window.CONFIG.appsScriptUrl)) || ""; } catch { return ""; }
  };

  // 1) Guarda o nome da empresa enquanto o usuário digita
  const mirrorCompany = () => {
    try {
      const $ = (s) => document.querySelector(s);
      const finder = () =>
        $('input[name="companyName"]') ||
        $('#companyName') ||
        $('[data-company-name]') ||
        $('input[name="empresaNome"]') ||
        // fallback por placeholder "empresa"/"company"
        [...document.querySelectorAll('input[type="text"],input:not([type])')]
          .find(i => ((i.placeholder||"").toLowerCase().includes("empresa") || (i.placeholder||"").toLowerCase().includes("company")));
      const el = finder();
      if (!el) return;
      const save = () => { try { localStorage.setItem("companyName", (el.value||"").trim()); } catch {} };
      el.addEventListener("input", save, { passive: true });
      save();
    } catch {}
  };

  // 2) Assim que o contrato/preview surge, captura KASH-.... e guarda
  const mirrorKash = () => {
    try {
      const text = (document.body.innerText || "");
      const m = text.match(/KASH-[A-Z0-9-]{4,}/i);
      if (m && m[0]) { try { localStorage.setItem("last_tracking", String(m[0]).toUpperCase()); } catch {} }
    } catch {}
  };

  // 3) Antes de enviar formulário ao Apps Script, injeta os campos
  const ensureHidden = (form, name, val) => {
    let el = form.querySelector('input[name="'+name+'"]');
    if (!el) { el = document.createElement("input"); el.type="hidden"; el.name=name; form.appendChild(el); }
    el.value = val;
  };
  const isAppsScriptForm = (form) => {
    const a = String(form.getAttribute("action")||"");
    const su = API();
    return a.includes("script.google.com/macros") || (su && a.indexOf(su)===0);
  };
  const prepareForm = (form) => {
    try {
      const kid = (localStorage.getItem("last_tracking") || localStorage.getItem("kashId") || localStorage.getItem("tracking") || "").toUpperCase().trim();
      const cname = (localStorage.getItem("companyName") || "").trim();
      if (kid) { ensureHidden(form,"kashId",kid); ensureHidden(form,"hashId",kid); }
      if (cname) { ensureHidden(form,"companyName",cname); ensureHidden(form,"empresaNome",cname); }
    } catch {}
  };
  const wireForms = () => {
    const forms = document.querySelectorAll("form");
    for (let i=0;i<forms.length;i++) {
      const f = forms[i];
      if (isAppsScriptForm(f) && !f.__kash_datafix__) {
        f.addEventListener("submit", () => prepareForm(f), true);
        f.addEventListener("focusout", () => prepareForm(f), true);
        prepareForm(f);
        f.__kash_datafix__ = true;
      }
    }
  };

  // 4) Reforço: se enviar via fetch() ao Apps Script, anexa os campos
  const patchFetch = () => {
    if (window.__KASH_FETCH_DATAFIX__) return;
    const _fetch = window.fetch;
    window.fetch = function(input, init){
      try{
        const url = (typeof input==="string") ? input : (input && input.url) || "";
        const su  = API();
        const toScript = url.includes("script.google.com/macros") || (su && url.indexOf(su)===0);
        if (toScript && init){
          const kid   = (localStorage.getItem("last_tracking") || localStorage.getItem("kashId") || localStorage.getItem("tracking") || "").toUpperCase().trim();
          const cname = (localStorage.getItem("companyName") || "").trim();
          let b = init.body;
          if (typeof b === "string" && b){
            let o; try { o = JSON.parse(b); } catch { o = { raw: String(b) }; }
            if (kid && !o.kashId) o.kashId = kid;
            if (kid && !o.hashId) o.hashId = kid;
            if (cname && !o.companyName) o.companyName = cname;
            if (cname && !o.empresaNome) o.empresaNome = cname;
            init.body = JSON.stringify(o);
          } else if (typeof FormData!=="undefined" && b instanceof FormData){
            if (kid && !b.has("kashId")) b.set("kashId", kid);
            if (kid && !b.has("hashId")) b.set("hashId", kid);
            if (cname && !b.has("companyName")) b.set("companyName", cname);
            if (cname && !b.has("empresaNome")) b.set("empresaNome", cname);
          } else if (typeof URLSearchParams!=="undefined" && b instanceof URLSearchParams){
            if (kid && !b.has("kashId")) b.set("kashId", kid);
            if (kid && !b.has("hashId")) b.set("hashId", kid);
            if (cname && !b.has("companyName")) b.set("companyName", cname);
            if (cname && !b.has("empresaNome")) b.set("empresaNome", cname);
          }
        }
      }catch{}
      return _fetch.apply(this, arguments);
    };
    window.__KASH_FETCH_DATAFIX__ = true;
  };

  document.addEventListener("DOMContentLoaded", () => { mirrorCompany(); mirrorKash(); wireForms(); patchFetch(); });
  new MutationObserver(() => { mirrorCompany(); mirrorKash(); wireForms(); })
    .observe(document.documentElement, { childList: true, subtree: true });
}
