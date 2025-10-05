// App.jsx
import React from "react";

/**
 * KASH Solutions - App.jsx (visual-only)
 * - Sem Formspree / sem hooks / sem handlers / sem integrações
 * - Cards "KASH FLOW 30" e "KASH SCALE 5" mantidos apenas como publicidade estática (sem ação)
 * - Estrutura sem alterar design: cabeçalho, seções, rodapé
 * - Botões estáticos (disabled) — não possuem onClick
 */

export default function App() {
  return (
    <div className="site-wrap">
      {/* ===== Header / Navbar ===== */}
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            {/* Troque pela sua logo se houver */}
            <span className="logo-text">KASH Corporate Solutions LLC</span>
          </div>
          <nav className="nav">
            <a href="#inicio" className="nav-link">Início</a>
            <a href="#servicos" className="nav-link">Serviços</a>
            <a href="#processo" className="nav-link">Como funciona</a>
            <a href="#precos" className="nav-link">Planos</a>
            <a href="#faq" className="nav-link">Informações</a>
            <a href="#contato" className="nav-link">Contato</a>
          </nav>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section id="inicio" className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1 className="hero-title">Abertura de Empresa na Flórida</h1>
            <p className="hero-subtitle">
              Registro de LLC, endereço físico por 12 meses e agente registrado. 
              Orientação prática, contrato PT/EN e acompanhamento com tracking.
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary btn-disabled" aria-disabled="true">
                Começar (visual)
              </a>
              <a href="#precos" className="btn btn-ghost">Ver planos</a>
            </div>
            <p className="hero-note">
              * Este é um layout visual — sem integrações ativas.
            </p>
          </div>
          <div className="hero-art">
            {/* Imagem decorativa opcional */}
            <div className="hero-art-placeholder" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ===== Serviços principais ===== */}
      <section id="servicos" className="section section-alt">
        <div className="container">
          <h2 className="section-title">O que está incluso</h2>
          <div className="cards-grid">
            <article className="card">
              <h3 className="card-title">Registro LLC na Flórida</h3>
              <p className="card-text">
                Preparação e protocolo do registro na Sunbiz, conforme informações fornecidas.
              </p>
            </article>
            <article className="card">
              <h3 className="card-title">Agente Registrado (12 meses)</h3>
              <p className="card-text">
                Serviço de Registered Agent incluído por 12 meses a partir da contratação.
              </p>
            </article>
            <article className="card">
              <h3 className="card-title">Endereço físico (12 meses)</h3>
              <p className="card-text">
                Endereço comercial para correspondências por 12 meses (apenas para fins corporativos).
              </p>
            </article>
            <article className="card">
              <h3 className="card-title">EIN (IRS)</h3>
              <p className="card-text">
                Aplicação para emissão do EIN após registro da empresa aprovado.
              </p>
            </article>
            <article className="card">
              <h3 className="card-title">Contrato PT/EN</h3>
              <p className="card-text">
                Documentação em Português e Inglês, com cláusulas e tracking do processo.
              </p>
            </article>
            <article className="card">
              <h3 className="card-title">Acompanhamento com Tracking</h3>
              <p className="card-text">
                Fornecemos um número de acompanhamento (tracking) para consultar seu caso.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== Como funciona ===== */}
      <section id="processo" className="section">
        <div className="container">
          <h2 className="section-title">Como funciona</h2>
          <ol className="steps">
            <li className="step">
              <div className="step-num">1</div>
              <div className="step-body">
                <h3>Coleta de informações</h3>
                <p>
                  Você informa dados da empresa e dos sócios (nome, e-mail, documento, endereço).
                </p>
              </div>
            </li>
            <li className="step">
              <div className="step-num">2</div>
              <div className="step-body">
                <h3>Conferência e contrato</h3>
                <p>
                  Geramos o contrato PT/EN com as cláusulas acordadas e o tracking do processo.
                </p>
              </div>
            </li>
            <li className="step">
              <div className="step-num">3</div>
              <div className="step-body">
                <h3>Protocolo na Sunbiz</h3>
                <p>
                  Protocolamos o registro; após aprovado, seguimos com a aplicação do EIN no IRS.
                </p>
              </div>
            </li>
            <li className="step">
              <div className="step-num">4</div>
              <div className="step-body">
                <h3>Acompanhamento</h3>
                <p>
                  Você acompanha tudo com o seu número de tracking e recebe as atualizações.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ===== Preços / Planos (FLOW 30 e SCALE 5 como publicidade estática) ===== */}
      <section id="precos" className="section section-alt">
        <div className="container">
          <h2 className="section-title">Planos e preços</h2>

          <div className="pricing-grid">
            <article className="price-card">
              <header className="price-head">
                <h3 className="price-title">Abertura de LLC</h3>
                <div className="price-amount">
                  <span className="currency">$</span>1,360
                </div>
              </header>
              <ul className="price-list">
                <li>Registro na Sunbiz</li>
                <li>Agente Registrado (12 meses)</li>
                <li>Endereço físico (12 meses)</li>
                <li>Aplicação do EIN (IRS)</li>
                <li>Contrato PT/EN + Tracking</li>
              </ul>
              <div className="price-cta">
                <a className="btn btn-primary btn-disabled" aria-disabled="true">
                  Contratar (visual)
                </a>
              </div>
              <p className="note">* Módulo visual — sem pagamento ativo.</p>
            </article>

            {/* Publicidade estática — sem ação */}
            <article className="price-card">
              <header className="price-head">
                <h3 className="price-title">KASH FLOW 30</h3>
                <div className="price-amount">
                  <span className="currency">$</span>300<span className="per">/mês</span>
                </div>
              </header>
              <ul className="price-list">
                <li>Classificação contábil mensal</li>
                <li>Suporte operacional básico</li>
                <li>Relatórios essenciais</li>
              </ul>
              <div className="price-cta">
                <a className="btn btn-outline btn-disabled" aria-disabled="true" title="Publicidade — sem ação">
                  Publicidade
                </a>
              </div>
            </article>

            {/* Publicidade estática — sem ação */}
            <article className="price-card">
              <header className="price-head">
                <h3 className="price-title">KASH SCALE 5</h3>
                <div className="price-amount">
                  <span className="currency">$</span>1,000<span className="per">/mês</span>
                </div>
              </header>
              <ul className="price-list">
                <li>Suporte até 5 contratos</li>
                <li>Gestão operacional ampliada</li>
                <li>Relatórios e acompanhamento</li>
              </ul>
              <div className="price-cta">
                <a className="btn btn-outline btn-disabled" aria-disabled="true" title="Publicidade — sem ação">
                  Publicidade
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ===== Informações / Avisos ===== */}
      <section id="faq" className="section">
        <div className="container">
          <h2 className="section-title">Informações importantes</h2>
          <div className="info-grid">
            <article className="info-card">
              <h3>Responsabilidade das informações</h3>
              <p>
                As informações fornecidas pelos clientes são de inteira responsabilidade dos declarantes.
              </p>
            </article>
            <article className="info-card">
              <h3>Endereço e agente</h3>
              <p>
                O endereço físico e o agente registrado são válidos por 12 meses a partir da contratação.
              </p>
            </article>
            <article className="info-card">
              <h3>Jurisdição</h3>
              <p>
                Foro: Brasil (Rio de Janeiro – Capital) e, se necessário, EUA (Flórida – Orlando).
              </p>
            </article>
            <article className="info-card">
              <h3>Observação</h3>
              <p>
                Serviços e taxas são pagos na forma disponibilizada no site. Este módulo é apenas visual.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== Contato ===== */}
      <section id="contato" className="section section-alt">
        <div className="container">
          <h2 className="section-title">Fale conosco</h2>
          <div className="contact-box">
            <p className="contact-text">
              Entre em contato por e-mail:{" "}
              <a href="mailto:contato@kashsolutions.us" className="link">
                contato@kashsolutions.us
              </a>
            </p>
            {/* Formulário visual (sem ação) — se preferir, remova */}
            <form className="contact-form" aria-disabled="true">
              <div className="form-row">
                <label className="form-label">Nome</label>
                <input className="form-input" type="text" placeholder="Seu nome" disabled />
              </div>
              <div className="form-row">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" placeholder="Seu e-mail" disabled />
              </div>
              <div className="form-row">
                <label className="form-label">Mensagem</label>
                <textarea className="form-textarea" rows={4} placeholder="Sua mensagem" disabled />
              </div>
              <div className="form-actions">
                <button className="btn btn-primary btn-disabled" disabled type="button">
                  Enviar (visual)
                </button>
              </div>
              <p className="form-note">* Formulário desativado (visual).</p>
            </form>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">KASH Corporate Solutions LLC</div>
          <div className="footer-links">
            <a href="#inicio" className="footer-link">Início</a>
            <a href="#servicos" className="footer-link">Serviços</a>
            <a href="#processo" className="footer-link">Como funciona</a>
            <a href="#precos" className="footer-link">Planos</a>
            <a href="#faq" className="footer-link">Informações</a>
            <a href="#contato" className="footer-link">Contato</a>
          </div>
          <div className="footer-copy">
            © {new Date().getFullYear()} KASH Corporate Solutions LLC — Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* 
  Observações:
  - Este arquivo é visual-only. Não há Formspree, hooks, eventos ou integrações.
  - Se o seu projeto tiver CSS existente, mantenha as classes; se não, você pode estilizar 
    .container, .section, .card, .btn etc. no seu stylesheet atual sem alterar o JSX.
  - Os cards "KASH FLOW 30" e "KASH SCALE 5" foram mantidos como publicidade estática (sem ação).
*/