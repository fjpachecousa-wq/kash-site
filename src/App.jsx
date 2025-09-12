// src/App.jsx
import React, { useEffect, useState } from "react";
import ApplicationForm from "./components/ApplicationForm.jsx";

export default function App() {
  // controla a exibição do formulário
  const [showForm, setShowForm] = useState(false);

  // abre o formulário automaticamente se a URL tiver #aplicacao ou ?start=1
  useEffect(() => {
    const hasHash = window.location.hash === "#aplicacao";
    const hasStart = new URLSearchParams(window.location.search).has("start");
    if (hasHash || hasStart) setShowForm(true);
  }, []);

  // ao abrir, rola até o formulário
  useEffect(() => {
    if (!showForm) return;
    const el = document.getElementById("aplicacao");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showForm]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {/* ======= HEADER ======= */}
      <header className="navbar bg-base-100 shadow-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="navbar-start">
            <a className="text-xl font-bold">KASH Solutions</a>
          </div>
          <div className="navbar-end gap-2">
            <a href="/" className="btn btn-ghost">Início</a>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              title="Abrir formulário de aplicação"
            >
              Começar
            </button>
          </div>
        </div>
      </header>

      {/* ======= HERO (sua capa permanece) ======= */}
      <section className="container max-w-6xl mx-auto px-4 py-10">
        <div className="hero rounded-2xl bg-base-100 shadow">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold">Abertura de LLC na Flórida</h1>
              <p className="py-4 opacity-80">
                Sua página inicial permanece intacta. Clique em <b>Começar</b> para
                abrir o formulário de aplicação e o contrato com aceite eletrônico.
              </p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Começar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======= (aqui ficam as demais seções da sua home, se existirem) ======= */}

      {/* ======= FORMULÁRIO (aparece somente quando solicitado) ======= */}
      {showForm && (
        <section id="aplicacao" className="container max-w-4xl mx-auto px-4 pb-16">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <ApplicationForm />
            </div>
          </div>
        </section>
      )}

      {/* ======= FOOTER ======= */}
      <footer className="footer footer-center bg-base-100 text-base-content py-6 border-t">
        <aside>
          <p>© {new Date().getFullYear()} KASH Corporate Solutions LLC — Todos os direitos reservados.</p>
        </aside>
      </footer>
    </div>
  );
}
