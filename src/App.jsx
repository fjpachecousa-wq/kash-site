
import React, { useCallback, useMemo, useReducer, useState } from "react";

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

/* Idade exata pela data completa */
function calcAgeFullDate(birthdateStr) {
  const dob = new Date(birthdateStr); if (Number.isNaN(dob.getTime())) return -1;
  const t = new Date(); let age = t.getFullYear() - dob.getFullYear();
  const m = t.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--;
  return age;
}
function isPercentTotalValid(members) {
  const total = members.reduce((s, m) => s + (Number(m.share) || 0), 0);
  return Math.abs(total - 100) <= 0.01;
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
function Pill({ children }) { return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300 text-xs">{children}</span>; }
function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {eyebrow && <div className="mb-3"><Pill>{eyebrow}</Pill></div>}
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-400">{subtitle}</p>}
    </div>
  );
}
function CTAButton({ children, onClick, variant = "primary", type = "button" }) {
  const base = "px-5 py-3 rounded-2xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition";
  const styles = variant === "primary"
    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 focus:ring-emerald-300"
    : variant === "ghost"
    ? "bg-transparent ring-1 ring-slate-700 hover:bg-slate-800 text-slate-200"
    : "bg-slate-200 hover:bg-white text-slate-900";
  return <button type={type} className={classNames(base, styles)} onClick={onClick}>{children}</button>;
}

