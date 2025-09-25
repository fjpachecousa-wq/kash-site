import { jsPDF } from "jspdf";


/* KASH: light guard — evita página ficar totalmente preta */
(function(){
  try {
    const s = document.createElement('style');
    s.innerHTML = `html,body,#root{min-height:100vh;background:#0b1220}`; /* mantém seu gradiente escuro padrão */
    document.head.appendChild(s);
  } catch {}
})();



// === KASH: Helpers Google Sheets (inserido automaticamente) ===
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

function KASH_getTracking() {
  try {
    const t = (localStorage.getItem("last_tracking") || localStorage.getItem("kash_last_tracking") || "").toUpperCase();
    return t && /^KASH-[A-Z0-9]{4,}$/.test(t) ? t : "";
  } catch { return ""; }
}

function KASH_getCompanyName() {
  try {
    const byName = document.querySelector('input[name="companyName"]');
    if (byName?.value) return byName.value.trim();
    const dataAttr = document.querySelector('[data-company-name]');
    if (dataAttr?.value || dataAttr?.textContent) return (dataAttr.value || dataAttr.textContent).trim();
    return "";
  } catch { return ""; }
}

async function KASH_sendToSheets(extra={}) {
  const payload = {
    action: "upsert",
    kashId: (extra.kashId || KASH_getTracking() || "").toUpperCase(),
    companyName: extra.companyName || KASH_getCompanyName() || "",
    faseAtual: typeof extra.faseAtual === "number" ? extra.faseAtual : 1,
    subFase: typeof extra.subFase === "number" ? extra.subFase : null,
    atualizadoEm: extra.atualizadoEm || new Date().toISOString(),
  };
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch(_) {}
  return true;
}
// === Fim dos helpers ===


// ===== KASH: Helpers Google Sheets (unificados) =====
function getTracking() {
  try {
    const ls = (typeof localStorage !== "undefined") ? (localStorage.getItem("last_tracking") || "") : "";
    if (ls && ls.trim()) return ls.trim().toUpperCase();
  } catch {}
  if (typeof document !== "undefined") {
    const fromInput = (document.querySelector('input[name="tracking"], input[name="kashId"]')?.value || "").trim();
    if (fromInput) return fromInput.toUpperCase();
  }
  return "";
}

function getCompanyName() {
  if (typeof document === "undefined") return "";
  const byName = document.querySelector('input[name="companyName"]')?.value?.trim();
  if (byName) return byName;
  const byData = document.querySelector("[data-company-name]")?.value?.trim();
  if (byData) return byData;
  return "";
}

function buildPayload(extra = {}) {
  const kashId = (extra.kashId || getTracking() || "").toUpperCase();
  const companyName = extra.companyName || getCompanyName() || "";
  const base = {
    action: "upsert",
    kashId,
    companyName,
    faseAtual: (typeof extra.faseAtual === "number") ? extra.faseAtual : 1,
    subFase: (typeof extra.subFase === "number") ? extra.subFase : null,
    atualizadoEm: extra.atualizadoEm || new Date().toISOString(),
  };
  return { ...base, ...extra };
}

async function sendToSheets(extra = {}) {
  if (!SCRIPT_URL) {
    console.error("SCRIPT_URL/PROCESSO_API_URL ausente.");
    return { ok: false, error: "no_script_url" };
  }
  try {
    const r = await await sendToSheets({});
    return { ok: true };
  } catch (e) {
    console.error("Erro ao enviar para Sheets:", e);
    return { ok: false, error: String(e) };
  }
}
// ===== Fim helpers Google Sheets =====

import React, { useReducer, useState, useEffect } from "react";
// SCRIPT_URL declarado nos helpers acima
/* ================== CONFIG ================== */
const CONFIG = {
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: { whatsapp: "", email: "contato@kashsolutions.us", calendly: "" }, // WhatsApp oculto por ora
  checkout: { stripeUrl: "https://buy.stripe.com/5kQdR95j9eJL9E06WVebu00" }, // futuro
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
  formspree_removedEndpoint: "https://formspree_removed.io/f/xblawgpk",
};
// === KASH Process API (Google Apps Script) ===
const PROCESSO_API = "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

