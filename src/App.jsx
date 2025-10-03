import { jsPDF } from "jspdf";
import React, { useReducer, useState, useEffect } from "react";
import kashLogo from "/kash-logo.jpg";
// === Endpoint do Apps Script via Environment (Vercel) ===
const APPS_SCRIPT_URL =
  (typeof import.meta.meta !== "undefined" && import.meta.env?.VITE_APPS_SCRIPT_URL) ||
  (typeof window !== "undefined" && window.APPS_SCRIPT_URL) ||
  "";
/* === KASH WIREFIX (Google Sheets) === */
if (typeof window !== "undefined" && !window.__KASH_WIRE__) {
  window.__KASH_WIRE__ = true;
  // URL publicada do Apps Script
  window.CONFIG = window.CONFIG || {};
  window.CONFIG.appsScriptUrl = APPS_SCRIPT_URL;
  const getAPI = () => (window.CONFIG && window.CONFIG.appsScriptUrl) || "";
  // Salvar companyName enquanto digita
  const mirrorCompany = () => {
    try {
      const $ = (s) => document.querySelector(s);
      const el =
        $('input[name="companyName"]') ||
        $('#companyName') ||
        $('[data-company-name]') ||
        $('input[name="empresaNome"]') ||
        Array.from(document.querySelectorAll('input[type="text"],input:not([type])'))
          .find(i => (i.placeholder||"").toLowerCase().includes("empresa") || (i.placeholder||"").toLowerCase().includes("company"));
      if (!el) return;
      const save = () => { try { localStorage.setItem("companyName", (el.value||"").trim()); } catch {} };
      el.addEventListener("input", save, { passive: true });
      save();
    } catch {}
  };
  // Capturar KASH real no DOM (ignora KASH-XXXXXX)
  const captureKash = () => {
    try {
      const m = (document.body.innerText||"").match(/KASH-(?!X{6})[A-Z0-9-]{4,}/i);
      if (m && m[0]) localStorage.setItem("last_tracking", String(m[0]).toUpperCase());
    } catch {}
  };
  // Expor função para setar tracking no momento da geração
  window.__setKashTracking = function(code){
    try {
      const real = String(code||"").toUpperCase();
      if (/^KASH-(?!X{6})[A-Z0-9-]{4,}$/.test(real)) localStorage.setItem("last_tracking", real);
    } catch {}
  };
  // Injetar ocultos antes de enviar forms ao Apps Script
  const ensureHidden = (form, name, val) => {
    let el = form.querySelector('input[name="'+name+'"]');
    if (!el) { el = document.createElement("input"); el.type="hidden"; el.name=name; form.appendChild(el); }
    el.value = val;
  };
  const isAppsScriptForm = (f) => {
    const a = String(f.getAttribute("action")||"");
    const su = getAPI();
    return a.includes("script.google.com/macros") || (su && a.startsWith(su));
  };
  const prepareForm = (form) => {
    const kid = (localStorage.getItem("last_tracking") || localStorage.getItem("kashId") || localStorage.getItem("tracking") || "").toUpperCase().trim();
    const cname = (localStorage.getItem("companyName") || "").trim();
    if (kid)   { ensureHidden(form, "kashId", kid); ensureHidden(form, "hashId", kid); }
    if (cname) { ensureHidden(form, "companyName", cname); ensureHidden(form, "empresaNome", cname); }
  };
  const wireForms = () => {
    document.querySelectorAll("form").forEach(f => {
      if (isAppsScriptForm(f) && !f.__kash_wired) {
        f.addEventListener("submit", () => prepareForm(f), true);
        f.addEventListener("focusout", () => prepareForm(f), true);
        prepareForm(f);
        f.__kash_wired = true;
      }
    });
  };
  // Reforço no clique do "Concluir teste"
  const reinforceConcluir = () => {
    const su = getAPI(); if (!su) return;
    Array.from(document.querySelectorAll("button,a,[role='button']"))
      .filter(b => /concluir\s*teste/i.test(b.textContent||""))
      .forEach(b => {
        if (b.__kash_click_wired) return;
        b.addEventListener("click", () => {
          try {
            const kashId = (localStorage.getItem("last_tracking") || localStorage.getItem("kashId") || localStorage.getItem("tracking") || "").toUpperCase().trim();
            const companyName = (localStorage.getItem("companyName") || "").trim();
            if (!kashId && !companyName) return;
            const payload = { kashId, companyName, faseAtual: 1, subFase: 0, atualizadoEm: new Date().toISOString() };
            fetch(su, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), mode: "no-cors" }).catch(()=>{});
          } catch {}
        }, { passive: true });
        b.__kash_click_wired = true;
      });
  };
  document.addEventListener("DOMContentLoaded", () => { mirrorCompany(); captureKash(); wireForms(); reinforceConcluir(); });
  new MutationObserver(() => { captureKash(); wireForms(); }).observe(document.documentElement, { childList: true, subtree: true });
}
/* === /KASH WIREFIX === */
// ===== KASH INLINE SHIM (injeta companyName + kashId nos envios ao Apps Script) =====
(function(){
  function getCompanyName(){
  try{
    var q = function(s){ return document.querySelector(s); };
    return (
        <section className="mb-6">
          <div className="promo bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-300">
          </div>
        </section>
        (q('input[name="companyName"]') && q('input[name="companyName"]').value.trim()) ||
        (q('#companyName') && q('#companyName').value.trim()) ||
        (q('[data-company-name]') && (q('[data-company-name]').getAttribute('data-company-name')||'').trim()) ||
        (q('input[name="empresaNome"]') && q('input[name="empresaNome"]').value.trim()) ||
        ""
      );
    }catch(_){ return ""; }
  }
  function getKashId(){
    try{
      var v = localStorage.getItem("last_tracking") ||
              localStorage.getItem("kashId") ||
              localStorage.getItem("tracking") || "";
      return String(v).toUpperCase().trim();
    }catch(_){ return ""; }
  }
  function addMetaObject(obj){
    obj = obj || {};
    var k = getKashId();
    var c = getCompanyName();
    if (k && !obj.kashId) obj.kashId = k;
    if (k && !obj.hashId) obj.hashId = k;
    if (c && !obj.companyName) obj.companyName = c;
    if (c && !obj.empresaNome) obj.empresaNome = c;
    return obj;
  }
  function addMetaFormData(fd){
    try{
      var k = getKashId();
      var c = getCompanyName();
      if (k && !fd.has('kashId')) fd.set('kashId', k);
      if (k && !fd.has('hashId')) fd.set('hashId', k);
      if (c && !fd.has('companyName')) fd.set('companyName', c);
      if (c && !fd.has('empresaNome')) fd.set('empresaNome', c);
    }catch(_){}
  }
  function addMetaSearchParams(sp){
    try{
      var k = getKashId();
      var c = getCompanyName();
      if (k && !sp.has('kashId')) sp.set('kashId', k);
      if (k && !sp.has('hashId')) sp.set('hashId', k);
      if (c && !sp.has('companyName')) sp.set('companyName', c);
      if (c && !sp.has('empresaNome')) sp.set('empresaNome', c);
    }catch(_){}
  }
  function isAppsScriptUrl(u){
    try{
      var su = (typeof window!=='undefined' && (window.SCRIPT_URL || (window.CONFIG && window.CONFIG.appsScriptUrl))) ||
               (typeof SCRIPT_URL!=='undefined' && SCRIPT_URL) || "";
      return (su && String(u||"").indexOf(String(su))===0) ||
             String(u||"").indexOf("script.google.com/macros")>=0;
    }catch(_){ return false; }
  }
  try{
    if (typeof window!=='undefined' && !window.__kash_inline_fetch_patched){
      var _fetch = window.fetch;
      window.fetch = function(input, init){
        try{
          var url = (typeof input==="string") ? input : (input && input.url) || "";
          if (isAppsScriptUrl(url) && init){
            var body = init.body;
            if (typeof body === "string" && body){
              try{
                var obj = JSON.parse(body);
                init.body = JSON.stringify(addMetaObject(obj));
              }catch(_){
                init.body = JSON.stringify(addMetaObject({ raw: body }));
              }
            } else if (typeof FormData !== "undefined" && body instanceof FormData){
              addMetaFormData(body);
            } else if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams){
              addMetaSearchParams(body);
            }
          }
        }catch(_){}
        return _fetch.apply(this, arguments);
      };
      window.__kash_inline_fetch_patched = true;
    }
  }catch(_){}
})();
// ===== FIM KASH INLINE SHIM =====
// ====== KASH SHIM (NÃO muda layout / JSX) ======
(function(){
  // Lê companyName do DOM (vários seletores válidos)
  function getCompanyName(){
  try{
    var q = function(s){ return document.querySelector(s); };
    return (
        (q('input[name="companyName"]') && q('input[name="companyName"]').value.trim()) ||
        (q('#companyName') && q('#companyName').value.trim()) ||
        (q('[data-company-name]') && (q('[data-company-name]').getAttribute('data-company-name')||'').trim()) ||
        (q('input[name="empresaNome"]') && q('input[name="empresaNome"]').value.trim()) ||
        ""
      );
    }catch(_){ return ""; }
  }
  // Lê kashId do localStorage
  function getKashId(){
    try{
      var v = localStorage.getItem("last_tracking") || localStorage.getItem("kashId") || localStorage.getItem("tracking") || "";
      return String(v).toUpperCase().trim();
    }catch(_){ return ""; }
  }
  // Adiciona metadados ao JSON
  function addMeta(obj){
    obj = obj || {};
    var k = getKashId();
    var c = getCompanyName();
    if (k && !obj.kashId) obj.kashId = k;
    if (k && !obj.hashId) obj.hashId = k;
    if (c && !obj.companyName) obj.companyName = c;
    if (c && !obj.empresaNome) obj.empresaNome = c;
    return obj;
  }
  // Detecta a URL do Apps Script
  function isAppsScriptUrl(u){
    try{
      var su = (typeof window!=='undefined' && (window.SCRIPT_URL || (window.CONFIG && window.CONFIG.appsScriptUrl))) || (typeof SCRIPT_URL!=='undefined' && SCRIPT_URL) || "";
      return su && String(u||"").indexOf(String(su))===0;
    }catch(_){ return false; }
  }
  // Patch do fetch (uma vez só)
  try{
    if (typeof window!=='undefined' && !window.__kash_fetch_patched){
      var _fetch = window.fetch;
      window.fetch = function(input, init){
        try{
          var url = (typeof input==="string") ? input : (input && input.url) || "";
          if (isAppsScriptUrl(url) && init && typeof init.body==="string" && init.body){
            try{
              var obj = JSON.parse(init.body);
              init.body = JSON.stringify(addMeta(obj));
            }catch(_){
              // se não for JSON, empacota minimamente
              try{ init.body = JSON.stringify(addMeta({raw:init.body})); }catch(__){}
            }
          }
        }catch(_){}
        return _fetch.apply(this, arguments);
      };
      window.__kash_fetch_patched = true;
    }
  }catch(_){}
})();
// ====== FIM KASH SHIM ======
// ====== KASH COMPANY PATCH (somente companyName; sem alterar layout) ======
(function(){
  function __kash_getCompanyName(){
    try{
      const c1 = document.querySelector('input[name="companyName"]')?.value;
      const c2 = document.querySelector('input[name="empresaNome"]')?.value;
      const c3 = document.querySelector('#companyName')?.value;
      const c4 = document.querySelector('[data-company-name]')?.getAttribute('data-company-name');
      const c5 = document.querySelector('[name*="company"]')?.value;
      return (c1 || c2 || c3 || c4 || c5 || "").toString().trim();
    } catch(_){ return ""; }
  }
  try{
    const __orig_fetch = window.fetch;
    window.fetch = function(input, init){
      try{
        const url = (typeof input === "string") ? input : (input && input.url) ? input.url : "";
        const target = (url || "").toString();
        const scriptUrl = (window.SCRIPT_URL || (typeof SCRIPT_URL === "string" ? SCRIPT_URL : "")) || "";
        if (scriptUrl && target.startsWith(scriptUrl)) {
          if (init && init.body && typeof init.body === "string" && init.body.trim().startsWith("{")) {
            try{
              const obj = JSON.parse(init.body);
              const name = __kash_getCompanyName();
              if (name) {
                if (!Object.prototype.hasOwnProperty.call(obj, "companyName")) obj.companyName = name;
                if (!Object.prototype.hasOwnProperty.call(obj, "empresaNome")) obj.empresaNome = name;
                init.body = JSON.stringify(obj);
              }
            }catch(_){ /* corpo não-json, ignora */ }
          }
        }
      }catch(_){}
      return __orig_fetch.apply(this, arguments);
    };
  }catch(_){}
})();
// ====== FIM KASH COMPANY PATCH ======
const SCRIPT_URL = APPS_SCRIPT_URL;
/* ================== CONFIG ================== */
const CONFIG = {
  contact: { whatsapp: "", email: "contato@kashsolutions.us", calendly: "" }, // WhatsApp oculto por ora
  checkout: { stripeUrl: "https://buy.stripe.com/5kQdR95j9eJL9E06WVebu00" }, // futuro
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
};
// === KASH Process API (Google Apps Script) ===
const PROCESSO_API = APPS_SCRIPT_URL;
async function apiGetProcesso(kashId){
  const r = await fetch(`${PROCESSO_API}?kashId=${encodeURIComponent(kashId)}`);
  if(!r.ok) throw new Error("not_found");
  return r.json();
}
async function apiUpsert({kashId, companyName, atualizadoEm}){
  const r = await fetch(PROCESSO_API,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ action:"upsert", kashId, companyName, faseAtual:1, subFase:null, atualizadoEm: atualizadoEm || new Date().toISOString() })
  });
  if(!r.ok) throw new Error("upsert_failed");
  return r.json();
}
async function apiUpdate({kashId, faseAtual, subFase, status, note}){
  const r = await fetch(PROCESSO_API,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ action:"update", kashId, faseAtual, subFase: subFase || null, status: status || "Atualização", note: note || "" })
  });
  if(!r.ok) throw new Error("update_failed");
  return r.json();
}
// ===== PRIVACIDADE: armazenar apenas códigos de tracking (atalhos) =====
function saveTrackingShortcut(kashId) {
  try {
    if (!kashId) return;
    const key = "kash.tracking.shortcuts";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    if (!list.includes(kashId)) list.unshift(kashId);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
  } catch {}
}
function getTrackingShortcuts() {
  try { return JSON.parse(localStorage.getItem("kash.tracking.shortcuts") || "[]"); }
  catch { return []; }
}
function clearAnySensitiveLocalData() {
  try {
    const keepKey = "kash.tracking.shortcuts";
    const shortcuts = localStorage.getItem(keepKey);
    localStorage.clear();
    if (shortcuts) localStorage.setItem(keepKey, shortcuts);
  } catch {}
}
clearAnySensitiveLocalData();
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;
function classNames(...cls) { return cls.filter(Boolean).join(" "); }
function todayISO() {
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
/* ================== HELPERS ================== */
function calcAgeFullDate(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}
function isPercentTotalValid(members) {
  const sum = members.reduce((acc, m) => acc + (Number(m.percent || 0) || 0), 0);
  return Math.abs(sum - 100) < 0.001;
}
/* ================== UI ================== */
function KLogo({ size = 40 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-2xl bg-slate-900" />
      <div className="absolute inset-[3px] rounded-xl bg-slate-800 shadow-inner" />
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 64 64" className="absolute">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
        <path d="M14 8h8v48h-8z" fill="url(#g)" />
        <path d="M26 32l22-24h10L42 32l16 24H48L26 32z" fill="url(#g)" />
      </svg>
    </div>
  );
}
function CTAButton({ children, variant = "primary", onClick, type = "button", disabled = false }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === "primary"
    ? "bg-emerald-500/90 hover:bg-emerald-500 text-slate-900 shadow"
    : variant === "ghost"
    ? "bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-800"
    : "bg-slate-700 text-slate-100 hover:bg-slate-600";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
/* ======= Tracking Search (inline) ======= */
function TrackingSearch() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const handleLookup = async () => {
    try {
      try { const obj = await apiGetProcesso(code.trim()); setResult({ tracking: obj.kashId, dateISO: obj.atualizadoEm, company: { companyName: (obj.companyName || '—' || (typeof localStorage !== "undefined" && localStorage.getItem("companyName")) || "")}, updates: obj.updates || [], faseAtual: obj.faseAtual || 1, subFase: obj.subFase || null }); saveTrackingShortcut(code.trim()); setNotFound(false); return; } catch(e) { setResult(null); setNotFound(true); return; }
      setResult(data);
      setNotFound(false);
    } catch { setResult(null); setNotFound(true); }
  };
  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <SectionTitle title="Consultar processo por Tracking" subtitle="Insira seu código (ex.: KASH-XXXXXX) para verificar os dados enviados e baixar o contrato." />
        <div className="mt-4 flex gap-2">
          <input className="flex-1 rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="KASH-ABC123" value={code} onChange={(e)=>setCode(e.target.value)} />
          <CTAButton onClick={handleLookup}>Consultar</CTAButton>
        </div>
        {notFound && <div className="text-sm text-red-400 mt-2">Tracking não encontrado neste dispositivo.</div>}
        {result && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-slate-300 font-medium">Status</div>
            <div className="text-slate-400 text-sm mt-1">Recebido em {result.dateISO}. Empresa: {result.company?.companyName || "—"}</div>
            <div className="mt-3">
              <div className="text-slate-400 text-sm mb-1">Linha do tempo:</div>
              <div className="space-y-2">
                {(result.updates || []).map((u, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1" />
                    <div className="text-sm text-slate-300">
                      <div className="font-medium">{u.status}</div>
                      <div className="text-xs text-slate-400">{u.ts}{u.note ? ` — ${u.note}` : ""}</div>
                    </div>
                  </div>
                ))}
                {(!result.updates || result.updates.length === 0) && (
                  <div className="text-xs text-slate-500">Sem atualizações adicionais.</div>
                )}
              </div>
            </div>
            <div className="mt-4">
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
/* ======= Admin + My Trackings ======= */
function MyTrackings() {
  const [list, setList] = useState([]);
  useEffect(() => {
    try { const raw = localStorage.getItem("KASH_TRACKINGS"); setList(raw ? JSON.parse(raw) : []); } catch { setList([]); }
  }, []);
  if (!list || list.length === 0) return null;
  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <SectionTitle title="Meus protocolos neste dispositivo" subtitle="Últimos cadastros salvos neste navegador." />
        <div className="mt-4 grid gap-3">
          {list.map((e) => (
            <div key={e.code} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3">
              <div className="text-sm text-slate-300">
                <div className="font-medium">{e.company || "—"}</div>
                <div className="text-slate-400 text-xs">Tracking: {e.code} · {e.dateISO}</div>
              </div>
              <div className="flex gap-2">
                <CTAButton onClick={() => {
      try {
        const kashId = (localStorage.getItem("last_tracking") || "").toUpperCase();
        const companyName = document.querySelector('input[name="companyName"]')?.value || "";
        fetch(SCRIPT_URL, {
          mode: "no-cors",
          method: "POST",
          body: JSON.stringify({ kashId, faseAtual: 1, atualizadoEm: new Date().toISOString(), companyName }),
          mode: "no-cors"
        });
      } catch (_err) {}
    } }}>
      Concluir (teste)
    </CTAButton>
    <CTAButton variant="ghost" onClick={() => { try { if (window && window.location) window.location.href = "/canceled.html"; } catch (e) {}; onClose(); }}>
      Cancelar
    </CTAButton>
  </div>
  <div className="flex justify-end">
</div>
</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
/* ================== FOOTER & APP ================== */
function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-400 text-sm">© {new Date().getFullYear()} KASH Solutions — {CONFIG.brand.legal}</div>
        <div className="text-slate-400 text-sm">Contato: {CONFIG.contact.email}</div>
      </div>
    </footer>
  );
}
function _localDateFromISO(dateISO){
  let dt = new Date();
  if (dateISO && /^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    const [y,m,d] = dateISO.split("-").map(Number);
    const now = new Date();
    dt = new Date(y, (m||1)-1, d||1, now.getHours(), now.getMinutes(), now.getSeconds());
  } else if (dateISO) {
    const p = new Date(dateISO);
    if (!isNaN(p)) dt = p;
  }
  return dt;
}
/* ===== STRONG DOM SCRAPER (labels, aria, data-*, context text) ===== */
function _scrapeFormDataStrong(){
  const out = { company: {}, members: [] };
  if (typeof document === "undefined") return out;
  // Build label map: id -> label text
  const labelMap = {};
  document.querySelectorAll("label[for]").forEach(l => {
    const id = l.getAttribute("for");
    if (id) labelMap[id] = (l.textContent||"").trim();
  });
  // Helper to get best key for an input
  function bestKey(el){
    const id = el.id || "";
    const name = el.getAttribute("name") || "";
    const aria = el.getAttribute("aria-label") || "";
    const placeholder = el.getAttribute("placeholder") || "";
    const datakey = el.getAttribute("data-key") || el.getAttribute("data-field") || "";
    const lbl = id && labelMap[id] ? labelMap[id] : "";
    // Compose candidates
    const cands = [name, id, datakey, aria, placeholder, lbl]
      .map(s => String(s||"").trim())
      .filter(Boolean);
    // Also try parent text if nothing else
    if (!cands.length){
      const ptxt = (el.closest("div,section,fieldset")?.querySelector("legend,h1,h2,h3,h4,h5,h6,.label,.form-control label")?.textContent||"").trim();
      if (ptxt) cands.push(ptxt);
    }
    // Normalize to lower simple token
    const lower = cands.map(s=>s.toLowerCase());
    // Map to known canonical keys
    function has(strs){ return lower.some(x => strs.some(s=> x.includes(s))); }
    if (has(["email","e-mail"])) return "email";
    if (has(["phone","telefone","celular"])) return "phone";
    if (has(["site","website","url"])) return "website";
    if (has(["ein"])) return "ein";
    if (has(["florida address","endereco florida","endereço florida","address"])) return "floridaAddress";
    if (has(["legal name","company name","empresa","razão social","razao social"])) return "companyName";
    if (has(["dba","alt name","nome fantasia"])) return "companyAltName";
    // Members heuristics
    if (has(["member","sócio","socio","owner","partner","shareholder","director"])) {
      // Try to infer member field type
      if (has(["email"])) return "member_email";
      if (has(["address","endereco","endereço"])) return "member_address";
      if (has(["role","cargo","função","funcao","position","title"])) return "member_role";
      if (has(["document","passport","doc","rg","cpf","id"])) return "member_id";
      return "member_name";
    }
    // fallback
    return (name || id || datakey || aria || placeholder || lbl || "").toLowerCase();
  }
  // Gather inputs/selects/textareas
  const nodes = Array.from(document.querySelectorAll("input, select, textarea"));
  const bag = {};
  nodes.forEach(el => {
    const type = (el.getAttribute("type")||"").toLowerCase();
    if (type==="checkbox" || type==="radio"){
      if (!el.checked) return;
    }
    const val = (el.value!=null ? String(el.value) : "").trim();
    if (!val) return;
    const key = bestKey(el);
    if (!key) return;
    if (!bag[key]) bag[key] = [];
    bag[key].push(val);
  });
  // Company
  function first(keys){ for (const k of keys){ if (bag[k]?.length) return bag[k][0]; } return ""; }
  out.company.companyName = first(["companyName","companyname","empresa","legalname"]) || "";
  out.company.companyAltName = first(["companyAltName","dba","altname"]) || "";
  out.company.email = first(["email","companyemail","e-mail"]) || "";
  out.company.phone = first(["phone","telefone"]) || "";
  out.company.website = first(["website","site","url"]) || "";
  out.company.ein = first(["ein"]) || "";
  out.company.floridaAddress = first(["floridaAddress","address"]) || "";
  // Members: group by index if possible, else sequential
  // We detect sequential groups by DOM order: name -> role -> id -> email -> address
  const seq = [];
  const memberEntries = [];
  nodes.forEach(el => {
    const key = bestKey(el);
    const val = (el.value!=null ? String(el.value) : "").trim();
    if (!val) return;
    if (key.startsWith("member_") || key==="member_name"){
      memberEntries.push({ key, val });
    }
  });
  // Try to reconstruct groups of 5 fields per member
  let curr = { fullName:"", role:"", idOrPassport:"", email:"", address:"" };
  memberEntries.forEach(({key,val}) => {
    if (key==="member_name"){ if (curr.fullName) { seq.push(curr); curr = { fullName:"", role:"", idOrPassport:"", email:"", address:"" }; } curr.fullName = val; }
    else if (key==="member_role"){ curr.role = val; }
    else if (key==="member_id"){ curr.idOrPassport = val; }
    else if (key==="member_email"){ curr.email = val; }
    else if (key==="member_address"){ curr.address = val; }
  });
  if (curr.fullName) seq.push(curr);
  out.members = seq.filter(m => m.fullName);
  return out;
}
;
  const obj = {};
  const setDeep = (path, value) => {
    let cur = obj;
    for (let i=0; i<path.length; i++){
      const k = path[i];
      const isLast = i === path.length - 1;
      const nextK = path[i+1];
      const nextIsIndex = typeof nextK === 'number';
      if (isLast){
        cur[k] = value;
      } else {
        if (typeof k === 'number'){
          if (!Array.isArray(cur)) {
            // convert cur into array context if needed
          }
        }
        if (cur[k] == null){
          cur[k] = (typeof nextK === 'number') ? [] : {};
        }
        cur = cur[k];
      }
    }
  };
  const parseKey = (k) => {
    // Normalize "members[0][fullName]" | "members.0.fullName" | "members[0].fullName"
    const parts = [];
    // Replace bracket notation with dot: a[0][b] -> a.0.b
    let norm = k.replace(/\[(.*?)\]/g, (_, g1) => '.' + g1);
    // Split on dots
    norm.split('.').forEach(seg => {
      if (seg === '') return;
      if (/^\d+$/.test(seg)) parts.push(Number(seg));
      else parts.push(seg);
    });
    return parts;
  };
  Object.keys(flat).forEach(k => {
    const path = parseKey(k);
    setDeep(obj, path, flat[k]);
  });
  return obj;
}
  const company = {};
  const membersMap = new Map(); // index -> obj
  const toIdxObj = (idx) => {
    const i = Number(idx);
    if (!membersMap.has(i)) membersMap.set(i, { fullName:"", role:"", idOrPassport:"", email:"", address:"", phone:"", passport:"", issuer:"", birthdate:"", docExpiry:"", percent:"" });
    return membersMap.get(i);
  };
  const setCompany = (k, v) => { if (v==null) return; const s=String(v); if (!s) return; company[k]=s; };
  const flatEntries = Object.entries(flat);
  for (const [key, val] of flatEntries){
    const v = (val==null) ? "" : String(val);
    if (!v) continue;
    // 1) Direct company.*
    if (/^company(\.|\[)/i.test(key)){
      // company[usAddress][state] or company.usAddress.state
      const norm = key.replace(/\[(.*?)\]/g, '.$1');
      const parts = norm.split('.').filter(Boolean); // ["company","usAddress","state"]
      if (parts.length>=2){
        const field = parts.slice(1).join('.'); // "usAddress.state" or "email"
        if (field==="companyName" || field==="legalName") setCompany("companyName", v);
        else if (field==="companyAltName" || field==="dba") setCompany("companyAltName", v);
        else if (field==="email") setCompany("email", v);
        else if (field==="phone") setCompany("phone", v);
        else if (field==="website") setCompany("website", v);
        else if (field==="ein") setCompany("ein", v);
        else if (field==="hasFloridaAddress") setCompany("hasFloridaAddress", v);
        else if (field.startsWith("usAddress")){
          const sub = field.split('.').slice(1).join('.'); // state, city, line1...
          if (!company.usAddress) company.usAddress = {};
          company.usAddress[sub] = v;
        }
      }
      continue;
    }
    // 2) members[...] or socios[...] or owners[...] etc.
    const arrMatch = key.match(/(members|socios|owners|partners|shareholders|directors)\s*(?:\[|\.)\s*(\d+)\s*(?:\]|\.)\s*(?:\[|\.)?\s*([A-Za-z0-9_]+)\s*\]?/i);
    if (arrMatch){
      const idx = arrMatch[2];
      const field = arrMatch[3].toLowerCase();
      const mm = toIdxObj(idx);
      if (["fullname","name","nome","membername","socio","owner","partner"].includes(field)) mm.fullName = v;
      else if (["role","funcao","position","cargo","title"].includes(field)) mm.role = v;
      else if (["email","mail"].includes(field)) mm.email = v;
      else if (["address","addressline","endereco","endereço"].includes(field)) mm.address = v;
      else if (["passport","document","doc","id","rg","cpf"].includes(field)) { mm.passport = field==="passport" ? v : mm.passport; mm.idOrPassport = v; }
      else if (["issuer","emissor"].includes(field)) mm.issuer = v;
      else if (["birthdate","nascimento","dob"].includes(field)) mm.birthdate = v;
      else if (["docexpiry","expiry","validade"].includes(field)) mm.docExpiry = v;
      else if (["percent","share","quota"].includes(field)) mm.percent = v;
      else if (["phone","telefone","celular"].includes(field)) mm.phone = v;
      continue;
    }
    // 3) booleans disguised as strings for company flags
    if (/limitations|responsibility|agreed/i.test(key)){
      // handled in flags collector elsewhere; ignore here
      continue;
    }
  }
  const members = Array.from(membersMap.keys()).sort((a,b)=>a-b).map(k=>membersMap.get(k)).filter(m=>m.fullName);
  return { company, members };
}
/* ===== FORMDATA SCANNER from <form> elements ===== */
function _scanDocumentForms(){
  const out = {};
  if (typeof document==="undefined" || !document.forms) return out;
  try {
    const forms = Array.from(document.forms);
    forms.forEach(f => {
      const fd = new FormData(f);
      for (const [k, v] of fd.entries()){
        if (!out[k]) out[k] = v;
      }
    });
  } catch(_){}
  return out;
}
export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Hero onStart={() => setOpen(true)} />
      <Services />
      <Pricing onStart={() => setOpen(true)} />
      <HowItWorks />
      <AdminPanel />
      <MyTrackings />
      <TrackingSearch />
      <Footer />
      <FormWizard open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
/* ===== Application Data content (for unified PDF) ===== */
function _applicationDataLines({ company = {}, members = [], tracking, dateISO, flags = {}, source = '', updates = [] }) {
  const safe = v => (v == null ? "" : String(v));
  let dt = new Date();
  if (dateISO && /^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    const [y,m,d] = dateISO.split("-").map(Number);
    const now = new Date();
    dt = new Date(y, (m||1)-1, d||1, now.getHours(), now.getMinutes(), now.getSeconds());
  } else if (dateISO) {
    const p = new Date(dateISO);
    if (!isNaN(p)) dt = p;
  }
  const when = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
  const lines = [];
  lines.push("APPLICATION DATA (KASH Corporate Solutions LLC)");
  lines.push("");
  lines.push(`Tracking: ${tracking || ""}`);
  lines.push(`Date/Time: ${when}`);
  lines.push("");
  lines.push("— Company —");
  lines.push(`Legal Name: ${safe(company.companyName)}`);
  if (company.companyAltName) lines.push(`Alt/DBA: ${safe(company.companyAltName)}`);
  if (company.hasFloridaAddress !== undefined) lines.push(`Has Florida Address: ${company.hasFloridaAddress ? "Yes" : "No"}`);
  if (company.hasFloridaAddress && company.floridaAddress) lines.push(`Florida Address: ${safe(company.floridaAddress)}`);
  if (company.email) lines.push(`Email: ${safe(company.email)}`);
  if (company.phone) lines.push(`Phone: ${safe(company.phone)}`);
  if (company.website) lines.push(`Website: ${safe(company.website)}`);
  if (company.usAddress) {
    const a = company.usAddress;
    const a1 = safe(a.line1), a2 = safe(a.line2), city = safe(a.city), st = safe(a.state), zip = safe(a.zip);
    const addrLine = [a1, a2].filter(Boolean).join(', ');
    if (addrLine) lines.push(`US Address: ${addrLine}`);
    const cityLine = [city, st, zip].filter(Boolean).join(', ');
    if (cityLine) lines.push(`US City/State/ZIP: ${cityLine}`);
  }
  lines.push("");
  lines.push("— Consents / Declarations —");
  if (typeof flags==="object" && flags) {
    if (typeof flags.limitations!=="undefined") lines.push(`Limitations: ${String(flags.limitations)}`);
    if (typeof flags.responsibility!=="undefined") lines.push(`Responsibility: ${String(flags.responsibility)}`);
    if (typeof flags.agreed!=="undefined") lines.push(`Agreed: ${String(flags.agreed)}`);
  }
  lines.push("");
  if (source) { lines.push("— Source —"); lines.push(String(source)); lines.push(""); }
  if (Array.isArray(updates) && updates.length) {
    lines.push("— Updates —");
    updates.forEach((u, idx)=>{
      try {
        const note = (u && (u.note||u.message||u.msg)) ? String(u.note||u.message||u.msg) : "";
        const st = (u && u.status) ? String(u.status) : "";
        const ts = (u && (u.ts||u.date)) ? String(u.ts||u.date) : "";
        const line = [`${idx+1}.`, st, note, ts].filter(Boolean).join(" — ");
        if (line) lines.push(line);
      } catch(_) {}
    });
    lines.push("");
  }
  lines.push("— Members —");
  if (Array.isArray(members) && members.length) {
    members.forEach((m, i) => {
      const full = safe(m.fullName || m.name);
      const role = safe(m.role);
      const idoc = safe(m.idOrPassport || m.document);
      const addr = safe(m.address || m.addressLine);
      const email = safe(m.email);
      lines.push(`${i + 1}. ${full}${role ? " – " + role : ""}${idoc ? " – " + idoc : ""}`);
      if (addr) lines.push(`   Address: ${addr}`);
      if (email) lines.push(`   Email: ${email}`);
    });
  } else {
    lines.push("(none)");
  }
  lines.push("");
  return lines;
}