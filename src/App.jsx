import React, { useCallback, useMemo, useReducer, useState } from "react";

const CONFIG = {
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: { whatsapp: "+1 (305) 000-0000", email: "hello@kash.solutions", calendly: "" },
  checkout: { stripeUrl: "" },
  brand: { legal: "KASH CORPORATE SOLUTION", trade: "KA$H Solutions" },
  endpoints: { formspree: "https://formspree.io/f/xblawgpk" },
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;

function classNames(...cls) { return cls.filter(Boolean).join(" "); }
function calcAgeFullDate(birthdateStr) {
  const dob = new Date(birthdateStr); if (Number.isNaN(dob.getTime())) return -1;
  const t = new Date(); let age = t.getFullYear() - dob.getFullYear();
  const m = t.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--;
  return age;
}
function isPercentTotalValid(members) { const total = members.reduce((s, m) => s + (Number(m.share) || 0), 0); return Math.abs(total - 100) <= 0.01; }
function genProtocol(prefix = "KASH") {
  const d = new Date(); const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0");
  const rand = Math.random().toString(36).substring(2,6).toUpperCase(); return `${prefix}-${y}${m}${day}-${rand}`;
}

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
function CTAButton({ children, onClick, variant = "primary", type = "button", disabled = false }) {
  const base = "px-5 py-3 rounded-2xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = variant === "primary"
    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 focus:ring-emerald-300"
    : variant === "ghost"
    ? "bg-transparent ring-1 ring-slate-700 hover:bg-slate-800 text-slate-200"
    : "bg-slate-200 hover:bg-white text-slate-900";
  return <button type={type} className={classNames(base, styles)} onClick={onClick} disabled={disabled}>{children}</button>;
}

/* ---- Seções principais ---- */
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
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">KA$H Solutions</h1>
                <p className="text-slate-400 text-sm">{CONFIG.brand.legal} · Florida LLC</p>
              </div>
            </div>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">Registro e gestão de <span className="text-emerald-400 font-semibold">LLC na Flórida</span> para criadores brasileiros que monetizam nos EUA.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton onClick={onStart}>Começar agora</CTAButton>
              <a href="/app/" className="inline-flex"><CTAButton>Website e Simulador</CTAButton></a>
              <a href="#como-funciona" className="inline-flex"><CTAButton variant="ghost">Como funciona</CTAButton></a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Agente registrado (até 12 meses, se necessário)*</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Endereço físico (até 12 meses, se necessário)*</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Abertura + Operação</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
        <div className="flex items-center gap-3"><KLogo size={28} /> <span>© {new Date().getFullYear()} {CONFIG.brand.trade} — {CONFIG.brand.legal}</span></div>
        <div className="flex items-center gap-4">
          <a className="hover:text-slate-200" href="#servicos">Serviços</a>
          <a className="hover:text-slate-200" href="#planos">Planos</a>
          <a className="hover:text-slate-200" href="#como-funciona">Como funciona</a>
          <a className="hover:text-slate-200" href="/app/">Website e Simulador</a>
          <a className="hover:text-slate-200" href="#contato">Contato</a>
        </div>
      </div>
    </footer>
  );
}

/* ---- Página principal ---- */
export default function KashWebsite() {
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
          <div className="flex items-center gap-3"><KLogo size={32} /><div className="font-semibold text-slate-100">KA$H Solutions</div></div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="hover:text-emerald-400" href="#servicos">Serviços</a>
            <a className="hover:text-emerald-400" href="#planos">Planos</a>
            <a className="hover:text-emerald-400" href="#como-funciona">Como funciona</a>
            <a className="hover:text-emerald-400" href="/app/">Website e Simulador</a>
          </nav>
          <div className="flex items-center gap-3">
            <CTAButton variant="ghost" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Contato</CTAButton>
            <CTAButton onClick={onStart}>Começar</CTAButton>
          </div>
        </div>
      </header>

      <Hero onStart={onStart} />
      {/* ... demais seções (Services, Pricing, FormWizard etc.) já ficam iguais à versão anterior com validações visuais e integração Formspree */}
      <Footer />
    </div>
  );
}
