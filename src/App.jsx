import React, { useMemo, useState } from "react";

/**
 * KASH — Página inicial (baseline limpa)
 * - Mantém: logo, herói, simulador de economia, planos (Flow/Scale só divulgação)
 * - Remove lógicas antigas (Sheets/Stripe/Formspree)
 * - Pronto para evoluir por etapas (formularios, sheets, stripe) sem “gambiarras”
 *
 * COMO USAR:
 * 1) Salve este arquivo como:  src/App.jsx
 * 2) Garanta que sua logo exista em: public/logo.png  (ou ajuste o src abaixo)
 * 3) Commit + Push no GitHub → Vercel publica automaticamente
 */

function Container({ children, style }) {
  return (
    <div
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "0 16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        backdropFilter: "saturate(180%) blur(8px)",
        background: "rgba(10, 14, 23, 0.7)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Container
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            onError={(e) => {
              // fallback para svg, se existir
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/logo.svg";
            }}
            alt="KASH"
            style={{ height: 36 }}
          />
          <span style={{ color: "#e5e7eb", fontWeight: 600, letterSpacing: 0.3 }}>
            KASH
          </span>
        </div>

        <nav style={{ display: "flex", gap: 16 }}>
          <a href="#como-funciona" style={linkStyle}>
            Como funciona
          </a>
          <a href="#simulador" style={linkStyle}>
            Simulador
          </a>
          <a href="#planos" style={linkStyle}>
            Planos
          </a>
          <a href="#faq" style={linkStyle}>
            FAQ
          </a>
        </nav>
      </Container>
    </header>
  );
}

const linkStyle = {
  color: "rgba(229,231,235,0.9)",
  textDecoration: "none",
  fontSize: 14,
};

function Hero() {
  return (
    <section
      style={{
        background:
          "radial-gradient(1200px 400px at 50% -50%, rgba(16,185,129,0.20), rgba(16,185,129,0) 60%), #0b1120",
        color: "#e5e7eb",
        padding: "72px 0 48px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Container>
        <h1
          style={{
            fontSize: 38,
            lineHeight: 1.1,
            margin: 0,
            color: "#f8fafc",
            letterSpacing: 0.2,
          }}
        >
          Abra sua empresa na Flórida e obtenha o EIN com a KASH
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 16,
            color: "rgba(229,231,235,0.8)",
            maxWidth: 760,
          }}
        >
          Processo simples, transparente e 100% online. Você cuida do seu negócio; a KASH
          cuida da burocracia.
        </p>

        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="#planos" style={primaryBtn}>
            Ver preço e iniciar
          </a>
          <a href="#como-funciona" style={ghostBtn}>
            Como funciona
          </a>
        </div>
      </Container>
    </section>
  );
}

const primaryBtn = {
  background: "linear-gradient(90deg, #10b981, #059669)",
  color: "white",
  padding: "10px 16px",
  borderRadius: 10,
  fontWeight: 600,
  textDecoration: "none",
  display: "inline-block",
};
const ghostBtn = {
  background: "transparent",
  color: "#e5e7eb",
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  textDecoration: "none",
  display: "inline-block",
};

function ComoFunciona() {
  return (
    <section id="como-funciona" style={{ background: "#0b1120", color: "#e5e7eb", padding: "56px 0" }}>
      <Container>
        <h2 style={h2Style}>Como funciona</h2>
        <div style={grid3}>
          {steps.map((s, i) => (
            <StepCard key={i} {...s} index={i + 1} />
          ))}
        </div>
      </Container>
    </section>
  );
}