async function apiGetProcesso(kashId){
  const r = await fetch(`${PROCESSO_API}?kashId=${encodeURIComponent(kashId)}`);
  if(!r.ok) throw new Error("not_found");
  return r.json();
}
async function apiUpsert({kashId, companyName, atualizadoEm}){
  const r = await await sendToSheets({});
  if(!r.ok) throw new Error("upsert_failed");
  return r.json();
}
async function apiUpdate({kashId, faseAtual, subFase, status, note}){
  const r = await await sendToSheets({});
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
  return <button type={type} onClick={onClick} disabled={disabled} className={classNames(base, styles)}>{children}</button>;
}
function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-2xl text-slate-100 font-semibold">{title}</h3>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

/* ================== HERO/SERVICES/PRICING ================== */
function DemoCalculator() {
  const [monthly, setMonthly] = useState(4000);
  const yearly = monthly * 12;
  const withheld = yearly * 0.30;
  const saved = Math.max(0, withheld - 1360);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between"><div className="text-slate-300">Estimativa de economia anual</div><span className="text-xs text-emerald-300">Simulador</span></div>
      <div className="mt-4">
        <input type="range" min={1000} max={20000} step={100} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full" />
        <div className="mt-2 text-sm text-slate-400">Receita mensal: <span className="text-slate-200">US$ {monthly.toLocaleString()}</span></div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Receita/ano</div><div className="text-lg text-slate-100">US$ {yearly.toLocaleString()}</div></div>
        <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Retenção 30%</div><div className="text-lg text-slate-100">US$ {withheld.toLocaleString()}</div></div>
        <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Economia potencial</div><div className="text-lg text-emerald-400">US$ {saved.toLocaleString()}</div></div>
      </div>
    </div>
  );
}
function Hero({ onStart }) {
  return (
    <section className="pt-16 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <KLogo size={42} />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-100">KASH Solutions</h1>
            <p className="text-slate-400 text-sm">KASH CORPORATE SOLUTIONS LLC · Florida LLC</p>
          </div>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-100">Abra sua LLC na Flórida e elimine a retenção de 30%.</h2>
            <p className="mt-4 text-slate-300">Abertura da empresa, EIN, endereço e agente por 12 meses.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton onClick={async () => { const kashId=(localStorage.getItem("last_tracking")||"").toUpperCase(); const companyName=document.querySelector('input[name="companyName"]')?.value||""; try { await KASH_sendToSheets({ action:"upsert", kashId, companyName, faseAtual:1, subFase:null }); } catch(_) {} try { window.location.href="/success.html"; } catch(_) {} }}}>
      Concluir (teste)
    </CTAButton>

    <CTAButton variant="ghost" onClick={() =>   { try { if (window && window.location) window.location.href = "/canceled.html"; } catch (e) {}; onClose(); }}>
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


/* ===== formspree_removed INFLATOR: expand flat keys to nested/arrays ===== */
function _inflateformspree_removed(flat){
  if (!flat || typeof flat !== "object") return {};
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
    setDeep(path, flat[k]);
  });
  return obj;
}


/* ===== ULTRA FLAT HARVESTER (formspree_removed & generic) ===== */
function _harvestFromFlat(flat){
  if (!flat || typeof flat!=='object') return { company:{}, members:[] };
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
  
// Força tema claro no documento para evitar tela escura por CSS global
React.useEffect(() => {
  try {
    const html = document.documentElement;
    html.classList.remove('dark');
    const root = document.getElementById('root');
    [html, document.body, root].forEach((el) => {
      if (!el) return;
      el.style.background = '#ffffff';
      el.style.color = '#111111';
    });
    // injeta CSS de reforço
    const style = document.createElement('style');
    style.setAttribute('data-kash-light-force', 'true');
    style.innerHTML = `
      html, body, #root { background: #ffffff !important; color: #111111 !important; min-height: 100vh; }
      .bg-slate-950, .bg-slate-900, .bg-black, .dark\:bg-slate-950 { background: #ffffff !important; }
      .text-slate-100, .text-white { color: #111111 !important; }
      .border-slate-800, .border-slate-700 { border-color: #e5e7eb !important; }
    `;
    document.head.appendChild(style);
    return () => {
      try {
        const s = document.querySelector('style[data-kash-light-force="true"]');
        if (s) s.remove();
      } catch {}
    };
  } catch {}
}, []);
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

/* Guard runtime — neutraliza chamadas Formspree sem remover blocos existentes */
(function(){
  try{
    const _fetch = window.fetch;
    window.fetch = function(input, init){
      const url = (typeof input==="string") ? input : (input && input.url) || "";
      if(/formspree/i.test(url)){ try{ return Promise.resolve(new Response(null,{status:204})); }catch(_){ return Promise.resolve(); } }
      return _fetch.apply(this, arguments);
    };
  }catch(_){}
})();

