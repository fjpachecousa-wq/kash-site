// src/App.jsx — KASH Solutions (full page, corrigido)
// Requisitos atendidos:
// - Consentimento obrigatório no modal de revisão (texto em PT), checkbox habilita "Enviar".
// - Envio completo ao Google Apps Script (company + members + accepts) via fetch JSON.
// - Sem contrato ou pagamento nesta etapa (removidos).
// - Correções de sintaxe/JSX; sem caracteres soltos (*/}), sem travessões unicode em templates.
// - Mensagens de erro de rede/CORS claras (tratamento do "Failed to fetch").
// - Layout preservado (ajustes apenas no modal/checkbox).

import React, { useReducer, useState, useEffect } from "react";

/* ================== CONFIG & ENDPOINT ================== */
const CONFIG = {
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: { email: "contato@kashsolutions.us" },
  // URL publicada do Apps Script (Web App implantado como Anyone)
  appsScriptUrl:
    "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec",
};
const PROCESSO_API = CONFIG.appsScriptUrl;

/* ================== HELPERS ================== */
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;
const classNames = (...c) => c.filter(Boolean).join(" ");

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
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
function getOrCreateKashId() {
  try {
    let k = localStorage.getItem("kashId");
    if (!k) {
      k = "KASH-" + Math.random().toString(36).slice(2, 10).toUpperCase();
      localStorage.setItem("kashId", k);
    }
    return k;
  } catch {
    return "KASH-" + Math.random().toString(36).slice(2, 10).toUpperCase();
  }
}
function _readTrackingCode() {
  try {
    return localStorage.getItem("kashId") || "";
  } catch {
    return "";
  }
}

/* ================== API ================== */
async function apiGetProcesso(kashId) {
  const r = await fetch(`${PROCESSO_API}?kashId=${encodeURIComponent(kashId)}`);
  if (!r.ok) throw new Error("not_found");
  return r.json();
}

