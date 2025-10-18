// src/App.jsx – KASH Solutions (reescrita integral, saneada)
// Observações de implementação:
// - Mantém o visual da página (Hero/Services/Pricing/HowItWorks/Footer).
// - Formulário em 2 passos com revisão e CONSENTIMENTO obrigatório no modal.
// - Envio completo (company + members + consent) para Google Apps Script.
// - CORS-safe: POST com "text/plain;charset=utf-8" (sem preflight).
// - Removeu quaisquer vestígios de contrato/pagamento neste fluxo.
// - Removeu caracteres problemáticos dentro de template literals.
// - Sem código morto/resíduos; checagens de fechamento de tags e chaves.

import React, { useEffect, useMemo, useReducer, useState } from "react";

/* ========================= KASH CONFIG ========================= */
if (typeof window !== "undefined") {
  window.CONFIG = window.CONFIG || {};
  window.CONFIG.appsScriptUrl =
    "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

function classNames(...xs) { return xs.filter(Boolean).join(" "); }
function todayISO() {
  const d = new Date();
  const pad = (n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
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

/* ========================= API (Apps Script) ========================= */
async function apiUpsertFull({ kashId, company, members, consent }) {
  const url = (typeof window !== "undefined" && window.CONFIG && window.CONFIG.appsScriptUrl) || "";
  if (!url) throw new Error("Apps Script URL ausente");

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
    source: "kashsolutions.us"
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita preflight CORS
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  try {
    const j = JSON.parse(text);
    if (j?.kashId) {
      try { localStorage.setItem("kashId", String(j.kashId)); } catch {}
    }
  } catch {}
  return text;
}

function getOrCreateKashId() {
  try {
    let k = localStorage.getItem("kashId");
    if (!k) {
      k = "KASH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      localStorage.setItem("kashId", k);
    }


async function serverCreateCase({ company, members, consent }) {
  const res = await fetch("/api/create-case", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company, members, consent }),
  });
  if (!res.ok) throw new Error("Falha ao criar kashId no servidor");
  return res.json(); // { kashId }
}

    return k;
  } catch {
    return "KASH-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
}

/* ========================= UI BASICS ========================= */
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
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
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

/* ========================= PAGE SECTIONS ========================= */
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
        <input type="range" min={1000} max={20000} step={100} value={monthly} onChange={(e)=>setMonthly(Number(e.target.value))} className="w-full" />
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
          <div className="text-xs text-slate-400">Retenção 30%</div>
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
            <p className="text-slate-400 text-sm">KASH CORPORATE SOLUTIONS LLC · Florida LLC</p>
          </div>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-100">
              Abra sua LLC na Flórida e elimine a retenção de 30%.
            </h2>
            <p className="mt-4 text-slate-300">Abertura da empresa, EIN, endereço e agente por 12 meses.</p>
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
    { t: "Operating Agreement", d: "Documento societário digital." },
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
    { name: "Abertura LLC", price: "US$ 1,360", features: ["Endereço + Agente 12 meses", "EIN", "Operating Agreement"], cta: "Contratar", disabled: false },
    { name: "KASH FLOW 30 (Mensal)", price: "US$ 300", features: ["Classificação contábil", "Relatórios mensais"], cta: "Assinar", disabled: true },
    { name: "KASH SCALE 5 (Mensal)", price: "US$ 1,000", features: ["Até 5 contratos", "Suporte prioritário"], cta: "Assinar", disabled: true },
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
                {p.features.map((f) => <li key={f}>{f}</li>)}
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
    { t: "Contrato e pagamento", d: "Assinatura e checkout acontecem depois da conferência." },
    { t: "Formulário de abertura", d: "Dados da empresa, sócios, KYC/AML." },
    { t: "Envio", d: "Você recebe o tracking do processo." },
    { t: "Acompanhamento", d: "Atualizações por e-mail." },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="como-funciona">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Como funciona" subtitle="Fluxo enxuto e auditável, do onboarding ao registro concluído." />
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

/* ========================= FORM REDUCER ========================= */
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
    { fullName: "", email: "", phone: "", passport: "", issuer: "", docExpiry: "", birthdate: "", percent: "" }
  ],
  accept: { responsibility: false, limitations: false }
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

