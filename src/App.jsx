import React, { useCallback, useReducer, useState } from "react";

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

/* Helpers de data */
function calcAgeFullDate(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}
function isTodayOrFuture(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  d.setHours(0,0,0,0); today.setHours(0,0,0,0);
  return d.getTime() >= today.getTime();
}
function isPercentTotalValid(members) {
  const sum = members.reduce((acc, m) => acc + (Number(m.percent || 0) || 0), 0);
  return Math.abs(sum - 100) < 0.001;
}

/* ================== UI BÁSICOS ================== */
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
function Pill({ children }) { return <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">{children}</span>; }
function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-2xl text-slate-100 font-semibold">{title}</h3>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
function CTAButton({ children, variant = "primary", onClick, type="button", disabled=false }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
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
        <div className="rounded-xl bg-slate-800 p-3"><div className="text-xs text-slate-400">Economia potencial</div><div className="text-lg text-emerald-400">US$ {saved.toLocaleString()}</div></div>
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
            <p className="mt-4 text-slate-300">Solução completa para criadores brasileiros que monetizam nos EUA: abertura da empresa, EIN, W‑8BEN‑E, endereço e agente registrado por 12 meses.</p>
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
    { name: "Abertura LLC", price: CONFIG.prices.llc, features: ["Endereço + Agente 12 meses", "EIN", "Operating Agreement", "W‑8BEN‑E"], cta: "Contratar" },
    { name: "KASH FLOW 30 (Mensal)", price: CONFIG.prices.flow30, features: ["Classificação contábil", "Relatórios mensais"], cta: "Assinar" },
    { name: "KASH SCALE 5 (Mensal)", price: CONFIG.prices.scale5, features: ["Até 5 contratos", "Suporte prioritário"], cta: "Assinar" },
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
              <div className="mt-5"><CTAButton onClick={onStart}>{p.cta}</CTAButton></div>
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

/* ================== FORM WIZARD ================== */
const initialForm = {
  company: { companyName: "", email: "", phone: "", address: "" },
  members: [
    { fullName: "", email: "", phone: "", passport: "", issuer: "", birthdate: "", idExpiry: "", percent: "" },
    { fullName: "", email: "", phone: "", passport: "", issuer: "", birthdate: "", idExpiry: "", percent: "" },
  ],
  accept: { responsibility: false, limitations: false },
};

function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_COMPANY":
      return { ...state, company: { ...state.company, [action.field]: action.value } };
    case "UPDATE_MEMBER": {
      const list = state.members.map((m, i) => i === action.index ? { ...m, [action.field]: action.value } : m);
      return { ...state, members: list };
    }
    case "ADD_MEMBER":
      return { ...state, members: [...state.members, { fullName: "", email: "", phone: "", passport: "", issuer: "", birthdate: "", idExpiry: "", percent: "" }] };
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
      <div className="flex items-center justify-between mb-1"><div className="text-slate-300 font-medium">Sócio {index + 1}</div>{canRemove && <button className="text-slate-400 hover:text-slate-200 text-xs" onClick={onRemove}>Remover</button>}</div>
      {/* Nome */}
      <div>
        <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.fullName && "border-red-500")}
               placeholder="Nome completo"
               value={data.fullName}
               onChange={(e) => onChange("fullName", e.target.value)} />
        <FieldError msg={errors.fullName} />
      </div>
      {/* Email e Telefone */}
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input type="email" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.email && "border-red-500")}
                 placeholder="E-mail do sócio"
                 value={data.email}
                 onChange={(e) => onChange("email", e.target.value)} />
          <FieldError msg={errors.email} />
        </div>
        <div>
          <input className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.phone && "border-red-500")}
                 placeholder="Telefone do sócio (ex.: +55 11 99999-9999)"
                 value={data.phone}
                 onChange={(e) => onChange("phone", e.target.value)} />
          <FieldError msg={errors.phone} />
        </div>
      </div>
      {/* Documento e Órgão */}
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.passport && "border-red-500")}
                 placeholder="Documento de identidade (Passaporte/RG)"
                 value={data.passport}
                 onChange={(e) => onChange("passport", e.target.value)} />
          <FieldError msg={errors.passport} />
        </div>
        <div>
          <input className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500")}
                 placeholder="Órgão emissor"
                 value={data.issuer}
                 onChange={(e) => onChange("issuer", e.target.value)} />
        </div>
      </div>
      {/* Nascimento e Validade do documento */}
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Data de nascimento</label>
          <input type="date" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.birthdate && "border-red-500")}
                 value={data.birthdate}
                 onChange={(e) => onChange("birthdate", e.target.value)} />
          <FieldError msg={errors.birthdate} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Validade do documento</label>
          <input type="date" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.idExpiry && "border-red-500")}
                 value={data.idExpiry}
                 onChange={(e) => onChange("idExpiry", e.target.value)} />
          <FieldError msg={errors.idExpiry} />
        </div>
      </div>
      {/* Percentual */}
      <div>
        <input type="number" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.percent && "border-red-500")}
               placeholder="% de participação"
               value={data.percent}
               onChange={(e) => onChange("percent", e.target.value)} />
        <FieldError msg={errors.percent} />
      </div>
    </div>
  );
}

function FormWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [errors, setErrors] = useState({ company: {}, members: [], accept: {} });

  const updateCompany = useCallback((field, value) => dispatch({ type: "UPDATE_COMPANY", field, value }), []);
  const updateMember = useCallback((index, field, value) => dispatch({ type: "UPDATE_MEMBER", index, field, value }), []);
  const addMember = useCallback(() => dispatch({ type: "ADD_MEMBER" }), []);
  const removeMember = useCallback((index) => dispatch({ type: "REMOVE_MEMBER", index }), []);
  const toggleAccept = useCallback((key, value) => dispatch({ type: "TOGGLE_ACCEPT", key, value }), []);

  function validate() {
    const { company, members, accept } = form;
    const errs = { company: {}, members: members.map(() => ({})), accept: {} };

    if (!company.companyName || company.companyName.length < 3) errs.company.companyName = "Informe o nome da LLC.";
    if (!emailRe.test(company.email || "")) errs.company.email = "E-mail inválido.";
    if (!phoneRe.test(company.phone || "")) errs.company.phone = "Telefone inválido.";
    if (!company.address || company.address.length < 8) errs.company.address = "Informe o endereço (ou indique uso do escritório).";

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || m.fullName.length < 5) errs.members[i].fullName = "Nome inválido.";
      if (!emailRe.test(m.email || "")) errs.members[i].email = "E-mail do sócio inválido.";
      if (!phoneRe.test(m.phone || "")) errs.members[i].phone = "Telefone do sócio inválido.";
      if (!m.passport || m.passport.length < 5) errs.members[i].passport = "Documento obrigatório.";
      if (!m.birthdate) errs.members[i].birthdate = "Data de nascimento obrigatória.";
      if (m.birthdate && calcAgeFullDate(m.birthdate) < 18) errs.members[i].birthdate = "Menor de 18 anos não permitido.";
      if (!m.idExpiry) errs.members[i].idExpiry = "Validade do documento obrigatória.";
      if (m.idExpiry && !isTodayOrFuture(m.idExpiry)) errs.members[i].idExpiry = "Validade não pode ser anterior à data da aplicação.";
      if (!m.percent || Number(m.percent) <= 0) errs.members[i].percent = "% obrigatório.";
    }
    if (!isPercentTotalValid(members)) alert("A soma dos percentuais deve ser 100%.");
    if (!accept.responsibility || !accept.limitations) errs.accept.base = "Aceite as declarações.";

    const ok = !errs.company.companyName && !errs.company.email && !errs.company.phone && !errs.company.address
      && errs.members.every((m) => Object.keys(m).length === 0) && accept.responsibility && accept.limitations && isPercentTotalValid(members);

    setErrors(errs);
    return { ok, errs };
  }

  /* ===== PDF bilíngue com paginação e tracking ===== */
  function generatePdf(trackingCode) {
    try {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) return "";

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const { company, members } = form;

      // Margens / helpers
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const M = { l: 48, r: 48, t: 64, b: 64, width: pageW - 96 };
      let y = M.t;
      const centerX = pageW / 2;

      const text = (t, yy, opt = {}) => doc.text(t, M.l, yy, opt);
      const center = (t, yy) => doc.text(t, centerX, yy, { align: "center" });
      const hr = (yy) => { doc.setDrawColor(60); doc.line(M.l, yy, pageW - M.r, yy); };
      const writeBlock = (t) => { const lines = doc.splitTextToSize(t, M.width); lines.forEach((ln) => { text(ln, y); y += 16; }); y += 6; };
      const footer = (pageNum) => { doc.setFontSize(9); doc.setTextColor(150); doc.text(`Página ${pageNum}`, pageW - M.r, pageH - 26, { align: "right" }); doc.text(`Tracking: ${trackingCode}`, M.l, pageH - 26); };

      // CAPA
      doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(30);
      center("KASH CORPORATE SOLUTIONS LLC", y); y += 26;
      doc.setFontSize(13); center("Service Agreement / Contrato de Prestação de Serviços", y); y += 24; hr(y); y += 24;
      doc.setFontSize(11); text("CLIENTE: " + (company.companyName || "[NOME DO CLIENTE]"), y); y += 18;
      text("CONTRATADA: " + CONFIG.brand.legal + ", Florida, EUA", y); y += 24;
      text("Tracking: " + trackingCode, y); y += 24; footer(1);

      // PÁGINA 2 — PORTUGUÊS
      doc.addPage(); y = M.t; doc.setFontSize(12); doc.setFont("helvetica", "bold"); text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", y); y += 20;
      doc.setFont("helvetica", ""); doc.setFontSize(10);
      writeBlock("1. OBJETO — Este contrato tem por objeto a prestação de serviços profissionais para abertura de empresa do tipo LLC no Estado da Flórida, obtenção do EIN junto ao IRS e emissão do formulário W‑8BEN‑E, após aprovação da empresa.");
      writeBlock("2. ENDEREÇO E AGENTE — A CONTRATADA fornecerá endereço físico e agente registrado por 12 (doze) meses contados da assinatura. Após este período, os serviços poderão ser renovados mediante cobrança adicional.");
      writeBlock("3. RESPONSABILIDADE DAS INFORMAÇÕES — Todas as informações fornecidas pelo CLIENTE por meio do formulário eletrônico são de sua exclusiva responsabilidade, incluindo consequências civis e criminais por declarações inexatas ou falsas.");
      writeBlock("4. VIGÊNCIA E CONDIÇÃO — O contrato torna‑se válido após o pagamento integral dos serviços e taxas no ambiente disponibilizado pela CONTRATADA.");
      writeBlock("5. JURISDIÇÃO — Fica eleito o foro da Comarca do Rio de Janeiro/RJ, Brasil, e, se conveniente ao CLIENTE, também poderá ser aplicado o foro do Estado da Flórida, EUA, Condado de Orange.");
      writeBlock("6. VALOR — O valor do pacote de abertura é de US$ 1.360 (um mil trezentos e sessenta dólares), salvo promoções divulgadas no site.");
      writeBlock("7. DISPOSIÇÕES FINAIS — O CLIENTE declara ciência de que o registro da LLC não implica contratação automática de serviços contábeis mensais.");
      footer(2);

      // PÁGINA 3 — ENGLISH
      doc.addPage(); y = M.t; doc.setFontSize(12); doc.setFont("helvetica", "bold"); text("SERVICE AGREEMENT – KASH Solutions", y); y += 20;
      doc.setFont("helvetica", ""); doc.setFontSize(10);
      writeBlock("1. PURPOSE — This Agreement covers the professional services for forming a Florida LLC, obtaining the EIN with the IRS, and issuing the W‑8BEN‑E Form upon company approval.");
      writeBlock("2. REGISTERED AGENT AND ADDRESS — CONTRACTOR shall provide a physical address and registered agent for 12 (twelve) months from the signature date. After this period, services may be renewed with additional fees.");
      writeBlock("3. INFORMATION RESPONSIBILITY — All information provided by the CLIENT through the electronic form is the CLIENT’s sole responsibility, including criminal and civil liability for inaccuracies or false statements.");
      writeBlock("4. EFFECTIVENESS — This Agreement becomes valid after full payment of services and fees through the platform provided by the CONTRACTOR.");
      writeBlock("5. JURISDICTION — Venue is elected in Rio de Janeiro/RJ, Brazil, and, if convenient to the CLIENT, the State of Florida, USA, Orange County, may also apply.");
      writeBlock("6. PRICE — The package price is US$ 1,360 (one thousand three hundred and sixty US dollars), unless otherwise promoted on the website.");
      writeBlock("7. FINAL PROVISIONS — CLIENT acknowledges that LLC registration does not imply automatic hiring of monthly bookkeeping services.");
      footer(3);

      // Assinaturas
      doc.addPage(); y = M.t; doc.setFontSize(12); doc.setFont("helvetica", "bold"); text("LOCAL E DATA / PLACE AND DATE", y); y += 18;
      doc.setFont("helvetica", ""); doc.setFontSize(10);
      writeBlock("Local: Orlando - FL (on-line)");
      const now = new Date();
      writeBlock(`Gerado em ${now.toLocaleDateString()} ${now.toLocaleTimeString()} — Tracking: ${trackingCode}`);
      y += 10; hr(y); y += 24;
      writeBlock("ASSINATURAS / SIGNATURES"); y += 8;
      members.forEach((m, idx) => {
        writeBlock(`${idx + 1}. ${m.fullName || "[Nome do sócio]"} — ${m.email || "[email]"} — ${m.phone || "[telefone]"}`);
        writeBlock(`Nascimento: ${m.birthdate || "[dd/mm/aaaa]"} · Validade do doc.: ${m.idExpiry || "[dd/mm/aaaa]"}`);
        y += 10; hr(y); y += 26; // espaço para assinatura
      });
      footer(4);

      return doc.output("bloburl");
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  async function handleSubmit() {
    const v = validate();
    if (!v.ok) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);

    // 1) Gerar Tracking primeiro (para já constar no PDF)
    const mock = "KASH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setTracking(mock);

    // 2) Enviar ao Formspree (JSON)
    try {
      await fetch(CONFIG.formspreeEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tracking: mock, source: "kashsolutions.us" }),
      });
    } catch (e) {
      console.warn("Formspree error (seguimos mesmo assim)", e);
    }

    // 3) Gerar/baixar contrato PDF (bilíngue)
    const url = generatePdf(mock);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `KASH_Contract_${mock}.pdf`;
      document.body.appendChild(a);
      a.click(); a.remove();
    }

    setLoading(false);
    setStep(3);
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
              <button className="text-slate-400 hover:text-slate-200" onClick={onClose}>Fechar</button>
            </div>

            {step === 1 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">1/2 — Dados iniciais da LLC</h4>

                {/* Empresa */}
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm text-slate-400" htmlFor="companyName">Nome da LLC</label>
                    <input id="companyName" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.company.companyName && "border-red-500")}
                           placeholder="Ex.: SUNSHINE MEDIA LLC"
                           value={company.companyName}
                           onChange={(e) => updateCompany("companyName", e.target.value)} />
                    <FieldError msg={errors.company.companyName} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400" htmlFor="companyEmail">E-mail principal</label>
                    <input id="companyEmail" type="email" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.company.email && "border-red-500")}
                           placeholder="email@exemplo.com"
                           value={company.email}
                           onChange={(e) => updateCompany("email", e.target.value)} />
                    <FieldError msg={errors.company.email} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400" htmlFor="companyPhone">Telefone principal</label>
                    <input id="companyPhone" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.company.phone && "border-red-500")}
                           placeholder="+1 (305) 123-4567"
                           value={company.phone}
                           onChange={(e) => updateCompany("phone", e.target.value)} />
                    <FieldError msg={errors.company.phone} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400" htmlFor="companyAddress">Endereço</label>
                    <input id="companyAddress" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.company.address && "border-red-500")}
                           placeholder="Rua, número, cidade, país"
                           value={company.address}
                           onChange={(e) => updateCompany("address", e.target.value)} />
                    <FieldError msg={errors.company.address} />
                  </div>
                </div>

                {/* Sócios */}
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
                <button onClick={addMember} className="mt-4 text-emerald-400 hover:underline">+ Adicionar sócio</button>

                {/* Aceites */}
                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <label className="flex items-start gap-2">
                    <input type="checkbox" checked={accept.responsibility} onChange={(e) => toggleAccept("responsibility", e.target.checked)} />
                    <span>Declaro que todas as informações prestadas são verdadeiras e completas e assumo total responsabilidade civil e legal por elas.</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" checked={accept.limitations} onChange={(e) => toggleAccept("limitations", e.target.checked)} />
                    <span>Estou ciente de que (i) o registro da LLC <strong>não</strong> implica contratação automática de serviços contábeis mensais e (ii) endereço e agente são válidos por 12 meses, com possibilidade de renovação mediante cobrança.</span>
                  </label>
                  {errors.accept.base && <div className="text-red-400 text-xs">{errors.accept.base}</div>}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <CTAButton variant="ghost" onClick={() => setStep(1)}>Revisar</CTAButton>
                  <CTAButton onClick={() => { const v = validate(); if (v.ok) setStep(2); }}>Continuar</CTAButton>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">2/2 — Revisão e envio</h4>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-slate-300 font-medium">Empresa</div>
                  <div className="mt-2 grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="text-slate-500">Nome: </span>{company.companyName || "—"}</div>
                    <div><span className="text-slate-500">E-mail: </span>{company.email || "—"}</div>
                    <div><span className="text-slate-500">Telefone: </span>{company.phone || "—"}</div>
                    <div className="md:col-span-2"><span className="text-slate-500">Endereço: </span>{company.address || "—"}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 mt-4">
                  <div className="text-slate-300 font-medium">Sócios</div>
                  <div className="mt-2 space-y-3">
                    {members.map((m, i) => (
                      <div key={i} className="text-sm text-slate-400 pt-3 border-t border-slate-800 first:border-t-0 first:pt-0">
                        <div className="font-medium text-slate-300">Sócio {i + 1}: {m.fullName || "—"}</div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                          <div><span className="text-slate-500">E-mail: </span>{m.email || "—"}</div>
                          <div><span className="text-slate-500">Telefone: </span>{m.phone || "—"}</div>
                          <div><span className="text-slate-500">Documento: </span>{m.passport || "—"}</div>
                          <div><span className="text-slate-500">Órgão emissor: </span>{m.issuer || "—"}</div>
                          <div><span className="text-slate-500">Nascimento: </span>{m.birthdate || "—"}</div>
                          <div><span className="text-slate-500">Validade do documento: </span>{m.idExpiry || "—"}</div>
                          <div><span className="text-slate-500">Participação: </span>{m.percent || "—"}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões de assinatura (desabilitados por hora) */}
                <div className="mt-6 flex items-center gap-3">
                  <CTAButton disabled>Assinatura digital (indisponível)</CTAButton>
                  <span className="text-xs text-slate-500">Em breve nesta plataforma. As informações acima permanecerão visíveis para conferência.</span>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <CTAButton variant="ghost" onClick={() => setStep(1)}>Voltar</CTAButton>
                  <CTAButton onClick={handleSubmit}>{loading ? "Enviando..." : "Enviar e gerar contrato"}</CTAButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-6 text-center">
                <h4 className="text-slate-100 font-medium">Aplicação enviada!</h4>
                <p className="text-slate-400 mt-2">Recebemos seus dados. Você pode baixar o contrato gerado automaticamente e acompanhar pelo e‑mail.</p>
                <div className="mt-2 text-emerald-400 text-xl font-bold">{tracking}</div>
                <p className="text-slate-500 text-xs mt-2">Guarde este código para consultar o status.</p>
                {/* Botão de assinatura desabilitado também aqui */}
                <div className="mt-4"><CTAButton disabled>Assinatura digital (indisponível)</CTAButton></div>
                <div className="mt-6"><CTAButton onClick={onClose}>Concluir</CTAButton></div>
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
      <Footer />
      <FormWizard open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