/* ================== SEÇÕES DA HOME ================== */
function DemoCalculator() {
  const [gross, setGross] = useState(5000);
  const withholding = useMemo(() => Math.max(0, (gross || 0) * 0.3), [gross]);
  return (
    <div className="rounded-2xl bg-slate-800/60 p-6 border border-slate-700 shadow-lg max-w-md">
      <h3 className="text-slate-100 font-semibold text-lg">Simulador de retenção (30%)</h3>
      <p className="text-slate-400 text-sm mt-1">Insira sua receita mensal em USD</p>
      <div className="mt-4 flex items-center gap-3">
        <input type="number" value={gross} onChange={(e) => setGross(parseFloat(e.target.value) || 0)} className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <span className="text-slate-400">USD</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
          <div className="text-slate-400 text-xs">Retenção estimada</div>
          <div className="text-slate-100 text-xl font-semibold">${withholding.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3">
          <div className="text-emerald-300 text-xs">Economia potencial*</div>
          <div className="text-emerald-200 text-xl font-semibold">${withholding.toLocaleString()}</div>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mt-3">*Comparado ao cenário sem LLC e sem declarações corretas.</p>
    </div>
  );
}
function Hero({ onStart }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3">
              <KLogo size={48} />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">KASH Solutions</h1>
                <p className="text-slate-400 text-sm">{CONFIG.brand.legal} · Florida LLC</p>
              </div>
            </div>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">Registro e gestão de <span className="text-emerald-400 font-semibold">LLC na Flórida</span> para criadores brasileiros que monetizam nos EUA.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton onClick={onStart}>Começar agora</CTAButton>
              <a href="#como-funciona" className="inline-flex"><CTAButton variant="ghost">Como funciona</CTAButton></a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Agente registrado 12 meses*</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Endereço virtual 12 meses*</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Abertura + Operação</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">*Após 12 meses, os serviços podem ser renovados mediante cobrança.</p>
          </div>
          <div className="md:justify-self-end"><DemoCalculator /></div>
        </div>
      </div>
    </section>
  );
}
function Services() {
  const items = [
    { title: "Abertura de LLC (Florida)", desc: "Registro estatal, EIN, Operating Agreement e documentos digitais." },
    { title: "Agente Registrado + Endereço virtual (12 meses)", desc: "Após este período, renovação com cobrança. Recepção e repasse digital." },
    { title: "Onboarding legal & fiscal", desc: "Checklist, KYC/AML, enquadramento e orientações para plataformas." },
    { title: "Bookkeeping mensal (KASH FLOW 30)", desc: "Classificação contábil contínua (sem gestão de contratos)." },
    { title: "Suporte contratual (KASH SCALE 5)", desc: "Até 5 contratos/mês. Operações com terceiros no Brasil." },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="servicos">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle eyebrow="Serviços KASH" title="Do registro à operação" subtitle="Feito para criadores brasileiros." />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <h3 className="text-slate-100 font-semibold">{it.title}</h3>
              <p className="text-slate-400 mt-2 text-sm">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Pricing({ onBuy, onBook }) {
  const plans = [
    { name: "Abertura de LLC", price: CONFIG.prices.llc, features: ["Registro Florida + Filing", "EIN + Operating Agreement", "Agente Registrado 12 meses", "Endereço virtual 12 meses"], cta: "Comprar agora", onClick: onBuy, highlight: true },
    { name: "KASH FLOW 30 (Mensal)", price: CONFIG.prices.flow30, features: ["Classificação contábil contínua", "Relatórios mensais", "Suporte fiscal de rotina"], cta: "Assinar", onClick: onBuy },
    { name: "KASH SCALE 5 (Mensal)", price: CONFIG.prices.scale5, features: ["Até 5 contratos/mês", "Operações com terceiros no Brasil", "Prioridade de suporte"], cta: "Falar com especialista", onClick: onBook },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="planos">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle eyebrow="Planos & preços" title="Transparente e direto ao ponto" />
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div key={p.name} className={classNames("rounded-2xl p-6 border shadow-sm flex flex-col", p.highlight ? "border-emerald-400/30 bg-emerald-400/5" : "border-slate-800 bg-slate-900")}>
              <h3 className="text-slate-100 font-semibold">{p.name}</h3>
              <div className="text-3xl font-bold text-emerald-400 mt-2">{p.price}</div>
              <ul className="mt-4 space-y-2 text-slate-400 text-sm">{p.features.map((f) => (<li key={f} className="flex gap-2 items-start"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" /> {f}</li>))}</ul>
              <div className="mt-6"><CTAButton onClick={p.onClick}>{p.cta}</CTAButton></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function HowItWorks() {
  const steps = [
    { t: "Conhecimento do Serviço", d: "Use o simulador e leia o escopo." },
    { t: "Assinatura do contrato", d: "E-signature com termos, SLA e compliance." },
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

/* ================== FORM & WIZARD ================== */
const initialForm = {
  company: { companyName: "", email: "", phone: "", address: "" },
  members: [
    { fullName: "", passport: "", issuer: "", expiry: "", share: "", phone: "", email: "", birthdate: "" },
    { fullName: "", passport: "", issuer: "", expiry: "", share: "", phone: "", email: "", birthdate: "" },
  ],
  accept: { responsibility: false, limitations: false },
  honeypot: "",
};
function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_COMPANY": {
      const { field, value } = action; if (!(field in state.company)) return state;
      if (state.company[field] === value) return state;
      return { ...state, company: { ...state.company, [field]: value } };
    }
    case "UPDATE_MEMBER": {
      const { index, field, value } = action; const members = state.members.slice();
      members[index] = { ...members[index], [field]: value }; return { ...state, members };
    }
    case "ADD_MEMBER": {
      return { ...state, members: [...state.members, { fullName: "", passport: "", issuer: "", expiry: "", share: "", phone: "", email: "", birthdate: "" }] };
    }
    case "REMOVE_MEMBER": {
      const { index } = action; if (state.members.length <= 2) return state;
      return { ...state, members: state.members.filter((_, i) => i !== index) };
    }
    case "TOGGLE_ACCEPT": {
      const { key, value } = action; return { ...state, accept: { ...state.accept, [key]: value } };
    }
    default: return state;
  }
}
function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="text-red-400 text-xs mt-1">{msg}</div>;
}
function MemberCard({ index, data, onChange, onRemove, canRemove, errors }) {
  return (
    <div className="p-4 border border-slate-700 rounded-xl bg-slate-800 space-y-2">
      <div className="flex items-center justify-between mb-1"><div className="text-slate-400 text-sm">Sócio {index + 1}</div>{canRemove && (<button onClick={onRemove} className="text-slate-400 hover:text-slate-200 text-xs">Remover</button>)}</div>
      <div>
        <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-slate-100", errors.fullName && "ring-1 ring-red-400")} placeholder="Nome completo" value={data.fullName} onChange={(e) => onChange("fullName", e.target.value)} />
        <FieldError msg={errors.fullName} />
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input className={classNames("rounded bg-slate-900 px-3 py-2 text-slate-100", errors.passport && "ring-1 ring-red-400")} placeholder="Passaporte" value={data.passport} onChange={(e) => onChange("passport", e.target.value)} />
          <FieldError msg={errors.passport} />
        </div>
        <div>
          <input className={classNames("rounded bg-slate-900 px-3 py-2 text-slate-100", errors.issuer && "ring-1 ring-red-400")} placeholder="Emissor" value={data.issuer} onChange={(e) => onChange("issuer", e.target.value)} />
          <FieldError msg={errors.issuer} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input type="date" className={classNames("rounded bg-slate-900 px-3 py-2 text-slate-100", errors.expiry && "ring-1 ring-red-400")} value={data.expiry} onChange={(e) => onChange("expiry", e.target.value)} />
          <FieldError msg={errors.expiry} />
        </div>
        <div>
          <input type="number" min={0} max={100} step={0.01} className={classNames("rounded bg-slate-900 px-3 py-2 text-slate-100", errors.share && "ring-1 ring-red-400")} placeholder="% Participação" value={data.share} onChange={(e) => onChange("share", e.target.value)} />
          <FieldError msg={errors.share} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input type="tel" inputMode="tel" className={classNames("rounded bg-slate-900 px-3 py-2 text-slate-100", errors.phone && "ring-1 ring-red-400")} placeholder="Telefone" value={data.phone} onChange={(e) => onChange("phone", e.target.value)} />
          <FieldError msg={errors.phone} />
        </div>
        <div>
          <input type="email" autoComplete="email" className={classNames("rounded bg-slate-900 px-3 py-2 text-slate-100", errors.email && "ring-1 ring-red-400")} placeholder="E-mail" value={data.email} onChange={(e) => onChange("email", e.target.value)} />
          <FieldError msg={errors.email} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-400">Data de nascimento</label>
        <input type="date" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-slate-100", errors.birthdate && "ring-1 ring-red-400")} value={data.birthdate} onChange={(e) => onChange("birthdate", e.target.value)} />
        <FieldError msg={errors.birthdate} />
      </div>
    </div>
  );
}

/* ================== WIZARD ================== */
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

    if (!company.companyName || company.companyName.trim().length < 3) errs.company.companyName = "Informe o nome da empresa (mín. 3).";
    if (!emailRe.test(company.email || "")) errs.company.email = "E-mail inválido.";
    if (!phoneRe.test(company.phone || "")) errs.company.phone = "Telefone inválido.";
    if (!company.address || company.address.trim().length < 5) errs.company.address = "Informe o endereço.";

    if (!Array.isArray(members) || members.length < 2) {
      alert("É necessário ao menos 2 sócios."); return { ok: false, errs };
    }
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || m.fullName.trim().length < 5) errs.members[i].fullName = "Nome completo.";
      if (!m.passport) errs.members[i].passport = "Passaporte.";
      if (!m.issuer) errs.members[i].issuer = "Emissor do passaporte.";
      if (!m.expiry) errs.members[i].expiry = "Validade do passaporte.";
      const p = Number(m.share); if (!Number.isFinite(p) || p <= 0) errs.members[i].share = "% inválido.";
      if (!phoneRe.test(m.phone || "")) errs.members[i].phone = "Telefone inválido.";
      if (!emailRe.test(m.email || "")) errs.members[i].email = "E-mail inválido.";
      if (!m.birthdate) errs.members[i].birthdate = "Data de nascimento.";
      if (m.birthdate && calcAgeFullDate(m.birthdate) < 18) errs.members[i].birthdate = "Precisa ter 18+.";
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
      const writeBlock = (content, opts = {}) => {
        const size = opts.size || 11;
        const gap = opts.gap ?? 14;
        doc.setFontSize(size);
        const parts = doc.splitTextToSize(content, M.width);
        for (const p of parts) {
          if (y > pageH - M.b) { doc.addPage(); y = M.t; }
          text(p, y);
          y += gap;
        }
      };
      const newSection = (title) => {
        doc.setFontSize(12);
        writeBlock(title, { size: 12, gap: 14 });
        y += 2;
      };

      // Cabeçalho
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(16);
      text("SERVICE AGREEMENT – KASH Solutions", y); y += 20;
      doc.setFontSize(10);
      text(`Tracking: ${trackingCode}`, y); y += 20;

      // EN — Parties
      doc.setFontSize(11);
      writeBlock(`CLIENT: ${company.companyName || "[CLIENT NAME]"}, identified by the information provided in the electronic form, hereinafter referred to as CLIENT.`);
      writeBlock(`CONTRACTOR: ${CONFIG.brand.legal}, a limited liability company registered in the State of Florida, United States of America, hereinafter referred to as KASH CORPORATE.`);

      // EN — Clauses
      const EN = [
        { t: "SECTION 1 – PURPOSE", c: "This Agreement covers the registration of a limited liability company (LLC) in Florida, followed by the application with the IRS for issuance of the Employer Identification Number (EIN), upon approval of the company formation." },
        { t: "SECTION 2 – REGISTERED AGENT AND ADDRESS", c: "KASH CORPORATE will provide: (a) a virtual business address in Florida for twelve (12) months; (b) a registered agent in Florida for twelve (12) months. After this period, services may be renewed with additional fees." },
        { t: "SECTION 3 – INFORMATION RESPONSIBILITY", c: "All information provided by CLIENT is of his/her sole responsibility, including legal and civil liability for inaccuracies or false statements." },
        { t: "SECTION 4 – LIMITATIONS", c: "This Agreement does not include: licenses/permits, tax filings, bookkeeping, or banking services." },
        { t: "SECTION 5 – COMPENSATION", c: "CLIENT shall pay KASH CORPORATE the amount of US$ 1,360.00, in one single installment, at the time of hiring, through the official payment methods available on KASH CORPORATE’s website." },
        { t: "SECTION 6 – TERMINATION", c: "KASH CORPORATE's obligations end after issuance of the EIN and delivery of digital documents to CLIENT." },
        { t: "SECTION 7 – TERM", c: "This Agreement is effective on the signing date and remains valid until completion of services described herein." },
        { t: "SECTION 8 – VALIDITY CONDITION", c: "This Agreement only becomes valid after full payment as per Section 5." },
        { t: "SECTION 9 – CASE TRACKING", c: "After payment, CLIENT will receive a unique Tracking Number to monitor the process progress via KASH CORPORATE’s platform." },
        { t: "SECTION 10 – PUBLIC AGENCIES", c: "Approval of company formation and EIN issuance depends exclusively on the respective government agencies (State of Florida and IRS). KASH CORPORATE does not guarantee timelines or approvals." },
        { t: "SECTION 11 – JURISDICTION", c: "For disputes, the forum elected is Rio de Janeiro, Brazil, with optional jurisdiction in Orlando, Florida, USA, at CLIENT’s discretion." },
      ];
      y += 6;
      EN.forEach(({ t, c }) => { newSection(t); writeBlock(c, { size: 11, gap: 14 }); y += 4; });

      // Separador bilíngue
      y += 10;
      if (y > pageH - M.b) { doc.addPage(); y = M.t; }
      doc.setFontSize(12);
      text("— Portuguese Version Below —", y, { align: "left" }); y += 18;

      // PT — Partes
      writeBlock(`CONTRATANTE: ${company.companyName || "[NOME DO CLIENTE]"}, identificado(a) pelas informações fornecidas no formulário eletrônico, doravante denominado(a) CLIENTE.`);
      writeBlock(`CONTRATADA: ${CONFIG.brand.legal}, sociedade de responsabilidade limitada, registrada no Estado da Flórida, Estados Unidos da América, doravante denominada KASH CORPORATE.`);

      // PT — Cláusulas
      const PT = [
        { t: "CLÁUSULA 1ª – OBJETO", c: "O presente contrato tem por objeto o registro de empresa (LLC) no Estado da Flórida, seguido da aplicação junto ao IRS para emissão do EIN, após a aprovação da constituição da empresa." },
        { t: "CLÁUSULA 2ª – AGENTE REGISTRADO E ENDEREÇO", c: "A KASH CORPORATE fornecerá: (a) endereço comercial virtual por 12 (doze) meses; (b) agente registrado na Flórida por 12 (doze) meses. Após esse período, os serviços poderão ser renovados mediante cobrança." },
        { t: "CLÁUSULA 3ª – RESPONSABILIDADE DAS INFORMAÇÕES", c: "Todas as informações prestadas pelo CLIENTE são de sua exclusiva responsabilidade, incluindo responsabilidade civil e criminal por eventuais incorreções." },
        { t: "CLÁUSULA 4ª – LIMITAÇÕES", c: "Não estão incluídos: licenças/alvarás, serviços contábeis/fiscais ou serviços bancários." },
        { t: "CLÁUSULA 5ª – REMUNERAÇÃO", c: "O CLIENTE pagará à KASH CORPORATE o valor de US$ 1.360,00, em parcela única e imediata, por meio dos canais oficiais no site da KASH CORPORATE." },
        { t: "CLÁUSULA 6ª – ENCERRAMENTO", c: "As obrigações da KASH CORPORATE encerram-se após a emissão do EIN e a entrega dos documentos digitais ao CLIENTE." },
        { t: "CLÁUSULA 7ª – VIGÊNCIA", c: "Este contrato entra em vigor na data da assinatura e permanece válido até a conclusão dos serviços aqui descritos." },
        { t: "CLÁUSULA 8ª – CONDIÇÃO DE VALIDADE", c: "Este contrato somente terá validade após o pagamento integral previsto na Cláusula 5ª." },
        { t: "CLÁUSULA 9ª – ACOMPANHAMENTO", c: "Após o pagamento, o CLIENTE receberá um Número de Rastreamento (Tracking Number) para acompanhar o progresso do processo na plataforma da KASH CORPORATE." },
        { t: "CLÁUSULA 10ª – ÓRGÃOS PÚBLICOS", c: "A aprovação da constituição da empresa e a emissão do EIN dependem exclusivamente dos órgãos públicos competentes (Estado da Flórida e IRS). A KASH CORPORATE não garante prazos ou aprovações." },
        { t: "CLÁUSULA 11ª – FORO", c: "Fica eleito o foro da Comarca da Capital do Estado do Rio de Janeiro – Brasil, com opção pelo foro de Orlando, Flórida – EUA, a critério do CLIENTE." },
      ];
      y += 6;
      PT.forEach(({ t, c }) => { newSection(t); writeBlock(c, { size: 11, gap: 14 }); y += 4; });

      // Local e Data (PT/EN) + 2 linhas de espaço
      const now = new Date();
      const dateEN = now.toLocaleDateString("en-US");
      const timeEN = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      y += 10;
      writeBlock(`Local e Data / Place & Date: ______________________    ${dateEN} ${timeEN}`, { size: 11, gap: 14 });
      // +2 linhas vazias (≈ 2 * 14pt)
      y += 28;

      // Blocos de assinatura dos sócios:
      // - Nome do sócio (texto)
      // - Linha de assinatura abaixo
      // - Espaço de 3 linhas entre sócios (≈ 42pt)
      const lineYGap = 16; // distância da linha de assinatura
      const nameGap = 8;   // gap após o nome
      const betweenPartners = 42; // 3 linhas (~14pt cada)

      members.forEach((m, idx) => {
        const name = m.fullName || "____________________________";
        // quebra de página se necessário
        if (y > pageH - (M.b + 80)) { doc.addPage(); y = M.t; }

        // Nome
        doc.setFontSize(11);
        text(name, y);
        y += nameGap;

        // Linha de assinatura (PT/EN)
        const lineStart = M.l;
        const lineEnd = pageW - M.r - 160;
        doc.setLineWidth(0.7);
        doc.line(lineStart, y + lineYGap, lineEnd, y + lineYGap);
        doc.setFontSize(10);
        text("Assinatura / Signature:", y + lineYGap - 2);
        y += lineYGap + betweenPartners;
      });

      // Assinatura da contratada
      if (y > pageH - (M.b + 80)) { doc.addPage(); y = M.t; }
      doc.setFontSize(11);
      text(`${CONFIG.brand.legal}`, y);
      y += nameGap;
      const lineStart2 = M.l;
      const lineEnd2 = pageW - M.r - 160;
      doc.setLineWidth(0.7);
      doc.line(lineStart2, y + lineYGap, lineEnd2, y + lineYGap);
      doc.setFontSize(10);
      text("Assinatura / Signature:", y + lineYGap - 2);
      y += lineYGap;

      // ========== Paginação no rodapé ==========
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        const footer = `Page ${i} of ${total} • ${trackingCode}`;
        doc.text(footer, centerX, pageH - 24, { align: "center" });
      }

      return URL.createObjectURL(doc.output("blob"));
    } catch (e) {
      console.warn("Failed to generate PDF", e);
      return "";
    }
  }

  async function submit() {
    const result = validate(); if (!result.ok) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
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
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    setLoading(false); setStep(3);
  }

  if (!open) return null;
  const { company, members, accept } = form;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="text-slate-100 font-semibold">Onboarding de abertura</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">Fechar</button>
        </div>

        {step === 1 && (
          <div className="p-6">
            <h4 className="text-slate-100 font-medium">1/2 — Dados iniciais da LLC</h4>

            {/* Empresa */}
            <div className="mt-4 grid gap-4">
              <div>
                <label className="block text-sm text-slate-400" htmlFor="companyName">Nome da LLC</label>
                <input id="companyName" className={classNames("w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100", errors.company.companyName && "ring-1 ring-red-400")} value={company.companyName} onChange={(e) => updateCompany("companyName", e.target.value)} />
                <FieldError msg={errors.company.companyName} />
              </div>
              <div>
                <label className="block text-sm text-slate-400" htmlFor="companyEmail">E-mail principal</label>
                <input id="companyEmail" type="email" className={classNames("w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100", errors.company.email && "ring-1 ring-red-400")} value={company.email} onChange={(e) => updateCompany("email", e.target.value)} />
                <FieldError msg={errors.company.email} />
              </div>
              <div>
                <label className="block text-sm text-slate-400" htmlFor="companyPhone">Telefone principal</label>
                <input id="companyPhone" type="tel" inputMode="tel" className={classNames("w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100", errors.company.phone && "ring-1 ring-red-400")} value={company.phone} onChange={(e) => updateCompany("phone", e.target.value)} />
                <FieldError msg={errors.company.phone} />
              </div>
              <div>
                <label className="block text-sm text-slate-400" htmlFor="companyAddr">Endereço no Brasil</label>
                <input id="companyAddr" className={classNames("w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100", errors.company.address && "ring-1 ring-red-400")} value={company.address} onChange={(e) => updateCompany("address", e.target.value)} />
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
                <span>Declaro que todas as informações prestadas são verdadeiras e assumo total responsabilidade civil e legal por elas.</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={accept.limitations} onChange={(e) => toggleAccept("limitations", e.target.checked)} />
                <span>Estou ciente de que (i) o registro da LLC <strong>não</strong> implica contratação automática de serviços mensais; (ii) licenças/permissões especiais <strong>não</strong> fazem parte deste processo; (iii) o mau uso da empresa pode resultar em medidas judiciais. Agente registrado e endereço virtual incluídos por 12 meses, com possibilidade de renovação mediante cobrança.</span>
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

            {/* Revisão bonita (sem JSON cru) */}
            <div className="mt-4 grid gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-slate-300 font-medium">Empresa</div>
                <div className="mt-2 grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-400">
                  <div><span className="text-slate-500">Nome: </span>{company.companyName || "—"}</div>
                  <div><span className="text-slate-500">E-mail: </span>{company.email || "—"}</div>
                  <div><span className="text-slate-500">Telefone: </span>{company.phone || "—"}</div>
                  <div className="md:col-span-2"><span className="text-slate-500">Endereço: </span>{company.address || "—"}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="text-slate-300 font-medium">Sócios</div>
                <div className="mt-2 space-y-3">
                  {members.map((m, i) => (
                    <div key={i} className="text-sm text-slate-400 border-t border-slate-800 pt-3 first:border-t-0 first:pt-0">
                      <div className="font-medium text-slate-300">Sócio {i + 1}: {m.fullName || "—"}</div>
                      <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                        <div><span className="text-slate-500">Passaporte: </span>{m.passport || "—"}</div>
                        <div><span className="text-slate-500">Emissor: </span>{m.issuer || "—"}</div>
                        <div><span className="text-slate-500">Validade: </span>{m.expiry || "—"}</div>
                        <div><span className="text-slate-500">% Participação: </span>{m.share || "—"}</div>
                        <div><span className="text-slate-500">Telefone: </span>{m.phone || "—"}</div>
                        <div><span className="text-slate-500">E-mail: </span>{m.email || "—"}</div>
                        <div><span className="text-slate-500">Nascimento: </span>{m.birthdate || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <CTAButton variant="ghost" onClick={() => setStep(1)}>Voltar</CTAButton>
              <CTAButton onClick={submit}>{loading ? "Processando..." : "Confirmar & gerar tracking"}</CTAButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center"><span className="text-2xl">✅</span></div>
            <h4 className="mt-4 text-slate-100 font-semibold">Pedido iniciado</h4>
            <div className="mt-2 text-emerald-400 text-xl font-bold">{tracking}</div>
            <p className="text-slate-500 text-xs mt-2">Guarde este código para consultar o status.</p>
            <div className="mt-6"><CTAButton onClick={onClose}>Concluir</CTAButton></div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== FOOTER & APP ================== */
function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
        <div className="flex items-center gap-3"><KLogo size={28} /> <span>© {new Date().getFullYear()} KASH Solutions — {CONFIG.brand.legal}</span></div>
        <div className="flex items-center gap-4">
          <a className="hover:text-slate-200" href="#servicos">Serviços</a>
          <a className="hover:text-slate-200" href="#planos">Planos</a>
          <a className="hover:text-slate-200" href="#como-funciona">Como funciona</a>
          <a className="hover:text-slate-200" href="#contato">Contato</a>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [openWizard, setOpenWizard] = useState(false);
  const onStart = useCallback(() => setOpenWizard(true), []);
  const onBuy = useCallback(() => setOpenWizard(true), []);
  const onBook = useCallback(() => {
    if (CONFIG.contact.calendly) window.location.href = CONFIG.contact.calendly; else alert("Defina CONFIG.contact.calendly para agendar.");
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><KLogo size={32} /><div className="font-semibold text-slate-100">KASH Solutions</div></div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="hover:text-emerald-400" href="#servicos">Serviços</a>
            <a className="hover:text-emerald-400" href="#planos">Planos</a>
            <a className="hover:text-emerald-400" href="#como-funciona">Como funciona</a>
          </nav>
          <div className="flex items-center gap-3"><CTAButton variant="ghost" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Contato</CTAButton><CTAButton onClick={onStart}>Começar</CTAButton></div>
        </div>
      </header>

      <Hero onStart={onStart} />
      <Services />
      <Pricing onBuy={onBuy} onBook={onBook} />
      <HowItWorks />

      <section id="contato" className="py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle title="Fale com a KASH" subtitle="Tire dúvidas sobre o enquadramento ideal para o seu caso." />
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-100 font-medium">Consulta inicial</div>
              <p className="text-slate-400 text-sm mt-1">Agende uma conversa de 30 minutos.</p>
              <div className="mt-4"><CTAButton onClick={onBook}>Agendar</CTAButton></div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-100 font-medium">WhatsApp</div>
              <p className="text-slate-400 text-sm mt-1">Atendimento comercial.</p>
              <div className="mt-2 text-emerald-400">{CONFIG.contact.whatsapp}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-100 font-medium">E-mail</div>
              <p className="text-slate-400 text-sm mt-1">Resposta em 1–2 dias úteis.</p>
              <div className="mt-2 text-emerald-400">{CONFIG.contact.email}</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FormWizard open={openWizard} onClose={() => setOpenWizard(false)} />
    </div>
  );
}

/* ===== Dev sanity tests ===== */
(function runDevTests(){
  try {
    console.assert(calcAgeFullDate('2010-01-01') < 18, 'Age: under 18 invalid');
    console.assert(calcAgeFullDate('1990-01-01') >= 18, 'Age: 18+ valid');
    console.assert(isPercentTotalValid([{share:50},{share:50}]) === true, 'Percent total 100 OK');
    console.assert(isPercentTotalValid([{share:60},{share:50}]) === false, 'Percent total not 100 fails');
  } catch(e) { console.warn('Dev tests error', e); }
})();
