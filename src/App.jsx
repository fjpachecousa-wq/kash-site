import React, { useReducer, useState, useEffect } from "react";

/* ================== CONFIG ================== */
const CONFIG = {
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: { whatsapp: "+1 (305) 000-0000", email: "contato@kashsolutions.us", calendly: "" },
  checkout: { stripeUrl: "" }, // futuro
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
  formspreeEndpoint: "https://formspree.io/f/xblawgpk",
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;
function classNames(...cls) { return cls.filter(Boolean).join(" "); }

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
function todayISO() {
  const d = new Date();
  const pad = (n)=> String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

/* ================== UI BÁSICOS ================== */
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
function Pill({ children }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">{children}</span>;
}
function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-2xl text-slate-100 font-semibold">{title}</h3>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
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

/* ================== SIMULADOR ================== */
function DemoCalculator() {
  const [monthly, setMonthly] = useState(4000);
  const yearly = monthly * 12;
  const withheld = yearly * 0.30;
  const saved = Math.max(0, withheld - 1360);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between"><div className="text-slate-300">Estimativa de economia anual</div><Pill>Simulador</Pill></div>
      <div className="mt-4">
        <input type="range" min={1000} max={20000} step={100} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full" />
        <div className="mt-2 text-sm text-slate-400">Receita mensal: <span className="text-slate-200">US$ {monthly.toLocaleString()}</span></div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Receita/ano</div><div className="text-lg text-slate-100">US$ {yearly.toLocaleString()}</div></div>
        <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Retenção 30%</div><div className="text-lg text-slate-100">US$ {withheld.toLocaleString()}</div></div>
        <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-emerald-300">Economia potencial</div><div className="text-lg text-emerald-400">US$ {saved.toLocaleString()}</div></div>
      </div>
    </div>
  );
}

/* ================== HERO ================== */
function Hero({ onStart }) {
  return (
    <section className="pt-16 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KLogo size={42} />
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-100">KASH Solutions</h1>
              <p className="text-slate-400 text-sm">KASH CORPORATE SOLUTIONS LLC · Florida LLC</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-100">Abra sua LLC na Flórida e elimine a retenção de 30%.</h2>
            <p className="mt-4 text-slate-300">Solução completa para criadores brasileiros que monetizam nos EUA: abertura da empresa, EIN, W‑8BEN‑E, endereço e agente por 12 meses.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton onClick={onStart}>Começar agora</CTAButton>
              <a href="#como-funciona" className="inline-flex"><CTAButton variant="ghost">Como funciona</CTAButton></a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />Endereço e agente por 12 meses</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />Contrato digital bilíngue</div>
            </div>
          </div>
          <DemoCalculator />
        </div>
      </div>
    </section>
  );
}

/* ================== SERVIÇOS ================== */
function Services() {
  const items = [
    { t: "Abertura LLC Partnership", d: "Registro oficial na Flórida (Sunbiz)." },
    { t: "EIN (IRS)", d: "Obtenção do Employer Identification Number." },
    { t: "Operating Agreement", d: "Documento societário digital." },
    { t: "W‑8BEN‑E", d: "Para evitar retenção de 30% em plataformas." },
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

/* ================== PREÇOS ================== */
function Pricing({ onStart }) {
  const plans = [
    { name: "Abertura LLC", price: CONFIG.prices.llc, features: ["Endereço + Agente 12 meses", "EIN", "Operating Agreement", "W‑8BEN‑E"], cta: "Contratar", disabled: false },
    { name: "KASH FLOW 30 (Mensal)", price: CONFIG.prices.flow30, features: ["Classificação contábil", "Relatórios mensais"], cta: "Assinar", disabled: true },
    { name: "KASH SCALE 5 (Mensal)", price: CONFIG.prices.scale5, features: ["Até 5 contratos", "Suporte prioritário"], cta: "Assinar", disabled: true },
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
                <CTAButton onClick={onStart} disabled={p.disabled}>{p.cta}</CTAButton>
                {p.disabled && <span className="text-xs text-slate-500">Em breve</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================== COMO FUNCIONA ================== */
function HowItWorks() {
  const steps = [
    { t: "Consulta", d: "Alinhamento de expectativas (opcional)." },
    { t: "Contrato e pagamento", d: "Assinatura eletrônica e checkout." },
    { t: "Formulário de abertura", d: "Dados da empresa, sócios, KYC/AML." },
    { t: "Pagamento", d: "Fee e taxa estadual — checkout online." },
    { t: "Tracking do processo", d: "Número de protocolo e notificações por e-mail." },
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

function FieldError({ msg }) { return msg ? <div className="text-red-400 text-xs mt-1">{msg}</div> : null; }

/* ================== CONTRATO (texto padrão) ================== */
function buildContractPT(companyName, tracking, dateISO) {
  return [
    "CONTRATO DE PRESTAÇÃO DE SERVIÇOS — KASH Solutions",
    "",
    "1. OBJETO – Formação de LLC na Flórida, obtenção do EIN junto ao IRS e emissão do W‑8BEN‑E, após aprovação do registro.",
    "2. ENDEREÇO E AGENTE – Inclusos por 12 (doze) meses a partir da contratação; renováveis mediante cobrança adicional.",
    "3. RESPONSABILIDADE – Todas as informações submetidas pelo CLIENTE são de sua exclusiva responsabilidade.",
    "4. VIGÊNCIA – Este contrato entra em vigor após o pagamento integral das taxas e serviços.",
    "5. JURISDIÇÃO – Rio de Janeiro/RJ, Brasil, podendo ser aplicado o foro da Flórida (Orange County, EUA).",
    "6. PREÇO – US$ 1.360, salvo promoções publicadas.",
    "7. DISPOSIÇÕES FINAIS – O registro da LLC não implica contratação automática de contabilidade mensal.",
    "",
    `Tracking: ${tracking}`,
    `Data: ${dateISO}`
  ].join("\n");
}
function buildContractEN(companyName, tracking, dateISO) {
  return [
    "SERVICE AGREEMENT — KASH Solutions",
    "",
    "1. PURPOSE – Formation of a Florida LLC, obtaining the EIN with the IRS, and issuing Form W‑8BEN‑E upon approval.",
    "2. REGISTERED AGENT & ADDRESS – Provided for 12 (twelve) months from the contracting date; renewable with additional fees.",
    "3. INFORMATION RESPONSIBILITY – All information submitted by the CLIENT is the CLIENT’s sole responsibility.",
    "4. EFFECTIVENESS – This Agreement becomes valid after full payment of services and fees.",
    "5. JURISDICTION – Rio de Janeiro/RJ, Brazil, with Florida (Orange County, USA) as an alternative venue.",
    "6. PRICE – US$ 1,360 unless otherwise promoted.",
    "7. FINAL PROVISIONS – LLC registration does not imply automatic hiring of monthly bookkeeping.",
    "",
    `Tracking: ${tracking}`,
    `Date: ${dateISO}`
  ].join("\n");
}
function ContractText({ companyName, tracking, dateISO }) {
  return (
    <div className="space-y-10 text-[13px] leading-6 text-slate-200">
      <section>
        <div className="text-base font-semibold text-slate-100">CONTRATO DE PRESTAÇÃO DE SERVIÇOS — KASH Solutions</div>
        <ol className="list-decimal list-inside mt-3 space-y-2 text-slate-300">
          <li><b>Objeto.</b> Formação de LLC na Flórida, obtenção do EIN junto ao IRS e emissão do W‑8BEN‑E, após aprovação do registro.</li>
          <li><b>Endereço e Agente.</b> Inclusos por 12 meses; renováveis mediante cobrança adicional.</li>
          <li><b>Responsabilidade.</b> Dados enviados pelo CLIENTE são de sua exclusiva responsabilidade.</li>
          <li><b>Vigência.</b> Válido após pagamento integral das taxas e serviços.</li>
          <li><b>Jurisdição.</b> Rio de Janeiro/RJ, Brasil, e alternativa em Orange County/FL, EUA.</li>
          <li><b>Preço.</b> US$ 1.360.</li>
          <li><b>Disposições finais.</b> Registro da LLC não implica contabilidade mensal.</li>
        </ol>
        <div className="text-xs text-slate-400 mt-4">Tracking: {tracking}</div>
        <div className="text-xs text-slate-400">Data: {dateISO}</div>
      </section>
      <hr className="border-slate-700" />
      <section>
        <div className="text-base font-semibold text-slate-100">SERVICE AGREEMENT — KASH Solutions</div>
        <ol className="list-decimal list-inside mt-3 space-y-2 text-slate-300">
          <li><b>Purpose.</b> Formation of a Florida LLC, EIN with the IRS, and W‑8BEN‑E issuance upon approval.</li>
          <li><b>Registered Agent & Address.</b> Provided for 12 months; renewable with fees.</li>
          <li><b>Information responsibility.</b> All data is the CLIENT’s sole responsibility.</li>
          <li><b>Effectiveness.</b> Valid after full payment of fees and services.</li>
          <li><b>Jurisdiction.</b> Rio de Janeiro/RJ, Brazil; alternative venue in Orange County/FL, USA.</li>
          <li><b>Price.</b> US$ 1,360.</li>
          <li><b>Final provisions.</b> Registration does not imply monthly bookkeeping.</li>
        </ol>
        <div className="text-xs text-slate-400 mt-4">Tracking: {tracking}</div>
        <div className="text-xs text-slate-400">Date: {dateISO}</div>
      </section>
    </div>
  );
}

/* ================== PDF (Times, 12pt, margens 1" e data ao final) ================== */
function generateA4PdfLikeModel({ companyName, tracking, dateISO }) {
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) return "";
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = { l: 72, r: 72, t: 72, b: 72 }; // 1 inch margins
    const width = doc.internal.pageSize.getWidth() - M.l - M.r;
    const write = (title, lines) => {
      let y = M.t;
      doc.setFont("times", "bold"); doc.setFontSize(14);
      doc.text(title, M.l, y); y += 18;
      doc.setFont("times", ""); doc.setFontSize(12);
      lines.forEach((t) => {
        const arr = doc.splitTextToSize(t, width);
        doc.text(arr, M.l, y);
        y += (arr.length * 16);
      });
    };

    // PT
    const pt = buildContractPT(companyName, tracking, dateISO).split("\n");
    write("CONTRATO DE PRESTAÇÃO DE SERVIÇOS — KASH Solutions", pt.slice(2, -2)); // corpo principal
    // rodapé com tracking + data
    doc.setFont("times",""); doc.setFontSize(12);
    doc.text(`Tracking: ${tracking}`, M.l, doc.internal.pageSize.getHeight() - M.b - 28);
    doc.text(`Data: ${dateISO}`, M.l, doc.internal.pageSize.getHeight() - M.b - 12);

    // EN (segunda página)
    doc.addPage();
    const en = buildContractEN(companyName, tracking, dateISO).split("\n");
    write("SERVICE AGREEMENT — KASH Solutions", en.slice(2, -2));
    doc.setFont("times",""); doc.setFontSize(12);
    doc.text(`Tracking: ${tracking}`, M.l, doc.internal.pageSize.getHeight() - M.b - 28);
    doc.text(`Date: ${dateISO}`, M.l, doc.internal.pageSize.getHeight() - M.b - 12);

    return doc.output("bloburl");
  } catch (e) {
    console.error(e);
    return "";
  }
}

/* ================== FORM WIZARD ================== */
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
    case "UPDATE_MEMBER": {
      const list = state.members.map((m, i) => i === action.index ? { ...m, [action.field]: action.value } : m);
      return { ...state, members: list };
    }
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
        {canRemove && <button className="text-slate-400 hover:text-slate-200 text-xs" onClick={onRemove}>Remover</button>}
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.fullName && "border-red-500")} placeholder="Nome completo" value={data.fullName} onChange={(e) => onChange("fullName", e.target.value)} />
          <FieldError msg={errors.fullName} />
        </div>
        <div>
          <input type="email" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.email && "border-red-500")} placeholder="E-mail do sócio" value={data.email} onChange={(e) => onChange("email", e.target.value)} />
          <FieldError msg={errors.email} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.phone && "border-red-500")} placeholder="Telefone do sócio" value={data.phone} onChange={(e) => onChange("phone", e.target.value)} />
          <FieldError msg={errors.phone} />
        </div>
        <div>
          <input className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.passport && "border-red-500")} placeholder="Passaporte (ou RG)" value={data.passport} onChange={(e) => onChange("passport", e.target.value)} />
          <FieldError msg={errors.passport} />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-2">
        <div>
          <input className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Órgão emissor" value={data.issuer} onChange={(e) => onChange("issuer", e.target.value)} />
        </div>
        <div>
          <input type="date" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.docExpiry && "border-red-500")} value={data.docExpiry} onChange={(e) => onChange("docExpiry", e.target.value)} />
          <div className="text-[11px] text-slate-400 mt-1">Validade do documento</div>
          <FieldError msg={errors.docExpiry} />
        </div>
        <div>
          <input type="date" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.birthdate && "border-red-500")} value={data.birthdate} onChange={(e) => onChange("birthdate", e.target.value)} />
          <div className="text-[11px] text-slate-400 mt-1">Data de nascimento</div>
          <FieldError msg={errors.birthdate} />
        </div>
      </div>
      <div>
        <input type="number" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.percent && "border-red-500")} placeholder="% de participação" value={data.percent} onChange={(e) => onChange("percent", e.target.value)} />
        <FieldError msg={errors.percent} />
      </div>
    </div>
  );
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