async function apiUpsertFull({ kashId, company, members, consent }) {
  const url = PROCESSO_API;
  if (!url) throw new Error("Endpoint do Apps Script não configurado.");

  const payload = {
    action: "upsert",
    kashId,
    company,
    members,
    accepts: { consent: !!consent },
    faseAtual: "Recebido",
    subFase: "Dados coletados",
    consentAt: new Date().toISOString(),
    consentTextVersion: "v2025-10-11",
    source: "kashsolutions.us",
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      redirect: "follow",
      credentials: "omit",
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error(
      "Falha ao conectar ao servidor (CORS ou rede). Verifique a publicação do Apps Script."
    );
  }
  clearTimeout(timer);

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Servidor respondeu com erro (${res.status}). ${text || ""}`.trim());
  }
  try {
    const json = JSON.parse(text);
    if (json?.kashId) localStorage.setItem("kashId", json.kashId);
  } catch {
    // resposta não-JSON: ok
  }
  return text;
}

/* ================== UI BASICS ================== */
function KLogo({ size = 40 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-2xl bg-slate-900" />
      <div className="absolute inset-[3px] rounded-xl bg-slate-800 shadow-inner" />
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 64 64" className="absolute">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M14 8h8v48h-8z" fill="url(#g)" />
        <path d="M26 32l22-24h10L42 32l16 24H48L26 32z" fill="url(#g)" />
      </svg>
    </div>
  );
}
function CTAButton({ children, variant = "primary", onClick, type = "button", disabled = false }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-emerald-500/90 hover:bg-emerald-500 text-slate-900 shadow"
      : variant === "ghost"
      ? "bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-800"
      : "bg-slate-700 text-slate-100 hover:bg-slate-600";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classNames(base, styles)}>
      {children}
    </button>
  );
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
  const withheld = yearly * 0.3;
  const saved = Math.max(0, withheld - 1360);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div className="text-slate-300">Estimativa de economia anual</div>
        <span className="text-xs text-emerald-300">Simulador</span>
      </div>
      <div className="mt-4">
        <input
          type="range"
          min={1000}
          max={20000}
          step={100}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-2 text-sm text-slate-400">
          Receita mensal: <span className="text-slate-200">US$ {monthly.toLocaleString()}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">Receita/ano</div>
          <div className="text-lg text-slate-100">US$ {yearly.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">Retencao 30%</div>
          <div className="text-lg text-slate-100">US$ {withheld.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">Economia potencial</div>
          <div className="text-lg text-emerald-400">US$ {saved.toLocaleString()}</div>
        </div>
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
            <p className="text-slate-400 text-sm">
              {CONFIG.brand.legal} · Florida LLC
            </p>
          </div>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-100">
              Abra sua LLC na Flórida e elimine a retenção de 30%.
            </h2>
            <p className="mt-4 text-slate-300">
              Abertura da empresa, EIN, endereço e agente por 12 meses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton onClick={onStart}>Começar agora</CTAButton>
              <a href="#como-funciona" className="inline-flex">
                <CTAButton variant="ghost">Como funciona</CTAButton>
              </a>
            </div>
          </div>
          <DemoCalculator />
        </div>
      </div>
    </section>
  );
}
function Services() {
  const items = [
    { t: "Abertura LLC Partnership", d: "Registro oficial na Flórida (Sunbiz)." },
    { t: "EIN (IRS)", d: "Obtenção do Employer Identification Number." },
    { t: "Operating Agreement", d: "Documento societario digital." },
    { t: "Endereço + Agente (12 meses)", d: "Inclusos no pacote de abertura." },
  ];
  return (
    <section className="py-14 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Serviços incluídos" subtitle="Pacote completo para começar certo." />
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it.t} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-200 font-medium">{it.t}</div>
              <div className="text-slate-400 text-sm mt-1">{it.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Pricing({ onStart }) {
  const plans = [
    {
      name: "Abertura LLC",
      price: CONFIG.prices.llc,
      features: ["Endereço + Agente 12 meses", "EIN", "Operating Agreement"],
      cta: "Contratar",
      disabled: false,
    },
    {
      name: "KASH FLOW 30 (Mensal)",
      price: CONFIG.prices.flow30,
      features: ["Classificação contábil", "Relatórios mensais"],
      cta: "Assinar",
      disabled: true,
    },
    {
      name: "KASH SCALE 5 (Mensal)",
      price: CONFIG.prices.scale5,
      features: ["Até 5 contratos", "Suporte prioritário", "W-8BEN-E (emitido no onboarding)"],
      cta: "Assinar",
      disabled: true,
    },
  ];
  return (
    <section className="py-14 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Planos e preços" subtitle="Transparência desde o início." />
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.name} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-100 font-medium">{p.name}</div>
              <div className="text-2xl text-emerald-400 mt-1">{p.price}</div>
              <ul className="mt-3 text-sm text-slate-400 space-y-1 list-disc list-inside">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col items-center gap-1">
                {!p.disabled && <CTAButton onClick={onStart}>{p.cta}</CTAButton>}
                {p.disabled && <span className="text-xs text-slate-500">Em breve</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function HowItWorks() {
  const steps = [
    { t: "Consulta", d: "Alinhamento de expectativas (opcional)." },
    { t: "Contrato e pagamento", d: "Assinatura eletrônica e checkout." },
    { t: "Formulário de abertura", d: "Dados da empresa, sócios, KYC/AML." },
    { t: "Pagamento", d: "Fee e taxa estadual - checkout online." },
    { t: "Tracking do processo", d: "Número de protocolo e notificações por e-mail." },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="como-funciona">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title="Como funciona"
          subtitle="Fluxo enxuto e auditável, do onboarding ao registro concluído."
        />
        <ol className="mt-10 grid md:grid-cols-5 gap-5">
          {steps.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-emerald-400 font-semibold">{String(i + 1).padStart(2, "0")}</div>
              <h4 className="text-slate-100 mt-2 font-medium">{s.t}</h4>
              <p className="text-slate-400 text-sm mt-1">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================== FORM ================== */
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const initialForm = {
  company: {
    companyName: "",
    email: "",
    phone: "",
    hasFloridaAddress: false,
    usAddress: { line1: "", line2: "", city: "", state: "FL", zip: "" },
  },
  members: [
    { fullName: "", email: "", phone: "", passport: "", issuer: "", docExpiry: "", birthdate: "", percent: "" },
    { fullName: "", email: "", phone: "", passport: "", issuer: "", docExpiry: "", birthdate: "", percent: "" },
  ],
  accept: { responsibility: false, limitations: false },
};

function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_COMPANY":
      return { ...state, company: { ...state.company, [action.field]: action.value } };
    case "UPDATE_US_ADDRESS":
      return { ...state, company: { ...state.company, usAddress: { ...state.company.usAddress, [action.field]: action.value } } };
    case "UPDATE_MEMBER":
      return { ...state, members: state.members.map((m, i) => (i === action.index ? { ...m, [action.field]: action.value } : m)) };
    case "ADD_MEMBER":
      return { ...state, members: [...state.members, { fullName: "", email: "", phone: "", passport: "", issuer: "", docExpiry: "", birthdate: "", percent: "" }] };
    case "REMOVE_MEMBER":
      return { ...state, members: state.members.filter((_, i) => i !== action.index) };
    case "TOGGLE_ACCEPT":
      return { ...state, accept: { ...state.accept, [action.key]: action.value } };
    default:
      return state;
  }
}

function MemberCard({ index, data, onChange, onRemove, canRemove, errors }) {
  return (
    <div className="p-4 border border-slate-700 rounded-xl bg-slate-800 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-slate-300 font-medium">Sócio {index + 1}</div>
        {canRemove && (
          <button className="text-slate-400 hover:text-slate-200 text-xs" onClick={onRemove}>
            Remover
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input
            className={classNames(
              "w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.fullName && "border-red-500"
            )}
            placeholder="Nome completo"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.fullName || ""}</div>
        </div>
        <div>
          <input
            type="email"
            className={classNames(
              "w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.email && "border-red-500"
            )}
            placeholder="E-mail do sócio"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.email || ""}</div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input
            className={classNames(
              "w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.phone && "border-red-500"
            )}
            placeholder="Telefone do sócio"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.phone || ""}</div>
        </div>
        <div>
          <input
            className={classNames(
              "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.passport && "border-red-500"
            )}
            placeholder="Passaporte (ou RG)"
            value={data.passport}
            onChange={(e) => onChange("passport", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.passport || ""}</div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-2">
        <div>
          <input
            className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Órgão emissor"
            value={data.issuer}
            onChange={(e) => onChange("issuer", e.target.value)}
          />
        </div>
        <div>
          <input
            type="date"
            className={classNames(
              "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.docExpiry && "border-red-500"
            )}
            value={data.docExpiry}
            onChange={(e) => onChange("docExpiry", e.target.value)}
          />
          <div className="text-[11px] text-slate-400 mt-1">Validade do documento</div>
          <div className="text-red-400 text-xs">{errors.docExpiry || ""}</div>
        </div>
        <div>
          <input
            type="date"
            className={classNames(
              "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.birthdate && "border-red-500"
            )}
            value={data.birthdate}
            onChange={(e) => onChange("birthdate", e.target.value)}
          />
          <div className="text-[11px] text-slate-400 mt-1">Data de nascimento</div>
          <div className="text-red-400 text-xs">{errors.birthdate || ""}</div>
        </div>
      </div>
      <div>
        <input
          type="number"
          className={classNames(
            "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
            errors.percent && "border-red-500"
          )}
          placeholder="% de participação"
          value={data.percent}
          onChange={(e) => onChange("percent", e.target.value)}
        />
        <div className="text-red-400 text-xs">{errors.percent || ""}</div>
      </div>
    </div>
  );
}

const initialErrors = { company: {}, members: [], accept: {} };

function FormWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tracking, setTracking] = useState("");
  const [consent, setConsent] = useState(false);
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [errors, setErrors] = useState(initialErrors);

  useEffect(() => {
    if (form.company.hasFloridaAddress && form.accept.limitations) {
      dispatch({ type: "TOGGLE_ACCEPT", key: "limitations", value: false });
    }
  }, [form.company.hasFloridaAddress]);

  const updateCompany = (field, value) => dispatch({ type: "UPDATE_COMPANY", field, value });
  const updateUS = (field, value) => dispatch({ type: "UPDATE_US_ADDRESS", field, value });
  const updateMember = (index, field, value) =>
    dispatch({ type: "UPDATE_MEMBER", index, field, value });
  const addMember = () => dispatch({ type: "ADD_MEMBER" });
  const removeMember = (i) => dispatch({ type: "REMOVE_MEMBER", index: i });
  const toggleAccept = (k, v) => dispatch({ type: "TOGGLE_ACCEPT", key: k, value: v });

  function validate() {
    const { company, members, accept } = form;
    const errs = { company: {}, members: members.map(() => ({})), accept: {} };
    if (!company.companyName || company.companyName.length < 3)
      errs.company.companyName = "Informe o nome da LLC.";
    if (!emailRe.test(company.email || "")) errs.company.email = "E-mail inválido.";
    if (!phoneRe.test(company.phone || "")) errs.company.phone = "Telefone inválido.";
    if (company.hasFloridaAddress) {
      if (!company.usAddress.line1) errs.company.line1 = "Address Line 1 obrigatório.";
      if (!company.usAddress.city) errs.company.city = "City obrigatória.";
      if (!company.usAddress.state) errs.company.state = "State obrigatório.";
      if (!company.usAddress.zip) errs.company.zip = "ZIP obrigatório.";
    }
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || m.fullName.length < 5) errs.members[i].fullName = "Nome inválido.";
      if (!emailRe.test(m.email || "")) errs.members[i].email = "E-mail inválido.";
      if (!phoneRe.test(m.phone || "")) errs.members[i].phone = "Telefone inválido.";
      if (!m.passport || m.passport.length < 5) errs.members[i].passport = "Documento obrigatório.";
      if (!m.docExpiry) errs.members[i].docExpiry = "Validade obrigatória.";
      if (!m.birthdate) errs.members[i].birthdate = "Nascimento obrigatório.";
      if (!m.percent || Number(m.percent) <= 0) errs.members[i].percent = "% obrigatório.";
      if (m.birthdate && calcAgeFullDate(m.birthdate) < 18)
        errs.members[i].birthdate = "Precisa ter 18+.";
    }
    setErrors(errs);
    const companyOk = Object.keys(errs.company).length === 0;
    const membersOk = errs.members.every((m) => Object.keys(m).length === 0);
    const acceptOk =
      accept.responsibility && (company.hasFloridaAddress || accept.limitations);
    if (!isPercentTotalValid(members)) {
      alert("A soma dos percentuais deve ser 100%.");
      return false;
    }
    return companyOk && membersOk && acceptOk;
  }

  async function handleSubmit() {
    if (!consent) return;
    setSending(true);
    try {
      const kashId = getOrCreateKashId();
      await apiUpsertFull({
        kashId,
        company: form.company,
        members: form.members,
        consent,
      });
      const tk = _readTrackingCode() || kashId;
      setTracking(tk);
      setSuccess(true);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert(err?.message || "Falha ao enviar.");
    } finally {
      setSending(false);
    }
  }

  const { company, members, accept } = form;

  return (
    <div className={classNames("fixed inset-0 z-50", !open && "hidden")}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-10">
          <div className="rounded-2xl bg-slate-950/90 backdrop-blur border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-slate-300 font-medium">Formulário de Aplicação LLC</div>
              <button className="text-slate-400 hover:text-slate-200" onClick={onClose}>
                Fechar
              </button>
            </div>

            {/* Step 1 - Dados */}
            {step === 1 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">1/2 - Dados iniciais da LLC</h4>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm text-slate-400">Nome da LLC</label>
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Ex.: SUNSHINE MEDIA LLC"
                      value={company.companyName}
                      onChange={(e) => updateCompany("companyName", e.target.value)}
                    />
                    <div className="text-red-400 text-xs">{errors.company.companyName || ""}</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400">E-mail principal</label>
                      <input
                        type="email"
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="email@exemplo.com"
                        value={company.email}
                        onChange={(e) => updateCompany("email", e.target.value)}
                      />
                      <div className="text-red-400 text-xs">{errors.company.email || ""}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400">Telefone principal</label>
                      <input
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="+1 (305) 123-4567"
                        value={company.phone}
                        onChange={(e) => updateCompany("phone", e.target.value)}
                      />
                      <div className="text-red-400 text-xs">{errors.company.phone || ""}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={company.hasFloridaAddress}
                        onChange={(e) => updateCompany("hasFloridaAddress", e.target.checked)}
                      />
                      <span>Possui endereço físico na Flórida?</span>
                    </label>
                  </div>
                  {company.hasFloridaAddress ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-slate-300 font-medium mb-2">Endereço da empresa (USA)</div>
                      <input
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Address Line 1"
                        value={company.usAddress.line1}
                        onChange={(e) => updateUS("line1", e.target.value)}
                      />
                      <div className="grid md:grid-cols-3 gap-2 mt-2">
                        <input
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="City"
                          value={company.usAddress.city}
                          onChange={(e) => updateUS("city", e.target.value)}
                        />
                        <select
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={company.usAddress.state}
                          onChange={(e) => updateUS("state", e.target.value)}
                        >
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <input
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="ZIP Code"
                          value={company.usAddress.zip}
                          onChange={(e) => updateUS("zip", e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                      Não possui endereço na Flórida - usaremos o <b>endereço e agente da KASH por 12 meses</b> incluídos no pacote.
                    </div>
                  )}
                </div>

                <h4 className="mt-6 text-slate-100 font-medium">Sócios (mínimo 2)</h4>
                <div className="mt-2 space-y-4">
                  {members.map((m, i) => (
                    <MemberCard
                      key={i}
                      index={i}
                      data={m}
                      canRemove={members.length > 2}
                      onChange={(field, value) => updateMember(i, field, value)}
                      onRemove={() => removeMember(i)}
                      errors={errors.members[i] || {}}
                    />
                  ))}
                </div>
                <button onClick={addMember} className="mt-4 text-emerald-400 hover:underline">
                  + Adicionar sócio
                </button>

                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={accept.responsibility}
                      onChange={(e) => toggleAccept("responsibility", e.target.checked)}
                    />
                    <span>
                      Declaro que todas as informações prestadas são verdadeiras e completas e assumo
                      total responsabilidade civil e legal por elas.
                    </span>
                  </label>
                  <label
                    className={classNames(
                      "flex items-start gap-2",
                      company.hasFloridaAddress && "opacity-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={accept.limitations}
                      disabled={company.hasFloridaAddress}
                      onChange={(e) => toggleAccept("limitations", e.target.checked)}
                    />
                    <span>Estou ciente de que endereço e agente da KASH são válidos por 12 meses.</span>
                  </label>
                  {company.hasFloridaAddress && (
                    <div className="text-[12px] text-slate-400 -mt-2">
                      * Indisponível porque você informou endereço próprio na Flórida.
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <CTAButton
                    onClick={() => {
                      if (validate()) setStep(2);
                    }}
                  >
                    Continuar
                  </CTAButton>
                </div>
              </div>
            )}

            {/* Step 2 - Revisão + Consentimento */}
            {step === 2 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">2/2 - Revisão</h4>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-slate-300 font-medium">Empresa</div>
                  <div className="mt-2 text-sm text-slate-400">
                    <div>
                      <span className="text-slate-500">Nome: </span>
                      {company.companyName || "-"}
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-6">
                      <div>
                        <span className="text-slate-500">E-mail: </span>
                        {company.email || "-"}
                      </div>
                      <div>
                        <span className="text-slate-500">Telefone: </span>
                        {company.phone || "-"}
                      </div>
                    </div>
                    {company.hasFloridaAddress ? (
                      <div className="mt-1">
                        <div className="text-slate-400">Endereço informado:</div>
                        <div>{company.usAddress.line1}</div>
                        <div>
                          {company.usAddress.city}, {company.usAddress.state} {company.usAddress.zip}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1">
                        Será utilizado o endereço e agente da KASH por 12 meses.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 mt-4">
                  <div className="text-slate-300 font-medium">Sócios</div>
                  <div className="mt-2 space-y-3 text-sm text-slate-400">
                    {members.map((m, i) => (
                      <div key={i}>
                        <div className="font-medium text-slate-300">
                          Sócio {i + 1}: {m.fullName || "-"}
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                          <div>
                            <span className="text-slate-500">E-mail: </span>
                            {m.email || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">Telefone: </span>
                            {m.phone || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">Documento: </span>
                            {m.passport || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">Órgão emissor: </span>
                            {m.issuer || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">Validade doc.: </span>
                            {m.docExpiry || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">Nascimento: </span>
                            {m.birthdate || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">Participação: </span>
                            {m.percent || "-"}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consentimento obrigatório - imediatamente acima dos botões */}
                <label className="mt-4 flex items-start gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    Autorizo a KASH Corporate Solutions a conferir e validar as informações fornecidas
                    para fins de abertura e registro da empresa.
                  </span>
                </label>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <CTAButton variant="ghost" onClick={() => setStep(1)}>
                    Voltar
                  </CTAButton>
                  <CTAButton onClick={handleSubmit} disabled={!consent || sending}>
                    {sending ? "Enviando..." : "Enviar"}
                  </CTAButton>
                </div>
              </div>
            )}

            {/* Step 3 - Sucesso (apenas mensagem e tracking) */}
            {step === 3 && success && (
              <div className="p-6">
                <div className="text-center">
                  <h4 className="text-slate-100 font-medium">Aplicação recebida</h4>
                  <p className="text-slate-400 mt-2">Seu código de acompanhamento (tracking):</p>
                  <div className="mt-2 text-emerald-400 text-xl font-bold">{tracking}</div>
                  <p className="text-slate-300 mt-4">
                    Sua aplicação foi recebida. A equipe KASH analisará as informações e enviará o
                    link de pagamento e contrato por e-mail em até 48 horas.
                  </p>
                  <div className="mt-6">
                    <CTAButton onClick={onClose}>Fechar</CTAButton>
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

/* ================== TRACKING & ADMIN (locais) ================== */
function TrackingSearch() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async () => {
    setNotFound(false);
    setResult(null);
    try {
      const obj = await apiGetProcesso(code.trim());
      setResult({
        tracking: obj.kashId,
        dateISO: obj.atualizadoEm,
        company: { companyName: obj.companyName || "-" },
        updates: obj.updates || [],
      });
    } catch {
      setNotFound(true);
    }
  };

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <SectionTitle
          title="Consultar processo por Tracking"
          subtitle="Insira seu código (ex.: KASH-XXXXXX) para verificar o status."
        />
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="KASH-ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <CTAButton onClick={handleLookup}>Consultar</CTAButton>
        </div>
        {notFound && <div className="text-sm text-red-400 mt-2">Tracking não encontrado.</div>}
        {result && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-slate-300 font-medium">Status</div>
            <div className="text-slate-400 text-sm mt-1">
              Recebido em {result.dateISO}. Empresa: {result.company?.companyName || "-"}
            </div>
            <div className="mt-3">
              <div className="text-slate-400 text-sm mb-1">Linha do tempo:</div>
              <div className="space-y-2">
                {(result.updates || []).map((u, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1" />
                    <div className="text-sm text-slate-300">
                      <div className="font-medium">{u.status}</div>
                      <div className="text-xs text-slate-400">
                        {u.ts}
                        {u.note ? ` - ${u.note}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
                {(!result.updates || result.updates.length === 0) && (
                  <div className="text-xs text-slate-500">Sem atualizações adicionais.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-400 text-sm">
          © {new Date().getFullYear()} KASH Solutions - {CONFIG.brand.legal}
        </div>
        <div className="text-slate-400 text-sm">Contato: {CONFIG.contact.email}</div>
      </div>
    </footer>
  );
}

/* ================== APP ================== */
export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Hero onStart={() => setOpen(true)} />
      <Services />
      <Pricing onStart={() => setOpen(true)} />
      <HowItWorks />
      <TrackingSearch />
      <Footer />
      <FormWizard open={open} onClose={() => setOpen(false)} />
    </div>
  );
}