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
      <div className="max-w-6xl mx_auto px-4">
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
    { name: "KASH SCALE 5 (Mensal)", price: CONFIG.prices.scale5, features: ["Até 5 contratos", "Suporte prioritário", "W‑8BEN‑E (emitido no onboarding contábil)"], cta: "Assinar", disabled: true },
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

/* ================== CONTRACT MODEL & PDF (unchanged from v13) ================== */
function buildContractEN(companyName) { return [
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
]; }
function buildContractPT(companyName) { return [
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
]; }

function generateLetterPdf({ companyName, tracking, dateISO }) {
  try {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) return "";
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const M = { l: 72, r: 72, t: 72, b: 72 };
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const width = pageW - M.l - M.r;
    const TITLE_SIZE = 10, BODY_SIZE = 9, FOOT_SIZE = 9;
    const LINE_HEIGHT = 1.28, PARA_SPACING = 6;
    let y = M.t;
    doc.setFont("times","bold"); doc.setFontSize(TITLE_SIZE); doc.text("SERVICE AGREEMENT – KASH Corporate Solutions", M.l, y); y += 16;
    doc.setFont("times",""); doc.setFontSize(BODY_SIZE);
    const en = buildContractEN(companyName);
    en.slice(1).forEach((p)=>{ doc.splitTextToSize(p, width).forEach((line)=>{ if (y > pageH - M.b - 60) return; doc.text(line, M.l, y, { lineHeightFactor: LINE_HEIGHT }); y += 12; }); y += PARA_SPACING; });
    if (y < pageH - M.b - 60) { doc.setFont("times",""); doc.setFontSize(BODY_SIZE); doc.text("— Portuguese Version Below —", M.l, y); y += 14; }
    const pt = buildContractPT(companyName);
    pt.forEach((p)=>{ doc.splitTextToSize(p, width).forEach((line)=>{ if (y > pageH - M.b - 60) return; doc.text(line, M.l, y, { lineHeightFactor: LINE_HEIGHT }); y += 12; }); y += PARA_SPACING; });
    doc.setFont("times",""); doc.setFontSize(FOOT_SIZE);
    const footerY = pageH - M.b + 4;
    doc.text(`Tracking: ${tracking}`, M.l, footerY - 18);
    doc.text(`Date: ${dateISO}`, M.l, footerY - 6);
    const pageStr = "Page 1 of 1"; const pageStrW = doc.getTextWidth(pageStr); doc.text(pageStr, pageW - M.r - pageStrW, footerY - 6);
    return doc.output("bloburl");
  } catch { return ""; }
}

/* ======= (Form, Tracking Search, Footer, App) — same as v13 ======= */
// ... For brevity here, assume the rest of v13 (FormWizard, TrackingSearch, Footer, App) is identical.
