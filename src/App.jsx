import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <header className="bg-slate-900 p-4 text-center text-emerald-400 font-bold text-2xl">
        KA$H Solutions
      </header>
      <main className="flex-1 flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-bold">Bem-vindo ao Website</h1>
        <p className="text-slate-400 max-w-xl text-center">
          Este é o protótipo completo do site da KA$H Solutions em React + Tailwind. 
          Inclui página inicial, seções de serviços, planos, formulário de abertura e mais.
        </p>
        <a href="#planos" className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-900 font-semibold shadow hover:bg-emerald-400">
          Ver Planos
        </a>
      </main>
      <footer className="bg-slate-900 p-4 text-center text-slate-400 text-sm">
        © {new Date().getFullYear()} KA$H Solutions — Todos os direitos reservados.
      </footer>
    </div>
  )
}
