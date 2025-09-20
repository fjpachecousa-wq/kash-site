import { jsPDF } from "jspdf";
import React, { useReducer, useState, useEffect } from "react";

/* ================== CONFIG ================== */
const CONFIG = {
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: { whatsapp: "", email: "contato@kashsolutions.us", calendly: "" }, // WhatsApp oculto por ora
  checkout: { stripeUrl: "" }, // futuro
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
  formspreeEndpoint: "https://formspree.io/f/xblawgpk",
};

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
              <CTAButton onClick={onStart}>Começar agora</CTAButton>
              <a href="#como-funciona" className="inline-flex"><CTAButton variant="ghost">Como funciona</CTAButton></a>
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
    { name: "Abertura LLC", price: CONFIG.prices.llc, features: ["Endereço + Agente 12 meses", "EIN", "Operating Agreement"], cta: "Contratar", disabled: false },
    { name: "KASH FLOW 30 (Mensal)", price: CONFIG.prices.flow30, features: ["Classificação contábil", "Relatórios mensais"], cta: "Assinar", disabled: true },
    { name: "KASH SCALE 5 (Mensal)", price: CONFIG.prices.scale5, features: ["Até 5 contratos", "Suporte prioritário", "W-8BEN-E (emitido no onboarding contábil)"], cta: "Assinar", disabled: true },
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