const h2Style = {
  fontSize: 28,
  margin: "0 0 18px",
  color: "#f8fafc",
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const steps = [
  { title: "Aplicação online", desc: "Preencha os dados básicos da empresa e sócios." },
  { title: "Registro na Flórida", desc: "Processamos o registro (LLC) e protocolamos oficialmente." },
  { title: "EIN no IRS", desc: "Solicitamos seu EIN e enviamos toda a documentação." },
];

function StepCard({ index, title, desc }) {
  return (
    <div
      style={{
        background: "rgba(148,163,184,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 8 }}>Etapa {index}</div>
      <div style={{ fontWeight: 600, color: "#f8fafc" }}>{title}</div>
      <div style={{ fontSize: 14, color: "rgba(229,231,235,0.8)", marginTop: 6 }}>{desc}</div>
    </div>
  );
}

function Simulador() {
  const [revenue, setRevenue] = useState(10000);
  const [currentFee, setCurrentFee] = useState(8); // %
  const [kashFee, setKashFee] = useState(5); // %

  const economia = useMemo(() => {
    const r = Number(revenue) || 0;
    const cf = Number(currentFee) || 0;
    const kf = Number(kashFee) || 0;
    const diff = Math.max(cf - kf, 0);
    return (r * diff) / 100;
  }, [revenue, currentFee, kashFee]);

  return (
    <section id="simulador" style={{ background: "#0b1120", color: "#e5e7eb", padding: "56px 0" }}>
      <Container>
        <h2 style={h2Style}>Simulador de economia</h2>
        <p style={{ marginTop: 6, color: "rgba(229,231,235,0.8)" }}>
          Ajuste os valores e entenda sua economia mensal estimada com a KASH.
        </p>
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          <Field label="Faturamento mensal (US$)">
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              style={inputStyle}
              min={0}
            />
          </Field>
          <Field label="Taxa atual (%)">
            <input
              type="number"
              value={currentFee}
              onChange={(e) => setCurrentFee(e.target.value)}
              style={inputStyle}
              min={0}
              max={100}
            />
          </Field>
          <Field label="Taxa KASH (%)">
            <input
              type="number"
              value={kashFee}
              onChange={(e) => setKashFee(e.target.value)}
              style={inputStyle}
              min={0}
              max={100}
            />
          </Field>
        </div>

        <div
          style={{
            marginTop: 18,
            padding: 18,
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 14,
            color: "#d1fae5",
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          Economia estimada: US$ {economia.toLocaleString(undefined, { maximumFractionDigits: 2 })} / mês
        </div>
      </Container>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, color: "rgba(229,231,235,0.7)", marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  height: 40,
  background: "rgba(148,163,184,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#f1f5f9",
  borderRadius: 10,
  padding: "0 12px",
  outline: "none",
};

function Planos() {
  return (
    <section id="planos" style={{ background: "#0b1120", color: "#e5e7eb", padding: "56px 0" }}>
      <Container>
        <h2 style={h2Style}>Planos</h2>
        <div style={grid3}>
          <PlanoCard
            destaque
            titulo="Abertura de Empresa (LLC + EIN)"
            preco="US$ 1.360"
            itens={[
              "Registro da LLC na Flórida",
              "Agente e endereço comercial (12 meses)",
              "EIN no IRS",
              "Documentação completa",
            ]}
            ctaLabel="Iniciar processo"
            ctaHref="#"
            ctaDisabled
            legenda="(Pagamento desativado durante a reconstrução)"
          />
          <PlanoCard
            titulo="KASH FLOW 30 (Mensal)"
            preco="Sob consulta"
            itens={[
              "Gestão financeira",
              "Relatórios de fluxo de caixa",
              "Acompanhamento mensal",
            ]}
            propaganda
          />
          <PlanoCard
            titulo="KASH SCALE 5 (Mensal)"
            preco="Sob consulta"
            itens={["Planejamento de crescimento", "Metas e acompanhamento", "Mentoria executiva"]}
            propaganda
          />
        </div>
      </Container>
    </section>
  );
}

function PlanoCard({
  destaque,
  titulo,
  preco,
  itens = [],
  ctaLabel,
  ctaHref,
  ctaDisabled,
  legenda,
  propaganda,
}) {
  return (
    <div
      style={{
        background: destaque ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.06)",
        border: destaque ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: 18 }}>{titulo}</div>
      <div style={{ marginTop: 6, color: "#cbd5e1" }}>{preco}</div>
      <ul style={{ marginTop: 12, paddingLeft: 18, color: "rgba(229,231,235,0.9)", fontSize: 14 }}>
        {itens.map((t, i) => (
          <li key={i} style={{ marginBottom: 6 }}>
            {t}
          </li>
        ))}
      </ul>

      {propaganda ? (
        <div
          style={{
            marginTop: 14,
            fontSize: 12,
            color: "rgba(229,231,235,0.7)",
            borderTop: "1px dashed rgba(255,255,255,0.12)",
            paddingTop: 10,
          }}
        >
          * Divulga&ccedil;&atilde;o: contrata&ccedil;&atilde;o apenas por contato direto.
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href={ctaHref || "#"}
            onClick={(e) => {
              if (ctaDisabled) e.preventDefault();
              // No futuro, esse click chamará Stripe ou iniciará o fluxo do formulário
            }}
            style={{ ...primaryBtn, opacity: ctaDisabled ? 0.6 : 1, pointerEvents: ctaDisabled ? "none" : "auto" }}
          >
            {ctaLabel || "Contratar"}
          </a>
          {ctaDisabled && (
            <span style={{ fontSize: 12, color: "rgba(229,231,235,0.7)" }}>{legenda || "(indisponível no momento)"}</span>
          )}
        </div>
      )}
    </div>
  );
}

function FAQ() {
  return (
    <section id="faq" style={{ background: "#0b1120", color: "#e5e7eb", padding: "56px 0" }}>
      <Container>
        <h2 style={h2Style}>Perguntas frequentes</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <FaqItem
            q="Quanto tempo leva para abrir a LLC?"
            a="Em média, alguns dias úteis após o envio completo das informações."
          />
          <FaqItem
            q="Como recebo os documentos?"
            a="Todos os documentos são entregues digitalmente, em PDF, por e‑mail."
          />
          <FaqItem
            q="O pagamento online está ativo?"
            a="Ainda não. Durante a reconstrução, o botão de pagamento permanece desativado."
          />
        </div>
      </Container>
    </section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 14,
        background: "rgba(148,163,184,0.06)",
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "transparent",
          color: "#f8fafc",
          fontWeight: 600,
          width: "100%",
          textAlign: "left",
          border: 0,
          padding: 0,
          cursor: "pointer",
        }}
      >
        {q}
      </button>
      {open && <div style={{ marginTop: 8, color: "rgba(229,231,235,0.85)" }}>{a}</div>}
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: "#0b1120",
        color: "rgba(229,231,235,0.7)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "24px 0",
      }}
    >
      <Container style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>© {new Date().getFullYear()} KASH — Todos os direitos reservados.</div>
        <div>
          <a href="mailto:contato@kashsolutions.us" style={linkStyle}>
            contato@kashsolutions.us
          </a>
        </div>
      </Container>
    </footer>
  );
}

export default function App() {
  return (
    <div style={{ fontFamily: "-apple-system, Inter, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif", background: "#0b1120", minHeight: "100vh" }}>
      <Header />
      <Hero />
      <ComoFunciona />
      <Simulador />
      <Planos />
      <FAQ />
      <Footer />
    </div>
  );
}
