// src/App.jsx – KASH Solutions (SIMULADOR ONLY)
// Mantém layout/cores/estética geral e remove formulário, checkout e integrações.

import React, { useMemo, useState } from "react";

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
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

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-2xl text-slate-100 font-semibold">{title}</h3>
      {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

/* ========================= SIMULATOR ========================= */
function DemoCalculator() {
  const [monthly, setMonthly] = useState(4000);

  // Modelo simples e transparente (estimativo):
  // - Receita anual
  // - Retenção 30% (cenário comum para não-residentes sem estrutura)
  // - Economia potencial ao estruturar via LLC (usando o preço do pacote como referência)
  const yearly = useMemo(() => monthly * 12, [monthly]);
  const withheld = useMemo(() => yearly * 0.3, [yearly]);
  const packageCost = 1360;
  const saved = useMemo(() => Math.max(0, withheld - packageCost), [withheld]);

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
          aria-label="Receita mensal"
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
          <div className="text-xs text-slate-400">Retenção 30%</div>
          <div className="text-lg text-slate-100">US$ {withheld.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">Economia potencial</div>
          <div className="text-lg text-emerald-400">US$ {saved.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 leading-relaxed">
        Observação: este simulador é apenas uma estimativa educacional. A economia real depende do seu perfil, fonte de renda,
        tratados, obrigações fiscais e conformidade.
      </div>
    </div>
  );
}

/* ========================= PAGE ========================= */
function Hero() {
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
              Simule a retenção de 30% e a economia potencial.
            </h2>
            <p className="mt-4 text-slate-300">
              Ajuste a receita mensal para estimar a retenção anual e a diferença potencial após estruturar corretamente.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-slate-200 font-medium">Sem formulário, sem checkout</div>
              <div className="text-slate-400 text-sm mt-1">
                Esta página foi simplificada para manter apenas o simulador (layout preservado).
              </div>
            </div>
          </div>

          <div id="simulador">
            <DemoCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <KLogo size={34} />
            <div>
              <div className="text-slate-200 font-medium">KASH Solutions</div>
              <div className="text-slate-500 text-xs">© {year} · All rights reserved</div>
            </div>
          </div>

          <div className="text-slate-500 text-xs leading-relaxed max-w-xl">
            Disclaimer: conteúdo informativo. Não constitui aconselhamento legal ou tributário. Procure orientação profissional
            para o seu caso.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <main className="relative">
        <Hero />

        <section className="py-14 border-t border-slate-800" aria-label="Notas do simulador">
          <div className="max-w-6xl mx-auto px-4">
            <SectionTitle
              title="Como ler o resultado"
              subtitle="Interpretação rápida do simulador (sem coleta de dados)."
            />
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-slate-200 font-medium">Receita/ano</div>
                <div className="text-slate-400 text-sm mt-1">Receita mensal × 12.</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-slate-200 font-medium">Retenção 30%</div>
                <div className="text-slate-400 text-sm mt-1">Cenário típico quando há pagamento de fonte americana sem estrutura.</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="text-slate-200 font-medium">Economia potencial</div>
                <div className="text-slate-400 text-sm mt-1">Retenção estimada menos custo de abertura (referência).</div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
