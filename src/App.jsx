
import React from "react";

/** 
 * KASH — App.jsx (layout-only)
 * - Mantém o visual da página inicial (header, hero, seções, cards de preço, FAQ, footer)
 * - Sem lógica de envio, Sheets, Formspree ou Stripe
 * - Botões estão desativados (somente visual)
 * - Seguro para substituir diretamente e publicar (Vercel)
 */

// Helpers de UI (internos ao arquivo para evitar imports externos)
const Container = ({ className = "", children }) => (
  <div className={`max-w-6xl mx-auto px-4 ${className}`}>{children}</div>
);

const SectionTitle = ({ title, subtitle }) => (
  <div className="text-center mb-10">
    <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
    {subtitle ? (
      <p className="mt-2 text-slate-300 max-w-2xl mx-auto">{subtitle}</p>
    ) : null}
  </div>
);

const CTAButton = ({ children, disabled = true }) => (
  <button
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold
      ${disabled
        ? "bg-slate-600/50 text-slate-300 cursor-not-allowed"
        : "bg-emerald-500 hover:bg-emerald-600 text-white"
      } shadow`}
    type="button"
  >
    {children}
  </button>
);

const Card = ({ children, highlight = false }) => (
  <div
    className={`rounded-2xl p-6 border shadow-sm
      ${highlight
        ? "border-emerald-400/30 bg-emerald-950/30"
        : "border-slate-700/50 bg-slate-900/40"
      }`}
  >
    {children}
  </div>
);

const Check = () => (
  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] mr-2">✓</span>
);

// Seções
const Header = () => (
  <header className="sticky top-0 z-40 backdrop-blur bg-slate-950/70 border-b border-slate-800/60">
    <Container className="flex h-14 items-center justify-between">
      <a href="#" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-emerald-500" />
        <span className="text-white font-bold tracking-wide">KASH SOLUTIONS</span>
      </a>
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <a href="#como-funciona" className="text-slate-300 hover:text-white">Como funciona</a>
        <a href="#precos" className="text-slate-300 hover:text-white">Preços</a>
        <a href="#faq" className="text-slate-300 hover:text-white">FAQ</a>
        <a href="#contato" className="text-slate-300 hover:text-white">Contato</a>
      </nav>
      <div className="md:hidden">
        <span className="text-slate-300 text-sm">Menu</span>
      </div>
    </Container>
  </header>
);

const Hero = () => (
  <section className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
    <Container className="py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
            Abra sua empresa na <span className="text-emerald-400">Flórida</span> com suporte KASH
          </h1>
          <p className="mt-4 text-slate-300">
            Registro de LLC no Estado da Flórida e solicitação do EIN no IRS.
            Processo simplificado, comunicação clara e acompanhamento.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#precos" className="inline-flex">
              <CTAButton disabled>Começar agora</CTAButton>
            </a>
            <a href="#como-funciona" className="inline-flex">
              <CTAButton disabled>Como funciona</CTAButton>
            </a>
          </div>
          <p className="mt-3 text-xs text-slate-400">* Botões desativados nesta fase (layout).</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="aspect-video rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-center text-slate-400">
            Prévia visual
          </div>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li><Check/> Registro LLC (Florida State)</li>
            <li><Check/> EIN no IRS</li>
            <li><Check/> Comunicação e acompanhamento</li>
          </ul>
        </div>
      </div>
    </Container>
  </section>
);

const ComoFunciona = () => (
  <section id="como-funciona" className="bg-slate-950 border-t border-slate-800/60">
    <Container className="py-16">
      <SectionTitle title="Como funciona" subtitle="Três passos simples para tirar sua empresa do papel." />
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { t: "Aplicação", d: "Você informa os dados essenciais para abertura." },
          { t: "Protocolo", d: "Enviamos seu processo ao Estado e ao IRS." },
          { t: "Confirmação", d: "Você recebe os documentos e seguimos com orientações." },
        ].map((s, i) => (
          <Card key={i}>
            <div className="text-emerald-400 text-xl font-bold">0{i+1}</div>
            <h3 className="mt-2 text-white font-semibold">{s.t}</h3>
            <p className="mt-2 text-slate-300 text-sm">{s.d}</p>
          </Card>
        ))}
      </div>
    </Container>
  </section>
);

const Precos = () => (
  <section id="precos" className="bg-slate-950">
    <Container className="py-16">
      <SectionTitle title="Planos e Preços" subtitle="Apenas abertura de empresa está disponível. Demais serviços em divulgação." />
      <div className="grid md:grid-cols-3 gap-6">
        {/* KASH COMPANY — principal */}
        <Card highlight>
          <h3 className="text-white text-lg font-bold">KASH COMPANY</h3>
          <p className="text-slate-300 text-sm mt-1">Abertura de empresa (LLC na Flórida) + EIN</p>
          <div className="mt-4 text-3xl font-extrabold text-white">$1,360</div>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li><Check/> Registro no Florida State</li>
            <li><Check/> EIN no IRS</li>
            <li><Check/> Documentação digital</li>
          </ul>
          <div className="mt-6">
            <CTAButton disabled>Contratar</CTAButton>
          </div>
        </Card>

        {/* KASH FLOW 30 — divulgação */}
        <Card>
          <h3 className="text-white text-lg font-bold">KASH FLOW 30 (Mensal)</h3>
          <p className="text-slate-300 text-sm mt-1">Divulgação — não contratável no site</p>
          <div className="mt-4 text-3xl font-extrabold text-slate-300">—</div>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li><Check/> Gestão financeira (divulgação)</li>
            <li><Check/> Relatórios mensais</li>
          </ul>
          <div className="mt-6">
            <CTAButton disabled>Saiba mais</CTAButton>
          </div>
        </Card>

        {/* KASH SCALE 5 — divulgação */}
        <Card>
          <h3 className="text-white text-lg font-bold">KASH SCALE 5 (Mensal)</h3>
          <p className="text-slate-300 text-sm mt-1">Divulgação — não contratável no site</p>
          <div className="mt-4 text-3xl font-extrabold text-slate-300">—</div>
          <ul className="mt-6 space-y-2 text-sm text-slate-300">
            <li><Check/> Aceleração e suporte (divulgação)</li>
            <li><Check/> Acompanhamento dedicado</li>
          </ul>
          <div className="mt-6">
            <CTAButton disabled>Saiba mais</CTAButton>
          </div>
        </Card>
      </div>
    </Container>
  </section>
);

const FAQ = () => (
  <section id="faq" className="bg-slate-950">
    <Container className="py-16">
      <SectionTitle title="Perguntas frequentes" />
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { q: "Quanto tempo leva para abrir a empresa?", a: "O prazo varia conforme o Estado e o IRS. Geralmente algumas semanas." },
          { q: "Posso abrir empresa estando fora dos EUA?", a: "Sim. Não é obrigatório residir nos EUA para abrir uma LLC na Flórida." },
          { q: "Quais documentos recebo?", a: "Documentos do registro estadual e confirmação do EIN." },
          { q: "Como acompanho o processo?", a: "Você receberá atualizações por e-mail e canais informados." },
        ].map((item, idx) => (
          <Card key={idx}>
            <h4 className="text-white font-semibold">{item.q}</h4>
            <p className="mt-2 text-slate-300 text-sm">{item.a}</p>
          </Card>
        ))}
      </div>
    </Container>
  </section>
);

const Contato = () => (
  <section id="contato" className="bg-slate-950 border-t border-slate-800/60">
    <Container className="py-14">
      <SectionTitle title="Fale com a KASH" subtitle="Em breve adicionaremos o formulário de contato." />
      <div className="flex items-center justify-center">
        <CTAButton disabled>Em breve</CTAButton>
      </div>
    </Container>
  </section>
);

const Footer = () => (
  <footer className="bg-slate-950 border-t border-slate-800/60">
    <Container className="py-8 text-center text-slate-400 text-sm">
      © {new Date().getFullYear()} KASH Solutions — Todos os direitos reservados.
    </Container>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main>
        <Hero />
        <ComoFunciona />
        <Precos />
        <FAQ />
        <Contato />
      </main>
      <Footer />
    </div>
  );
}
