// src/App.jsx – KASH Solutions (SIMULADOR + CONTEÚDO INFORMATIVO)
// Mantém layout/cores/estética e implementa:
// - Botão "Começar agora" => abre modal de e-mail (contato@kashsolutions.us)
// - Botão "Como funciona" => navega para a seção #como-funciona
// - Botão "Contratar" (Plano Abertura LLC) => abre o mesmo modal

import React, { useMemo, useState } from "react";
import ContactEmailModal from "./components/ContactEmailModal.jsx";

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
      {subtitle ? <p className="text-slate-400 text-sm mt-1">{subtitle}</p> : null}
    </div>
  );
}

function Card({ className = "", children }) {
  return (
    <div className={classNames("rounded-2xl border border-slate-800 bg-slate-900 p-5", className)}>
      {children}
    </div>
  );
}

/* ========================= SIMULATOR ========================= */
function DemoCalculator() {
  const [monthly, setMonthly] = useState(4000);

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
function Header() {
  return (
    <header className="pt-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <KLogo size={42} />
          <div>
            <div className="text-2xl md:text-3xl font-semibold text-slate-100">KASH Solutions</div>
            <div className="text-slate-400 text-sm">KASH CORPORATE SOLUTIONS LLC · Florida LLC</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero({ onOpenContact }) {
  return (
    <section className="pt-10 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mt-8 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-100 leading-tight">
              Abra sua LLC na Flórida e elimine
              <br className="hidden md:block" />
              a retenção de 30%.
            </h1>
            <p className="mt-4 text-slate-300">
              Abertura da empresa, EIN, endereço e agente por 12 meses.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenContact("Começar agora")}
                className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-none rounded-xl"
              >
                Começar agora
              </button>

              <a
                href="#como-funciona"
                className="btn btn-outline border-slate-600 text-slate-100 hover:bg-slate-900 rounded-xl"
              >
                Como funciona
              </a>
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

function IncludedServices() {
  return (
    <section className="py-14 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Serviços incluídos" subtitle="Pacote completo para começar certo." />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card>
            <div className="text-slate-100 font-medium">Abertura LLC Partnership</div>
            <div className="text-slate-400 text-sm mt-1">Registro oficial na Flórida (Sunbiz).</div>
          </Card>
          <Card>
            <div className="text-slate-100 font-medium">EIN (IRS)</div>
            <div className="text-slate-400 text-sm mt-1">Obtenção do Employer Identification Number.</div>
          </Card>
          <Card>
            <div className="text-slate-100 font-medium">Operating Agreement</div>
            <div className="text-slate-400 text-sm mt-1">Documento societário digital.</div>
          </Card>
          <Card className="md:col-span-1">
            <div className="text-slate-100 font-medium">Endereço + Agente (12 meses)</div>
            <div className="text-slate-400 text-sm mt-1">Inclusos no pacote de abertura.</div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onOpenContact }) {
  return (
    <section className="py-14 border-t border-slate-800" aria-label="Planos e preços">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Planos e preços" subtitle="Transparência desde o início." />

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card className="relative">
            <div className="text-slate-200 font-semibold">Abertura LLC</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-400">US$ 1,360</div>

            <ul className="mt-4 space-y-2 text-slate-300 text-sm">
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Endereço + Agente 12 meses</li>
              <li className="flex gap-2"><span className="text-emerald-400">•</span> EIN</li>
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Operating Agreement</li>
            </ul>

            <button
              type="button"
              onClick={() => onOpenContact("Plano: Abertura LLC - US$ 1,360")}
              className="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-none rounded-xl mt-6"
            >
              Contratar
            </button>
          </Card>

          <Card>
            <div className="text-slate-200 font-semibold">KASH FLOW 30 (Mensal)</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-400">US$ 300</div>
            <ul className="mt-4 space-y-2 text-slate-300 text-sm">
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Classificação contábil</li>
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Relatórios mensais</li>
            </ul>
            <div className="mt-6 text-slate-500 text-sm">Em breve</div>
          </Card>

          <Card>
            <div className="text-slate-200 font-semibold">KASH SCALE 5 (Mensal)</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-400">US$ 1,000</div>
            <ul className="mt-4 space-y-2 text-slate-300 text-sm">
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Até 5 contratos</li>
              <li className="flex gap-2"><span className="text-emerald-400">•</span> Suporte prioritário</li>
            </ul>
            <div className="mt-6 text-slate-500 text-sm">Em breve</div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-14 border-t border-slate-800" aria-label="Como funciona">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Como funciona" subtitle="Fluxo enxuto e auditável, do onboarding ao registro concluído." />

        <div className="mt-6 grid md:grid-cols-5 gap-4">
          <Card>
            <div className="text-emerald-400 font-semibold">01</div>
            <div className="mt-2 text-slate-100 font-medium">Consulta</div>
            <div className="mt-1 text-slate-400 text-sm">Alinhamento de expectativas (opcional).</div>
          </Card>
          <Card>
            <div className="text-emerald-400 font-semibold">02</div>
            <div className="mt-2 text-slate-100 font-medium">Contrato e pagamento</div>
            <div className="mt-1 text-slate-400 text-sm">Assinatura e checkout acontecem depois da conferência.</div>
          </Card>
          <Card>
            <div className="text-emerald-400 font-semibold">03</div>
            <div className="mt-2 text-slate-100 font-medium">Formulário de abertura</div>
            <div className="mt-1 text-slate-400 text-sm">Dados da empresa, sócios, KYC/AML.</div>
          </Card>
          <Card>
            <div className="text-emerald-400 font-semibold">04</div>
            <div className="mt-2 text-slate-100 font-medium">Envio</div>
            <div className="mt-1 text-slate-400 text-sm">Você recebe o tracking do processo.</div>
          </Card>
          <Card>
            <div className="text-emerald-400 font-semibold">05</div>
            <div className="mt-2 text-slate-100 font-medium">Acompanhamento</div>
            <div className="mt-1 text-slate-400 text-sm">Atualizações por e-mail.</div>
          </Card>
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
          <div className="text-slate-500 text-xs">© {year} KASH Solutions · KASH CORPORATE SOLUTIONS LLC</div>
          <div className="text-slate-500 text-xs">Contato: contato@kashsolutions.us</div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactContext, setContactContext] = useState("");

  const openContact = (label = "") => {
    setContactContext(label);
    setContactOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-40 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <main className="relative">
        <Header />
        <Hero onOpenContact={openContact} />
        <IncludedServices />
        <Pricing onOpenContact={openContact} />
        <HowItWorks />
        <Footer />
      </main>

      <ContactEmailModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        contextLabel={contactContext}
      />
    </div>
  );
}
