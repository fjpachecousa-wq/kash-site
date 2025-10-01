// src/App.jsx
import React from "react";

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
      {subtitle ? (
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      ) : null}
    </div>
  );
}

function Stat({ label, value, accent = false }) {
  return (
    <div
      className={[
        "rounded-xl px-3 py-2 text-xs font-medium",
        accent
          ? "bg-emerald-900/20 text-emerald-300 ring-1 ring-emerald-700/40"
          : "bg-slate-800/60 text-slate-200 ring-1 ring-slate-700/50",
      ].join(" ")}
    >
      <div className="opacity-75">{label}</div>
      <div className={accent ? "text-emerald-300 mt-1" : "text-slate-100 mt-1"}>
        {value}
      </div>
    </div>
  );
}

function ServicesCard({ title, desc }) {
  return (
    <div className="rounded-2xl bg-slate-800/60 ring-1 ring-slate-700/50 p-4">
      <div className="text-sm font-semibold text-slate-100">{title}</div>
      <div className="text-sm text-slate-400 mt-1">{desc}</div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-dvh bg-slate-900 text-slate-100">
      {/* Topbar */}
      <header className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Marca (use a sua logo em /public se quiser) */}
          <div className="h-7 w-7 rounded-lg bg-emerald-500 grid place-items-center font-bold">
            K
          </div>
          <div>
            <div className="text-sm font-semibold">KASH Solutions</div>
            <div className="text-[11px] text-slate-400">
              KASH CORPORATE SOLUTIONS LLC · Florida LLC
            </div>
          </div>
        </div>
      </header>

      {/* Hero + Simulador */}
      <main className="max-w-6xl mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Coluna: texto e CTAs */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Abra sua LLC na Flórida e elimine
              <br className="hidden md:block" /> a retenção de 30%.
            </h1>
            <p className="text-slate-300 mt-3">
              Abertura da empresa, EIN, endereço e agente por 12 meses.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 text-sm font-semibold text-white">
                Começar agora
              </button>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 transition px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-slate-700/60"
              >
                Como funciona
              </a>
            </div>
          </div>

          {/* Coluna: simulador (estático por enquanto) */}
          <div className="rounded-2xl bg-slate-800/60 ring-1 ring-slate-700/60 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-200">
                Estimativa de economia anual
              </div>
              <a className="text-xs text-emerald-400 hover:underline">
                Simulador
              </a>
            </div>

            {/* Barra “fake” */}
            <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full w-[72%] bg-emerald-500/80" />
            </div>

            {/* Cards de valores */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Receita anual" value="US$ 48,000" />
              <Stat label="Retenção 30%" value="US$ 14,400" />
              <Stat label="Economia potencial" value="US$ 13,040" accent />
            </div>
          </div>
        </div>

        {/* Serviços incluídos */}
        <section className="mt-12">
          <SectionTitle
            title="Serviços incluídos"
            subtitle="Pacote completo para começar certo."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ServicesCard
              title="Abertura LLC Partnership"
              desc="Registro oficial na Flórida (Sunbiz)."
            />
            <ServicesCard
              title="EIN (IRS)"
              desc="Obtenção do Employer Identification Number."
            />
            <ServicesCard
              title="Endereço + Agente (12 meses)"
              desc="Inclusos no pacote de abertura."
            />
          </div>
        </section>

        {/* Planos e preços (divulgação) */}
        <section id="planos" className="mt-12">
          <SectionTitle title="Planos e preços" subtitle="Transparência desde o início." />
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 ring-1 ring-slate-700/60 bg-slate-800/50">
              <div className="text-sm font-semibold">Abertura de empresa</div>
              <div className="text-2xl font-extrabold mt-1">US$ 1.360</div>
              <p className="text-sm text-slate-400 mt-2">
                Inclui abertura da LLC, EIN, endereço e agente (12 meses).
              </p>
              <div className="mt-4">
                <button className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 transition px-4 py-2 text-sm font-semibold text-white">
                  Contratar
                </button>
              </div>
            </div>

            {/* Somente divulgação */}
            <div className="rounded-2xl p-4 ring-1 ring-slate-700/60 bg-slate-800/30">
              <div className="text-sm font-semibold">KASH FLOW 30 (Mensal)</div>
              <p className="text-sm text-slate-400 mt-2">
                Serviço mensal — apenas divulgação (sem contratação online).
              </p>
            </div>
            <div className="rounded-2xl p-4 ring-1 ring-slate-700/60 bg-slate-800/30">
              <div className="text-sm font-semibold">KASH SCALE 5 (Mensal)</div>
              <p className="text-sm text-slate-400 mt-2">
                Serviço mensal — apenas divulgação (sem contratação online).
              </p>
            </div>
          </div>
        </section>

        {/* “Como funciona” âncora simples */}
        <section id="como-funciona" className="mt-12">
          <SectionTitle title="Como funciona" />
          <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
            <li>Preencha sua aplicação (em breve).</li>
            <li>Processamos abertura na Flórida e solicitação de EIN.</li>
            <li>Você recebe os documentos e instruções de uso.</li>
          </ol>
        </section>
      </main>

      {/* Rodapé simples */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-slate-400">
          © {new Date().getFullYear()} KASH Solutions. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}