/* ================== CONTRACT MODEL (11 clauses; EN + PT) ================== */
function buildContractEN(companyName) {
  return [
    "SERVICE AGREEMENT – KASH Corporate Solutions",
    `CLIENT: ${companyName}, identified by the information provided in the electronic form, hereinafter referred to as CLIENT. CONTRACTOR: KASH CORPORATE SOLUTIONS LLC, a limited liability company registered in the State of Florida, United States of America, hereinafter referred to as KASH CORPORATE.`,
    "SECTION 1 – PURPOSE: This Agreement covers the registration of a limited liability company (LLC) in Florida, followed by the application with the IRS for issuance of the Employer Identification Number (EIN), upon approval of the company formation.",
    "SECTION 2 – REGISTERED AGENT AND ADDRESS: KASH CORPORATE will provide: (a) a virtual business address in Florida for twelve (12) months; (b) a registered agent in Florida for twelve (12) months. After this period, services may be renewed with additional fees.",
    "SECTION 3 – INFORMATION RESPONSIBILITY: All information provided by CLIENT is of his/her sole responsibility, including legal and civil liability for inaccuracies or false statements.",
    "SECTION 4 – LIMITATIONS: This Agreement does not include: licenses/permits, tax filings, bookkeeping, or banking services.",
    "SECTION 5 – COMPENSATION: CLIENT shall pay KASH CORPORATE the amount of US$ 1,360.00, in one single installment, at the time of hiring, through the official payment methods available on KASH CORPORATE’s website.",
    "SECTION 6 – TERMINATION: KASH CORPORATE's obligations end after issuance of the EIN and delivery of digital documents to CLIENT.",
    "SECTION 7 – TERM: This Agreement is effective on the signing date and remains valid until completion of services described herein.",
    "SECTION 8 – VALIDITY CONDITION: This Agreement only becomes valid after full payment as per Section 5.",
    "SECTION 9 – CASE TRACKING: After payment, CLIENT will receive a unique Tracking Number to monitor the process progress via KASH CORPORATE’s platform.",
    "SECTION 10 – PUBLIC AGENCIES: Approval of company formation and EIN issuance depends exclusively on the respective government agencies (State of Florida and IRS). KASH CORPORATE does not guarantee timelines or approvals.",
    "SECTION 11 – JURISDICTION: For disputes, the forum elected is Rio de Janeiro, Brazil, with optional jurisdiction in Orlando, Florida, USA, at CLIENT’s discretion."
  ];
}
function buildContractPT(companyName) {
  return [
    `CONTRATANTE: ${companyName}, identificado(a) pelas informações fornecidas no formulário eletrônico, doravante denominado(a) CLIENTE. CONTRATADA: KASH CORPORATE SOLUTIONS LLC, sociedade de responsabilidade limitada, registrada no Estado da Flórida, Estados Unidos da América, doravante denominada KASH CORPORATE SOLUTIONS LLC.`,
    "CLÁUSULA 1ª – OBJETO: O presente contrato tem por objeto o registro de empresa (LLC) no Estado da Flórida, seguido da aplicação junto ao IRS para emissão do EIN, após a aprovação da constituição da empresa.",
    "CLÁUSULA 2ª – AGENTE REGISTRADO E ENDEREÇO: A KASH CORPORATE fornecerá: (a) endereço comercial virtual por 12 (doze) meses; (b) agente registrado na Flórida por 12 (doze) meses. Após esse período, os serviços poderão ser renovados mediante cobrança.",
    "CLÁUSULA 3ª – RESPONSABILIDADE DAS INFORMAÇÕES: Todas as informações prestadas pelo CLIENTE são de sua exclusiva responsabilidade, incluindo responsabilidade civil e criminal por eventuais incorreções.",
    "CLÁUSULA 4ª – LIMITAÇÕES: Não estão incluídos: licenças/alvarás, serviços contábeis/fiscais ou serviços bancários.",
    "CLÁUSULA 5ª – REMUNERAÇÃO: O CLIENTE pagará à KASH CORPORATE o valor de US$ 1.360,00, em parcela única e imediata, por meio dos canais oficiais no site da KASH CORPORATE.",
    "CLÁUSULA 6ª – ENCERRAMENTO: As obrigações da KASH CORPORATE encerram-se após a emissão do EIN e a entrega dos documentos digitais ao CLIENTE.",
    "CLÁUSULA 7ª – VIGÊNCIA: Este contrato entra em vigor na data da assinatura e permanece válido até a conclusão dos serviços aqui descritos.",
    "CLÁUSULA 8ª – CONDIÇÃO DE VALIDADE: Este contrato somente terá validade após o pagamento integral previsto na Cláusula 5ª.",
    "CLÁUSULA 9ª – ACOMPANHAMENTO: Após o pagamento, o CLIENTE receberá um Número de Rastreamento (Tracking Number) para acompanhar o progresso do processo na plataforma da KASH CORPORATE.",
    "CLÁUSULA 10ª – ÓRGÃOS PÚBLICOS: A aprovação da constituição da empresa e a emissão do EIN dependem exclusivamente dos órgãos públicos competentes (Estado da Flórida e IRS). A KASH CORPORATE não garante prazos ou aprovações.",
    "CLÁUSULA 11ª – FORO: Fica eleito o foro da Comarca da Capital do Estado do Rio de Janeiro – Brasil, com opção pelo foro de Orlando, Flórida – EUA, a critério do CLIENTE."
  ];
}
/* ===== Acceptance (PT/EN) + Signatures (helpers) ===== */
function _acceptanceClausePT(fullNameList, dateISO) {
  let dt = new Date();
  if (dateISO && /^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    const [y,m,d] = dateISO.split("-").map(Number);
    const now = new Date();
    dt = new Date(y,(m||1)-1,d||1, now.getHours(), now.getMinutes(), now.getSeconds());
  } else if (dateISO) {
    const parsed = new Date(dateISO);
    if (!isNaN(parsed)) dt = parsed;
  }
  const d = dt.toLocaleDateString();
  const t = dt.toLocaleTimeString();
  return `ACEITE E DECLARAÇÃO: Declaro que LI E CONCORDO com todos os termos deste contrato em ${d} e ${t}.`;
}
function _acceptanceClauseEN(fullNameList, dateISO) {
  let dt = new Date();
  if (dateISO && /^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    const [y,m,d] = dateISO.split("-").map(Number);
    const now = new Date();
    dt = new Date(y,(m||1)-1,d||1, now.getHours(), now.getMinutes(), now.getSeconds());
  } else if (dateISO) {
    const parsed = new Date(dateISO);
    if (!isNaN(parsed)) dt = parsed;
  }
  const d = dt.toLocaleDateString();
  const t = dt.toLocaleTimeString();
  return `ACCEPTANCE AND DECLARATION: I confirm that I HAVE READ AND AGREE to all terms of this agreement on ${d} at ${t}.`;
}
function _signatureBlockPT(names) {
  if (!names || !names.length) return "";
  // linha em branco antes do primeiro nome; apenas nomes
  return "\n" + names.map((n) => `${n}`).join("\n\n");
}


