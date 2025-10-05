// App.jsx
import React from "react";

export default function App() {
  return (
    <div className="site-wrap">
      {/* ===== Header / Nav (visual only) ===== */}
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <span className="logo-mark">KASH</span>
            <span className="logo-sub">Corporate Solutions LLC</span>
          </div>

          <nav className="nav">
            <a href="#inicio" className="nav-link">Início</a>
            <a href="#servicos" className="nav-link">Serviços</a>
            <a href="#planos" className="nav-link">Planos</a>
            <a href="#etapas" className="nav-link">Etapas</a>
            <a href="#contato" className="nav-link">Contato</a>
          </nav>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section id="inicio" className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">
              Pacote completo para começar certo.
            </h1>
            <p className="hero-sub">
              Abertura de LLC na Flórida (Sunbiz) + EIN (IRS) + Endereço
              físico e Registered Agent por 12 meses.
            </p>
            <div className="hero-cta-group">
              {/* Botões estáticos (sem ação) */}
              <button type="button" className="btn btn-primary" aria-disabled="true">
                Começar agora
              </button>
              <button type="button" className="btn btn-outline" aria-disabled="true">
                Ver detalhes
              </button>
            </div>
          </div>

          <div className="hero-media">
            {/* Mantenha seu visual atual trocando a classe/IMG abaixo */}
            <div className="hero-illustration" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ===== Serviços ===== */}
      <section id="servicos" className="section services">
        <div className="container">
          <h2 className="section-title">Serviços principais</h2>
          <p className="section-desc">
            Registro oficial no Sunbiz, solicitação do EIN, documentos
            organizados e checklist de conformidade.
          </p>

          <div className="cards grid-3">
            <article className="card service-card">
              <h3 className="card-title">Abertura da LLC</h3>
              <p className="card-text">
                Preparação e envio do registro na Flórida, inclusão de
                membros, endereço físico e Registered Agent (12 meses).
              </p>
              <button type="button" className="btn btn-link" aria-disabled="true">
                Detalhes
              </button>
            </article>

            <article className="card service-card">
              <h3 className="card-title">EIN (IRS)</h3>
              <p className="card-text">
                Aplicação do Employer Identification Number e
                orientações iniciais de uso para bancos e plataformas.
              </p>
              <button type="button" className="btn btn-link" aria-disabled="true">
                Detalhes
              </button>
            </article>

            <article className="card service-card">
              <h3 className="card-title">Checklist &amp; Suporte</h3>
              <p className="card-text">
                Sequência de próximos passos e materiais de orientação
                para os primeiros 90 dias de operação.
              </p>
              <button type="button" className="btn btn-link" aria-disabled="true">
                Detalhes
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ===== Planos (somente visual; sem lógica) ===== */}
      <section id="planos" className="section plans">
        <div className="container">
          <h2 className="section-title">Planos &amp; preços</h2>
          <p className="section-desc">
            Elementos abaixo são exibição estática (publicidade). Sem ação.
          </p>

          <div className="cards grid-3">
            {/* Plano principal de abertura (exemplo estático) */}
            <article className="card plan-card plan-highlight">
              <h3 className="card-title">Abertura LLC</h3>
              <div className="price">
                <span className="price-amount">$1,360</span>
                <span className="price-note">pagamento único</span>
              </div>
              <ul className="features">
                <li>Sunbiz + EIN</li>
                <li>Endereço físico (12 meses)</li>
                <li>Registered Agent (12 meses)</li>
                <li>Checklist de conformidade</li>
              </ul>
              <button type="button" className="btn btn-primary" aria-disabled="true">
                Contratar (desativado)
              </button>
            </article>

            {/* KASH FLOW 30 (visual estático) */}
            <article className="card plan-card">
              <h3 className="card-title">KASH FLOW 30</h3>
              <div className="price">
                <span className="price-amount">$300</span>
                <span className="price-note">/ mês</span>
              </div>
              <ul className="features">
                <li>Classificação contábil</li>
                <li>Relatórios essenciais</li>
                <li>Atendimento básico</li>
              </ul>
              {/* Sem onClick, sem link, sem integração */}
              <button type="button" className="btn btn-outline" aria-disabled="true">
                Saiba mais (estático)
              </button>
            </article>

            {/* KASH SCALE 5 (visual estático) */}
            <article className="card plan-card">
              <h3 className="card-title">KASH SCALE 5</h3>
              <div className="price">
                <span className="price-amount">$1,000</span>
                <span className="price-note">/ mês</span>
              </div>
              <ul className="features">
                <li>Suporte para até 5 contratos</li>
                <li>Prioridade no atendimento</li>
                <li>Painel gerencial</li>
              </ul>
              <button type="button" className="btn btn-outline" aria-disabled="true">
                Saiba mais (estático)
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* ===== Etapas do processo ===== */}
      <section id="etapas" className="section steps">
        <div className="container">
          <h2 className="section-title">Como funciona</h2>

          <ol className="step-list">
            <li className="step-item">
              <strong>1) Preencha seus dados</strong> — formulário visual estático.
            </li>
            <li className="step-item">
              <strong>2) Conferência</strong> — validamos internamente (sem integrações aqui).
            </li>
            <li className="step-item">
              <strong>3) Registro</strong> — abertura no Sunbiz e aplicação de EIN.
            </li>
            <li className="step-item">
              <strong>4) Entrega &amp; acompanhamento</strong> — checklist e orientações.
            </li>
          </ol>
        </div>
      </section>

      {/* ===== “Consultar processo por Tracking” (somente visual) ===== */}
      <section className="section tracking">
        <div className="container tracking-inner">
          <h2 className="section-title">Consultar processo por Tracking</h2>
          <div className="tracking-form" role="group" aria-label="Consulta visual apenas">
            <input
              type="text"
              className="input"
              placeholder="Digite seu tracking (visual)"
              aria-readonly="true"
              readOnly
            />
            <button type="button" className="btn btn-primary" aria-disabled="true">
              Consultar (desativado)
            </button>
          </div>
          <small className="muted">
            * Campo ilustrativo. Sem envio, sem armazenamento, sem integração.
          </small>
        </div>
      </section>

      {/* ===== Contato (visual; sem Formspree) ===== */}
      <section id="contato" className="section contact">
        <div className="container">
          <h2 className="section-title">Contato</h2>
          <p className="section-desc">
            Fale pelo e-mail <strong>contato@kashsolutions.us</strong>.
          </p>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="grid-2">
              <div className="field">
                <label className="label">Nome</label>
                <input className="input" placeholder="Seu nome" readOnly />
              </div>
              <div className="field">
                <label className="label">E-mail</label>
                <input className="input" placeholder="seu@email.com" readOnly />
              </div>
            </div>

            <div className="field">
              <label className="label">Mensagem</label>
              <textarea className="textarea" rows="4" placeholder="Sua mensagem" readOnly />
            </div>

            <button type="button" className="btn btn-primary" aria-disabled="true">
              Enviar (visual)
            </button>
            <small className="muted block">
              * Formulário ilustrativo. Sem Formspree, sem back-end, sem coleta de dados.
            </small>
          </form>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="logo-mark">KASH</span>
            <span className="logo-sub">Corporate Solutions LLC</span>
          </div>
          <div className="footer-links">
            <a href="#inicio" className="footer-link">Início</a>
            <a href="#servicos" className="footer-link">Serviços</a>
            <a href="#planos" className="footer-link">Planos</a>
            <a href="#contato" className="footer-link">Contato</a>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} KASH Solutions — Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}