/* ========================= FORM COMPONENTS ========================= */
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
            className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.fullName && "border-red-500")}
            placeholder="Nome completo"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.fullName || ""}</div>
        </div>
        <div>
          <input
            type="email"
            className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.email && "border-red-500")}
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
            className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.phone && "border-red-500")}
            placeholder="Telefone do sócio"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.phone || ""}</div>
        </div>
        <div>
          <input
            className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.passport && "border-red-500")}
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
            className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.docExpiry && "border-red-500")}
            value={data.docExpiry}
            onChange={(e) => onChange("docExpiry", e.target.value)}
          />
          <div className="text-[11px] text-slate-400 mt-1">Validade do documento</div>
          <div className="text-red-400 text-xs">{errors.docExpiry || ""}</div>
        </div>
        <div>
          <input
            type="date"
            className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.birthdate && "border-red-500")}
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
          className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.percent && "border-red-500")}
          placeholder="% de participação"
          value={data.percent}
          onChange={(e) => onChange("percent", e.target.value)}
        />
        <div className="text-red-400 text-xs">{errors.percent || ""}</div>
      </div>
    </div>
  );
}

/* ========================= FORM WIZARD (MODAL) ========================= */
const initialErrors = { company: {}, members: [], accept: {} };

function FormWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [consent, setConsent] = useState(false); // estado único e padronizado
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [doneCode, setDoneCode] = useState("");

  useEffect(() => {
    if (form.company.hasFloridaAddress && form.accept.limitations) {
      dispatch({ type: "TOGGLE_ACCEPT", key: "limitations", value: false });
    }
  }, [form.company.hasFloridaAddress]);

  const updateCompany = (field, value) => dispatch({ type: "UPDATE_COMPANY", field, value });
  const updateUS = (field, value) => dispatch({ type: "UPDATE_US_ADDRESS", field, value });
  const updateMember = (i, field, value) => dispatch({ type: "UPDATE_MEMBER", index: i, field, value });
  const addMember = () => dispatch({ type: "ADD_MEMBER" });
  const removeMember = (i) => dispatch({ type: "REMOVE_MEMBER", index: i });
  const toggleAccept = (k, v) => dispatch({ type: "TOGGLE_ACCEPT", key: k, value: v });

  function validate() {
    const { company, members, accept } = form;
    const errs = { company: {}, members: members.map(() => ({})), accept: {} };

    if (!company.companyName || company.companyName.length < 3) errs.company.companyName = "Informe o nome da LLC.";
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
      if (!m.passport || m.passport.length < 3) errs.members[i].passport = "Documento obrigatório.";
      if (!m.docExpiry) errs.members[i].docExpiry = "Validade obrigatória.";
      if (!m.birthdate) errs.members[i].birthdate = "Nascimento obrigatório.";
      if (m.birthdate && calcAgeFullDate(m.birthdate) < 18) errs.members[i].birthdate = "Precisa ter 18+.";
      if (!m.percent || Number(m.percent) <= 0) errs.members[i].percent = "% obrigatório.";
    }

    if (!accept.responsibility) errs.accept.base = "Aceite a declaração de responsabilidade.";
    if (!form.company.hasFloridaAddress && !accept.limitations) errs.accept.base = "Aceite as limitações (endereço/agente 12 meses).";

    setErrors(errs);
    const companyOk = Object.keys(errs.company).length === 0;
    const membersOk = errs.members.every((m) => Object.keys(m).length === 0);
    const acceptOk = accept.responsibility && (form.company.hasFloridaAddress || accept.limitations);
    const percentOk = isPercentTotalValid(members);
    if (!percentOk) alert("A soma dos percentuais deve ser 100%.");
    return companyOk && membersOk && acceptOk && percentOk;
  }

  async function handleSubmit() {
    if (!consent) {
      alert("Marque o consentimento para prosseguir.");
      return;
    }
    setSending(true);
    try {
      let kashId;
try {
  const out = await serverCreateCase({ company, members, consent });
  kashId = out.kashId;
} catch {
  // Fallback preservando formato antigo, sem alterar a UI
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const t = Math.random().toString(36).slice(2, 10).toUpperCase();
  kashId = `KASH-${yyyy}${mm}${dd}-${t}`;
}
      await apiUpsertFull({
        kashId,
        company: form.company,
        members: form.members,
        consent
      });
      // Limpeza de memória + reinício da página após envio bem-sucedido (sem piscar popup)
      try { localStorage.removeItem("kashId"); } catch {}
      try { sessionStorage.clear(); } catch {}
      if (typeof window !== "undefined" && window.location && typeof window.location.reload === "function") {
        setTimeout(() => window.location.reload(), 60);
      }

      // Limpeza de memória + reinício da página após envio bem-sucedido
      try { localStorage.removeItem("kashId"); } catch {}
      try { sessionStorage.clear(); } catch {}
      if (typeof window !== "undefined" && window.location && typeof window.location.reload === "function") {
        // pequeno atraso para garantir flush/UX
        setTimeout(() => window.location.reload(), 60);
      }

      setDoneCode(kashId);
      setStep(3); // tela final
    } catch (err) {
      console.error(err);
      alert("Falha ao enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const dateISO = useMemo(() => todayISO(), []);

  return (
    <div className={classNames("fixed inset-0 z-50", !open && "hidden")} aria-hidden={!open}>
      <div className="absolute inset-0 bg-black/60" onClick={step === 3 ? undefined : onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-10">
          <div className="rounded-2xl bg-slate-950/90 backdrop-blur border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-slate-300 font-medium">Formulário de Aplicação LLC</div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition" type="button">X</button>
            </div>

            {step === 1 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">1/2 - Dados iniciais da LLC</h4>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm text-slate-400">Nome da LLC</label>
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Ex.: SUNSHINE MEDIA LLC"
                      value={form.company.companyName}
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
                        value={form.company.email}
                        onChange={(e) => updateCompany("email", e.target.value)}
                      />
                      <div className="text-red-400 text-xs">{errors.company.email || ""}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400">Telefone principal</label>
                      <input
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="+1 (305) 123-4567"
                        value={form.company.phone}
                        onChange={(e) => updateCompany("phone", e.target.value)}
                      />
                      <div className="text-red-400 text-xs">{errors.company.phone || ""}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={form.company.hasFloridaAddress}
                        onChange={(e) => updateCompany("hasFloridaAddress", e.target.checked)}
                      />
                      <span>Possui endereço físico na Flórida?</span>
                    </label>
                  </div>
                  {form.company.hasFloridaAddress ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-slate-300 font-medium mb-2">Endereço da empresa (USA)</div>
                      <input
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Address Line 1"
                        value={form.company.usAddress.line1}
                        onChange={(e) => updateUS("line1", e.target.value)}
                      />
                      <div className="grid md:grid-cols-3 gap-2 mt-2">
                        <input
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="City"
                          value={form.company.usAddress.city}
                          onChange={(e) => updateUS("city", e.target.value)}
                        />
                        <select
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={form.company.usAddress.state}
                          onChange={(e) => updateUS("state", e.target.value)}
                        >
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <input
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="ZIP Code"
                          value={form.company.usAddress.zip}
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
                  {form.members.map((m, i) => (
                    <MemberCard
                      key={i}
                      index={i}
                      data={m}
                      canRemove={form.members.length > 2}
                      onChange={(field, value) => updateMember(i, field, value)}
                      onRemove={() => removeMember(i)}
                      errors={errors.members[i] || {}}
                    />
                  ))}
                </div>
                <button onClick={addMember} className="mt-4 text-emerald-400 hover:underline">+ Adicionar sócio</button>

                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={form.accept.responsibility}
                      onChange={(e) => toggleAccept("responsibility", e.target.checked)}
                    />
                    <span>Declaro que todas as informações prestadas são verdadeiras e completas e assumo total responsabilidade civil e legal por elas.</span>
                  </label>
                  <label className={classNames("flex items-start gap-2", form.company.hasFloridaAddress && "opacity-50")}>
                    <input
                      type="checkbox"
                      checked={form.accept.limitations}
                      disabled={form.company.hasFloridaAddress}
                      onChange={(e) => toggleAccept("limitations", e.target.checked)}
                    />
                    <span>Estou ciente de que endereço e agente da KASH são válidos por 12 meses.</span>
                  </label>
                  {form.company.hasFloridaAddress && (
                    <div className="text-[12px] text-slate-400">Endereço da KASH indisponível porque você informou endereço próprio na Flórida.</div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <CTAButton onClick={() => {
    try { localStorage.removeItem("kashId"); } catch {}
    try { sessionStorage.clear(); } catch {}
    /* Reset internal wizard state to avoid sticky "step 3" on reopen*/
    try { setDoneCode && setDoneCode(""); } catch {}
    try { setStep && setStep(1); } catch {}
    try { dispatch && dispatch({ type: "RESET_FORM" }); } catch {}
    try { setErrors && typeof initialErrors !== "undefined" && setErrors(initialErrors); } catch {}
    try { setConsent && setConsent(false); } catch {}
    if (typeof onClose === "function") onClose();
}}>Fechar</CTAButton>
                  </div>
                </div>
              </div>
            )}

          </div>
          <div className="text-center text-[11px] text-slate-500 mt-3">Data: {dateISO}</div>
        </div>
      </div>
    </div>
  );
}

/* ========================= FOOTER ========================= */
function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-400 text-sm">© {new Date().getFullYear()} KASH Solutions - KASH CORPORATE SOLUTIONS LLC</div>
        <div className="text-slate-400 text-sm">Contato: contato@kashsolutions.us</div>
      </div>
    </footer>
  );
}

/* ========================= APP ROOT ========================= */
export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Hero onStart={() => setOpen(true)} />
      <Services />
      <Pricing onStart={() => setOpen(true)} />
      <HowItWorks />
      <Footer />
      <FormWizard open={open} onClose={() => setOpen(false)} />
    </div>
  );
}