function _signatureBlockEN(names) {
  if (!names || !names.length) return "";
  // blank line before the first name; names only
  return "\n" + names.map((n) => `${n}`).join("\n\n");
}




/* ================== PDF (US Letter, Times 10/9) ================== */



function generateLetterPdf({ companyName, tracking, dateISO, memberNames = [], company, members = [] }) {
  // Prefer provided objects; fallback to global state if available
  const _company = company || (typeof data!=="undefined" && data.company) || (typeof result!=="undefined" && result.company) || { companyName };
  const _members = (members && members.length)
    ? members
    : (Array.isArray(memberNames) && memberNames.length ? memberNames.map(n=>({fullName:n})) 
       : (typeof data!=="undefined" && Array.isArray(data.members) ? data.members 
          : (typeof result!=="undefined" && Array.isArray(result.members) ? result.members : [])));
  const names = _members.map(p => p.fullName || p.name).filter(Boolean);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const maxW = doc.internal.pageSize.getWidth() - marginX * 2;
  const pageH = doc.internal.pageSize.getHeight();

  // --- PAGE 1: Application Data ---
  doc.setFont("Times", "Normal");
  doc.setFontSize(12);
  let y = 60;
  const appLines = _applicationDataLines({ company: _company, members: _members, tracking, dateISO });
  const appWrapped = doc.splitTextToSize(appLines.join("\n"), maxW);
  for (const line of appWrapped) {
    if (y > pageH - 60) { doc.addPage(); y = 60; }
    doc.text(line, marginX, y);
    y += 16;
  }

  // --- EN Contract ---
  doc.addPage(); y = 60;
  const enBody = buildContractEN(companyName);
  const enText = (Array.isArray(enBody) ? enBody.join("\n") : String(enBody));
  const en = [
    `SERVICE AGREEMENT – ${companyName}`,
    "",
    enText,
    "",
    _acceptanceClauseEN(names, dateISO),
    "",
    "SIGNATURES",
    _signatureBlockEN(names)
  ].join("\n");
  const enLines = doc.splitTextToSize(en, maxW);
  for (const line of enLines) {
    if (y > pageH - 60) { doc.addPage(); y = 60; }
    doc.text(line, marginX, y);
    y += 16;
  }

  // --- PT Contract ---
  doc.addPage(); y = 60;
  const ptBody = buildContractPT(companyName);
  const ptText = (Array.isArray(ptBody) ? ptBody.join("\n") : String(ptBody));
  const pt = [
    `CONTRATO DE PRESTAÇÃO DE SERVIÇOS – ${companyName}`,
    "",
    ptText,
    "",
    _acceptanceClausePT(names, dateISO),
    "",
    "ASSINATURAS",
    _signatureBlockPT(names)
  ].join("\n");
  const ptLines = doc.splitTextToSize(pt, maxW);
  for (const line of ptLines) {
    if (y > pageH - 60) { doc.addPage(); y = 60; }
    doc.text(line, marginX, y);
    y += 16;
  }

  // Footer (local date/time + tracking + page numbers)
  const dt = _localDateFromISO(dateISO);
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.text(`${dt.toLocaleDateString()} ${dt.toLocaleTimeString()} · TN: ${tracking}`, 40, ph - 20);
    doc.text(`Page ${i} of ${pageCount}`, pw - 40, ph - 20, { align: "right" });
  }

  const fileName = `KASH_Contract_${tracking}.pdf`;
  doc.save(fileName);
  return { doc, fileName };
}