/* ======= Tracking Search (simples, sem rotas) ======= */
function TrackingSearch() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = () => {
    try {
      const raw = localStorage.getItem(code.trim());
      if (!raw) { setResult(null); setNotFound(true); return; }
      const data = JSON.parse(raw);
      setResult(data);
      setNotFound(false);
    } catch (e) {
      setResult(null); setNotFound(true);
    }
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
            <div className="mt-4">
              <CTAButton onClick={() => {
                const url = generateA4PdfLikeModel({ companyName: result.company?.companyName, tracking: result.tracking, dateISO: result.dateISO });
                if (url) { const a = document.createElement("a"); a.href = url; a.download = `KASH_Contract_${result.tracking}.pdf`; document.body.appendChild(a); a.click(); a.remove(); }
              }}>Baixar contrato (PDF)</CTAButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FormWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");
  const [agreed, setAgreed] = useState(true); // marcado por padrão conforme solicitado
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [errors, setErrors] = useState({ company: {}, members: [], accept: {} });

  const updateCompany = (field, value) => dispatch({ type: "UPDATE_COMPANY", field, value });
  const updateUS = (field, value) => dispatch({ type: "UPDATE_US_ADDRESS", field, value });
  const updateMember = (index, field, value) => dispatch({ type: "UPDATE_MEMBER", index, field, value });
  const addMember = () => dispatch({ type: "ADD_MEMBER" });
  const removeMember = (index) => dispatch({ type: "REMOVE_MEMBER", index });
  const toggleAccept = (key, value) => dispatch({ type: "TOGGLE_ACCEPT", key, value });

  // Se o usuário marcar que possui endereço na Flórida, desabilita/limpa caixa de "limitações"
  useEffect(() => {
    if (form.company.hasFloridaAddress && form.accept.limitations) {
      dispatch({ type: "TOGGLE_ACCEPT", key: "limitations", value: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.company.hasFloridaAddress]);

  function validate() {
    const { company, members, accept } = form;
    const errs = { company: {}, members: members.map(() => ({})), accept: {} };

    if (!company.companyName || company.companyName.length < 3) errs.company.companyName = "Informe o nome da LLC.";
    if (!emailRe.test(company.email || "")) errs.company.email = "E-mail inválido.";
    if (!phoneRe.test(company.phone || "")) errs.company.phone = "Telefone inválido.";

    if (company.hasFloridaAddress) {
      if (!company.usAddress.line1 || company.usAddress.line1.length < 3) errs.company.line1 = "Endereço (Line 1) obrigatório.";
      if (!company.usAddress.city) errs.company.city = "Cidade obrigatória.";
      if (!company.usAddress.state) errs.company.state = "Estado obrigatório.";
      if (!company.usAddress.zip) errs.company.zip = "ZIP obrigatório.";
    }

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || m.fullName.length < 5) errs.members[i].fullName = "Nome inválido.";
      if (!emailRe.test(m.email || "")) errs.members[i].email = "E-mail inválido.";
      if (!phoneRe.test(m.phone || "")) errs.members[i].phone = "Telefone inválido.";
      if (!m.passport || m.passport.length < 5) errs.members[i].passport = "Documento obrigatório.";
      if (!m.docExpiry) errs.members[i].docExpiry = "Informe a validade do documento.";
      if (!m.birthdate) errs.members[i].birthdate = "Data obrigatória.";
      if (!m.percent || Number(m.percent) <= 0) errs.members[i].percent = "% obrigatório.";
      if (m.birthdate && calcAgeFullDate(m.birthdate) < 18) errs.members[i].birthdate = "Precisa ter 18+.";
    }
    if (!isPercentTotalValid(members)) alert("A soma dos percentuais deve ser 100%.");

    if (!accept.responsibility) errs.accept.base = "Aceite a declaração de responsabilidade.";
    if (!company.hasFloridaAddress && !accept.limitations) errs.accept.base = "Aceite as limitações (endereço/agente por 12 meses).";

    const companyErrors = Object.keys(errs.company).length === 0;
    const membersOk = errs.members.every((m) => Object.keys(m).length === 0);
    const acceptsOk = accept.responsibility && (company.hasFloridaAddress || accept.limitations);

    const ok = companyErrors && membersOk && acceptsOk && isPercentTotalValid(members);
    setErrors(errs);
    return { ok, errs };
  }

  async function handleSubmit() {
    const v = validate();
    if (!v.ok) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);
    const mock = "KASH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setTracking(mock);
    const dateISO = todayISO();

    const contractPT = buildContractPT(form.company.companyName, mock, dateISO);
    const contractEN = buildContractEN(form.company.companyName, mock, dateISO);

    const payload = {
      tracking: mock,
      dateISO,
      agreed: true, // enviar marcado
      company: form.company,
      members: form.members,
      accepts: form.accept,
      contractPT,
      contractEN,
      source: "kashsolutions.us",
    };

    try {
      localStorage.setItem(mock, JSON.stringify(payload));
      await fetch(CONFIG.formspreeEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) { console.warn("Formspree/local save error", e); }
    setLoading(false);
    setStep(3); // Mostra tracking + contrato
  }

  const { company, members, accept } = form;
  const AErr = errors.company || {};
  const dateISO = todayISO();

  return (
    <div className={classNames("fixed inset-0 z-50", !open && "hidden")}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-10">
          <div className="rounded-2xl bg-slate-950/90 backdrop-blur border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-slate-300 font-medium">Formulário de Aplicação LLC</div>
              <button className="text-slate-400 hover:text-slate-200" onClick={onClose}>Fechar</button>
            </div>

            {/* Step 1: Formulário */}
            {step === 1 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">1/2 — Dados iniciais da LLC</h4>

                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm text-slate-400" htmlFor="companyName">Nome da LLC</label>
                    <input id="companyName" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", AErr.companyName && "border-red-500")} placeholder="Ex.: SUNSHINE MEDIA LLC" value={company.companyName} onChange={(e) => updateCompany("companyName", e.target.value)} />
                    <FieldError msg={AErr.companyName} />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400" htmlFor="companyEmail">E-mail principal</label>
                      <input id="companyEmail" type="email" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", AErr.email && "border-red-500")} placeholder="email@exemplo.com" value={company.email} onChange={(e) => updateCompany("email", e.target.value)} />
                      <FieldError msg={AErr.email} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400" htmlFor="companyPhone">Telefone principal</label>
                      <input id="companyPhone" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", AErr.phone && "border-red-500")} placeholder="+1 (305) 123-4567" value={company.phone} onChange={(e) => updateCompany("phone", e.target.value)} />
                      <FieldError msg={AErr.phone} />
                    </div>
                  </div>

                  {/* Toggle: possui endereço na Flórida? */}
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" checked={company.hasFloridaAddress} onChange={(e) => updateCompany("hasFloridaAddress", e.target.checked)} />
                      <span>Possui endereço físico na Flórida?</span>
                    </label>
                  </div>

                  {/* Se SIM, abrir campos de endereço USA */}
                  {company.hasFloridaAddress ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-slate-300 font-medium mb-2">Endereço da empresa (USA)</div>
                      <div>
                        <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", AErr.line1 && "border-red-500")} placeholder="Address Line 1" value={company.usAddress.line1} onChange={(e) => updateUS("line1", e.target.value)} />
                        <FieldError msg={AErr.line1} />
                      </div>
                      <div className="mt-2">
                        <input className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Address Line 2 (opcional)" value={company.usAddress.line2} onChange={(e) => updateUS("line2", e.target.value)} />
                      </div>
                      <div className="mt-2 grid md:grid-cols-3 gap-2">
                        <div>
                          <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", AErr.city && "border-red-500")} placeholder="City" value={company.usAddress.city} onChange={(e) => updateUS("city", e.target.value)} />
                          <FieldError msg={AErr.city} />
                        </div>
                        <div>
                          <select className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", AErr.state && "border-red-500")} value={company.usAddress.state} onChange={(e) => updateUS("state", e.target.value)}>
                            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <FieldError msg={AErr.state} />
                        </div>
                        <div>
                          <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", AErr.zip && "border-red-500")} placeholder="ZIP Code" value={company.usAddress.zip} onChange={(e) => updateUS("zip", e.target.value)} />
                          <FieldError msg={AErr.zip} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                      Não possui endereço na Flórida — utilizaremos o <b>endereço e agente da KASH por 12 meses</b> incluídos no pacote.
                    </div>
                  )}
                </div>

                <h4 className="mt-6 text-slate-100 font-medium">Sócios (mínimo 2)</h4>
                <div className="mt-2 space-y-4">
                  {members.map((m, i) => (
                    <MemberCard key={i} index={i} data={m} canRemove={members.length > 2} onChange={(field, value) => updateMember(i, field, value)} onRemove={() => removeMember(i)} errors={errors.members[i] || {}} />
                  ))}
                </div>

                <button onClick={addMember} className="mt-4 text-emerald-400 hover:underline">+ Adicionar sócio</button>

                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" checked={accept.responsibility} onChange={(e) => toggleAccept("responsibility", e.target.checked)} />
                    <span>Declaro que todas as informações prestadas são verdadeiras e completas e assumo total responsabilidade civil e legal por elas.</span>
                  </label>
                  <label className={classNames("flex items-start gap-2", company.hasFloridaAddress && "opacity-50")}>
                    <input type="checkbox" checked={accept.limitations} disabled={company.hasFloridaAddress} onChange={(e) => toggleAccept("limitations", e.target.checked)} />
                    <span>Estou ciente de que endereço e agente da KASH são válidos por 12 meses.</span>
                  </label>
                  {company.hasFloridaAddress && <div className="text-[12px] text-slate-400 -mt-2">* Indisponível porque você informou endereço próprio na Flórida.</div>}
                  {errors.accept.base && <div className="text-red-400 text-xs">{errors.accept.base}</div>}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <CTAButton onClick={() => { const v = validate(); if (v.ok) setStep(2); }}>Continuar</CTAButton>
                </div>
              </div>
            )}

            {/* Step 2: Revisão */}
            {step === 2 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">2/2 — Revisão</h4>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-slate-300 font-medium">Empresa</div>
                  <div className="mt-2 grid gap-y-1 text-sm">
                    <div><span className="text-slate-500">Nome: </span>{company.companyName || "—"}</div>
                    <div className="grid md:grid-cols-2 gap-x-6">
                      <div><span className="text-slate-500">E-mail: </span>{company.email || "—"}</div>
                      <div><span className="text-slate-500">Telefone: </span>{company.phone || "—"}</div>
                    </div>
                    {company.hasFloridaAddress ? (
                      <div className="mt-1">
                        <div className="text-slate-400">Endereço informado:</div>
                        <div>{company.usAddress.line1}</div>
                        {company.usAddress.line2 && <div>{company.usAddress.line2}</div>}
                        <div>{company.usAddress.city}, {company.usAddress.state} {company.usAddress.zip}</div>
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-400">Será utilizado o endereço e agente da KASH por 12 meses.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 mt-4">
                  <div className="text-slate-300 font-medium">Sócios</div>
                  <div className="mt-2 space-y-3">
                    {members.map((m, i) => (
                      <div key={i} className="text-sm text-slate-400">
                        <div className="font-medium text-slate-300">Sócio {i + 1}: {m.fullName || "—"}</div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                          <div><span className="text-slate-500">E-mail: </span>{m.email || "—"}</div>
                          <div><span className="text-slate-500">Telefone: </span>{m.phone || "—"}</div>
                          <div><span className="text-slate-500">Documento: </span>{m.passport || "—"}</div>
                          <div><span className="text-slate-500">Órgão emissor: </span>{m.issuer || "—"}</div>
                          <div><span className="text-slate-500">Validade doc.: </span>{m.docExpiry || "—"}</div>
                          <div><span className="text-slate-500">Nascimento: </span>{m.birthdate || "—"}</div>
                          <div><span className="text-slate-500">Participação: </span>{m.percent || "—"}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <CTAButton variant="ghost" onClick={() => setStep(1)}>Voltar</CTAButton>
                  <CTAButton onClick={handleSubmit}>{loading ? "Enviando..." : "Enviar"}</CTAButton>
                </div>
              </div>
            )}

            {/* Step 3: Tracking + Contrato (Li e Concordo marcado) */}
            {step === 3 && (
              <div className="p-6">
                <div className="text-center">
                  <h4 className="text-slate-100 font-medium">Dados enviados com sucesso</h4>
                  <p className="text-slate-400 mt-2">Anote seu código de acompanhamento (tracking):</p>
                  <div className="mt-2 text-emerald-400 text-xl font-bold">{tracking}</div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-300 font-medium">Contrato (PT & EN)</div>
                    <button className="text-xs text-emerald-400 hover:underline" onClick={() => {
                      const url = generateA4PdfLikeModel({ companyName: company.companyName, tracking, dateISO });
                      if (url) { const a = document.createElement("a"); a.href = url; a.download = `KASH_Contract_${tracking}.pdf`; document.body.appendChild(a); a.click(); a.remove(); }
                    }}>Baixar PDF</button>
                  </div>
                  <div className="mt-4 max-h-[50vh] overflow-auto pr-2">
                    <ContractText companyName={company.companyName} tracking={tracking} dateISO={dateISO} />
                  </div>
                  <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span>Li e concordo com os termos acima.</span>
                  </label>
                  <div className="mt-4 flex justify-end">
                    <CTAButton onClick={onClose} disabled={!agreed}>Concluir</CTAButton>
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
        <div className="text-slate-400 text-sm">Contato: {CONFIG.contact.email} · WhatsApp {CONFIG.contact.whatsapp}</div>
      </div>
    </footer>
  );
}

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
