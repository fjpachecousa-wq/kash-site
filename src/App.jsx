import React, { useState } from "react";

/* ================== CONFIG ================== */
const CONFIG = {
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: { whatsapp: "+1 (305) 000-0000", email: "contato@kashsolutions.us", calendly: "" },
  checkout: { stripeUrl: "" }, // futuro
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
  formspreeEndpoint: "https://formspree.io/f/xblawgpk",
};

function classNames(...cls) { return cls.filter(Boolean).join(" "); }

function CTAButton({ children, variant = "primary", onClick, type = "button", disabled = false }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === "primary"
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

/* ================== PREÇOS ================== */
function Pricing({ onStart }) {
  const plans = [
    { name: "Abertura LLC", price: CONFIG.prices.llc, features: ["Endereço + Agente 12 meses", "EIN", "Operating Agreement", "W-8BEN-E"], cta: "Contratar", disabled: false },
    { name: "KASH FLOW 30 (Mensal)", price: CONFIG.prices.flow30, features: ["Classificação contábil", "Relatórios mensais"], cta: "Assinar", disabled: true },
    { name: "KASH SCALE 5 (Mensal)", price: CONFIG.prices.scale5, features: ["Até 5 contratos", "Suporte prioritário"], cta: "Assinar", disabled: true },
  ];
  return (
    <section className="py-14 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-2xl text-slate-100 font-semibold">Planos e preços</h3>
        <p className="text-slate-400 text-sm mt-1">Transparência desde o início.</p>
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

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className=\"min-h-screen bg-slate-950 text-slate-200\">
      <Pricing onStart={() => setOpen(true)} />
    </div>
  );
}