/* ================== FORM WIZARD (+ address FL logic, + Formspree, + tracking) ================== */
const initialForm = {
  company: { companyName: "", email: "", phone: "", hasFloridaAddress: false, usAddress: { line1: "", line2: "", city: "", state: "FL", zip: "" } },
  members: [
    { fullName: "", email: "", phone: "", passport: "", issuer: "", docExpiry: "", birthdate: "", percent: "" },
    { fullName: "", email: "", phone: "", passport: "", issuer: "", docExpiry: "", birthdate: "", percent: "" },
  ],
  accept: { responsibility: false, limitations: false },
};
function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_COMPANY": return { ...state, company: { ...state.company, [action.field]: action.value } };
    case "UPDATE_US_ADDRESS": return { ...state, company: { ...state.company, usAddress: { ...state.company.usAddress, [action.field]: action.value } } };
    case "UPDATE_MEMBER": return { ...state, members: state.members.map((m,i)=> i===action.index ? { ...m, [action.field]: action.value } : m) };
    case "ADD_MEMBER": return { ...state, members: [...state.members, { fullName: "", email: "", phone: "", passport: "", issuer: "", docExpiry: "", birthdate: "", percent: "" }] };
    case "REMOVE_MEMBER": return { ...state, members: state.members.filter((_,i)=> i!==action.index) };
    case "TOGGLE_ACCEPT": return { ...state, accept: { ...state.accept, [action.key]: action.value } };
    default: return state;
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
          <div className="text-red-400 text-xs">{errors.fullName || ""}</div>
        </div>
        <div>
          <input type="email" className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.email && "border-red-500")} placeholder="E-mail do sócio" value={data.email} onChange={(e) => onChange("email", e.target.value)} />
          <div className="text-red-400 text-xs">{errors.email || ""}</div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input className={classNames("w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.phone && "border-red-500")} placeholder="Telefone do sócio" value={data.phone} onChange={(e) => onChange("phone", e.target.value)} />
          <div className="text-red-400 text-xs">{errors.phone || ""}</div>
        </div>
        <div>
          <input className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.passport && "border-red-500")} placeholder="Passaporte (ou RG)" value={data.passport} onChange={(e) => onChange("passport", e.target.value)} />
          <div className="text-red-400 text-xs">{errors.passport || ""}</div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-2">
        <div>
          <input className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Órgão emissor" value={data.issuer} onChange={(e) => onChange("issuer", e.target.value)} />
        </div>
        <div>
          <input type="date" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.docExpiry && "border-red-500")} value={data.docExpiry} onChange={(e) => onChange("docExpiry", e.target.value)} />
          <div className="text-[11px] text-slate-400 mt-1">Validade do documento</div>
          <div className="text-red-400 text-xs">{errors.docExpiry || ""}</div>
        </div>
        <div>
          <input type="date" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.birthdate && "border-red-500")} value={data.birthdate} onChange={(e) => onChange("birthdate", e.target.value)} />
          <div className="text-[11px] text-slate-400 mt-1">Data de nascimento</div>
          <div className="text-red-400 text-xs">{errors.birthdate || ""}</div>
        </div>
      </div>
      <div>
        <input type="number" className={classNames("rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500", errors.percent && "border-red-500")} placeholder="% de participação" value={data.percent} onChange={(e) => onChange("percent", e.target.value)} />
        <div className="text-red-400 text-xs">{errors.percent || ""}</div>
      </div>
    </div>
  );
}

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

/* ======= Tracking Search (inline) ======= */
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
              <CTAButton onClick={() = disabled={!agreed}> {
                const url = generateLetterPdf({ companyName: result.company?.companyName, company: result.company, members: (result.members || []), tracking: result.tracking, dateISO: result.dateISO });
                if (url) { const a = document.createElement("a"); a.href = url; a.download = `KASH_Contract_${result.tracking}.pdf`; document.body.appendChild(a); a.click(); a.remove(); }
              }}>Baixar contrato (PDF)</CTAButton>
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
                <CTAButton variant="ghost" onClick={() => {
                  const raw = localStorage.getItem(e.code);
                  if (!raw) return;
                  const data = JSON.parse(raw);
                  const url = generateLetterPdf({ companyName: data.company?.companyName, company: data.company, members: (data.members || []), tracking: data.tracking, dateISO: data.dateISO });
                  if (url) { const a = document.createElement("a"); a.href = url; a.download = `KASH_Contract_${data.tracking}.pdf`; document.body.appendChild(a); a.click(); a.remove(); }
                }}>Baixar PDF</CTAButton>
                <CTAButton onClick={() => {
                  const raw = localStorage.getItem(e.code);
                  if (!raw) return;
                  const data = JSON.parse(raw);
                  alert(`Empresa: ${data.company?.companyName || "—"}\nTracking: ${data.tracking}\nData: ${data.dateISO}`);
                }}>Ver</CTAButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [selected, setSelected] = useState("");
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const refreshList = () => {
    try { const raw = localStorage.getItem("KASH_TRACKINGS"); setList(raw ? JSON.parse(raw) : []); } catch { setList([]); }
  };
  useEffect(() => { refreshList(); }, []);
  const tryAuth = () => { if (pin === "246810") setAuthed(true); else alert("PIN inválido"); };
  const addUpdate = () => {
    if (!selected) return alert("Escolha um tracking.");
    if (!status) return alert("Informe um status.");
    try {
      const raw = localStorage.getItem(selected);
      if (!raw) return alert("Tracking não encontrado.");
      const data = JSON.parse(raw);
      const now = new Date();
      const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      const upd = { ts, status, note };
      data.updates = Array.isArray(data.updates) ? [...data.updates, upd] : [upd];
      localStorage.setItem(selected, JSON.stringify(data));
      setStatus(""); setNote("");
      alert("Atualização adicionada.");
    } catch { alert("Falha ao atualizar."); }
  };

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <SectionTitle title="Painel interno (admin)" subtitle="Adicionar atualizações de status aos trackings salvos neste navegador." />
          <button className="text-xs text-emerald-400 hover:underline" onClick={() => setOpen(!open)}>{open ? "Ocultar" : "Abrir"}</button>
        </div>
        {!open ? null : (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
            {!authed ? (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-sm text-slate-300">PIN de acesso (teste)</div>
                  <input value={pin} onChange={(e)=>setPin(e.target.value)} className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700" placeholder="Digite o PIN" />
                </div>
                <CTAButton onClick={tryAuth}>Entrar</CTAButton>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-2">
                  <div>
                    <div className="text-sm text-slate-300">Tracking</div>
                    <select value={selected} onChange={(e)=>setSelected(e.target.value)} className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700">
                      <option value="">Selecione…</option>
                      {list.map((e)=> <option key={e.code} value={e.code}>{e.code} — {e.company}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Status</div>
                    <input value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700" placeholder='Ex.: "Enviado ao Estado", "EIN solicitado ao IRS"' />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Nota (opcional)</div>
                    <input value={note} onChange={(e)=>setNote(e.target.value)} className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700" placeholder="Detalhe adicional" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <CTAButton onClick={addUpdate}>Adicionar atualização</CTAButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ======= Form Wizard ======= */
const initialErrors = { company: {}, members: [], accept: {} };
function FormWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");
  const [agreed, setAgreed] = useState(true); // "Li e concordo"

  // Pagamento confirmado (marcado pela success.html via localStorage)
  const paid = (typeof window !== "undefined" && localStorage.getItem("kash_paid") === "1");
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [errors, setErrors] = useState(initialErrors);

  // Address logic
  useEffect(() => {
    if (form.company.hasFloridaAddress && form.accept.limitations) {
      dispatch({ type: "TOGGLE_ACCEPT", key: "limitations", value: false });
    }
  }, [form.company.hasFloridaAddress]);

  const updateCompany = (field, value) => dispatch({ type: "UPDATE_COMPANY", field, value });
  const updateUS = (field, value) => dispatch({ type: "UPDATE_US_ADDRESS", field, value });
  const updateMember = (index, field, value) => dispatch({ type: "UPDATE_MEMBER", index, field, value });
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
      if (!m.passport || m.passport.length < 5) errs.members[i].passport = "Documento obrigatório.";
      if (!m.docExpiry) errs.members[i].docExpiry = "Validade obrigatória.";
      if (!m.birthdate) errs.members[i].birthdate = "Nascimento obrigatório.";
      if (!m.percent || Number(m.percent) <= 0) errs.members[i].percent = "% obrigatório.";
      if (m.birthdate && calcAgeFullDate(m.birthdate) < 18) errs.members[i].birthdate = "Precisa ter 18+.";
    }
    if (!isPercentTotalValid(members)) alert("A soma dos percentuais deve ser 100%.");
    if (!accept.responsibility) errs.accept.base = "Aceite a declaração de responsabilidade.";
    if (!company.hasFloridaAddress && !accept.limitations) errs.accept.base = "Aceite as limitações (endereço/agente 12 meses).";
    setErrors(errs);
    const companyOk = Object.keys(errs.company).length === 0;
    const membersOk = errs.members.every((m) => Object.keys(m).length === 0);
    const acceptOk = accept.responsibility && (company.hasFloridaAddress || accept.limitations);
    return companyOk && membersOk && acceptOk && isPercentTotalValid(members);
  }

  async function handleSubmit() {
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);
    const code = "KASH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setTracking(code);
    const dateISO = todayISO();

    const payload = {
      tracking: code,
      dateISO,
      agreed: true,
      company: form.company,
      members: form.members,
      accepts: form.accept,
      contractEN: buildContractEN(form.company.companyName).join("\n"),
      contractPT: buildContractPT(form.company.companyName).join("\n"),
      updates: [{ ts: dateISO, status: "Formulário recebido", note: "Dados enviados e contrato disponível." }],
      source: "kashsolutions.us",
    };

    try {
      // Salva localmente
      localStorage.setItem(code, JSON.stringify(payload));

      // index de trackings (últimos 50)
      try {
        const idxRaw = localStorage.getItem("KASH_TRACKINGS");
        const idx = idxRaw ? JSON.parse(idxRaw) : [];
        const entry = { code, dateISO, company: form.company.companyName };
        const filtered = idx.filter(e => e.code !== code);
        filtered.unshift(entry);
        localStorage.setItem("KASH_TRACKINGS", JSON.stringify(filtered.slice(0,50)));
      } catch {}

      // Envia ao Formspree (e-mail / painel)
      await fetch(CONFIG.formspreeEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}

    setLoading(false);
    setStep(3);
  }

  const { company, members, accept } = form;
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

            {/* Step 1 */}
            {step === 1 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">1/2 — Dados iniciais da LLC</h4>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm text-slate-400">Nome da LLC</label>
                    <input className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Ex.: SUNSHINE MEDIA LLC" value={company.companyName} onChange={(e) => updateCompany("companyName", e.target.value)} />
                    <div className="text-red-400 text-xs">{errors.company.companyName || ""}</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400">E-mail principal</label>
                      <input type="email" className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="email@exemplo.com" value={company.email} onChange={(e) => updateCompany("email", e.target.value)} />
                      <div className="text-red-400 text-xs">{errors.company.email || ""}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400">Telefone principal</label>
                      <input className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="+1 (305) 123-4567" value={company.phone} onChange={(e) => updateCompany("phone", e.target.value)} />
                      <div className="text-red-400 text-xs">{errors.company.phone || ""}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input type="checkbox" checked={company.hasFloridaAddress} onChange={(e) => updateCompany("hasFloridaAddress", e.target.checked)} />
                      <span>Possui endereço físico na Flórida?</span>
                    </label>
                  </div>
                  {company.hasFloridaAddress ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-slate-300 font-medium mb-2">Endereço da empresa (USA)</div>
                      <input className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Address Line 1" value={company.usAddress.line1} onChange={(e) => updateUS("line1", e.target.value)} />
                      <div className="grid md:grid-cols-3 gap-2 mt-2">
                        <input className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="City" value={company.usAddress.city} onChange={(e) => updateUS("city", e.target.value)} />
                        <select className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" value={company.usAddress.state} onChange={(e) => updateUS("state", e.target.value)}>
                          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="ZIP Code" value={company.usAddress.zip} onChange={(e) => updateUS("zip", e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                      Não possui endereço na Flórida — usaremos o <b>endereço e agente da KASH por 12 meses</b> incluídos no pacote.
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
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <CTAButton onClick={() => { if (validate()) setStep(2); }}>Continuar</CTAButton>
                </div>
              </div>
            )}

            {/* Step 2 — Revisão */}
            {step === 2 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">2/2 — Revisão</h4>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-slate-300 font-medium">Empresa</div>
                  <div className="mt-2 text-sm text-slate-400">
                    <div><span className="text-slate-500">Nome: </span>{company.companyName || "—"}</div>
                    <div className="grid md:grid-cols-2 gap-x-6">
                      <div><span className="text-slate-500">E-mail: </span>{company.email || "—"}</div>
                      <div><span className="text-slate-500">Telefone: </span>{company.phone || "—"}</div>
                    </div>
                    {company.hasFloridaAddress ? (
                      <div className="mt-1">
                        <div className="text-slate-400">Endereço informado:</div>
                        <div>{company.usAddress.line1}</div>
                        <div>{company.usAddress.city}, {company.usAddress.state} {company.usAddress.zip}</div>
                      </div>
                    ) : (
                      <div className="mt-1">Será utilizado o endereço e agente da KASH por 12 meses.</div>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 mt-4">
                  <div className="text-slate-300 font-medium">Sócios</div>
                  <div className="mt-2 space-y-3 text-sm text-slate-400">
                    {members.map((m, i) => (
                      <div key={i}>
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

            {/* Step 3 — Tracking + Contrato (EN + PT na mesma tela) */}
            {step === 3 && (
              <div className="p-6">
                <div className="text-center">
                  <h4 className="text-slate-100 font-medium">Dados enviados com sucesso</h4>
                  <p className="text-slate-400 mt-2">Seu código de acompanhamento (tracking):</p>
                  <div className="mt-2 text-emerald-400 text-xl font-bold">{tracking}</div>
                </div>

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-300 font-medium">Contrato (EN + PT juntos)</div>
                    <button className="text-xs text-emerald-400 hover:underline" onClick={() => {
                      const url = generateLetterPdf({ companyName: company.companyName, tracking, dateISO, company, members: (members || form?.members || []) });
                      if (url) { const a = document.createElement("a"); a.href = url; a.download = `KASH_Contract_${tracking}.pdf`; document.body.appendChild(a); a.click(); a.remove(); }
                    }}>Baixar PDF</button>
                  </div>

                  {/* EN + PT in the same view */}
                  <div className="mt-4 text-[13px] leading-6 text-slate-200 space-y-6 max-h-[55vh] overflow-auto pr-2">
                    <div>
                      <div className="font-semibold text-slate-100">SERVICE AGREEMENT – KASH Corporate Solutions</div>
                      <div className="mt-2 space-y-2 text-slate-300">
                        {buildContractEN(company.companyName).slice(1).map((p, idx) => <p key={idx}>{p}</p>)}
                      </div>
                    </div>
                    <div className="text-slate-400">— Portuguese Version Below —</div>
                    <div>
                      <div className="font-semibold text-slate-100">CONTRATO — KASH Corporate Solutions</div>
                      <div className="mt-2 space-y-2 text-slate-300">
                        {buildContractPT(company.companyName).map((p, idx) => <p key={idx}>{p}</p>)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
                      Tracking: {tracking} · Date: {dateISO}
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span>Li e concordo com os termos acima.</span>
                  </label>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <CTAButton onClick={onClose} disabled={!agreed || !paid}>Concluir</CTAButton>
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


/* ===== FORMSPREE INFLATOR: expand flat keys to nested/arrays ===== */
function _inflateFormspree(flat){
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


/* ===== ULTRA FLAT HARVESTER (Formspree & generic) ===== */
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
