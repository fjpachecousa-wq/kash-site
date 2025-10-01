import React from "react";
import CTAButton from "../components/CTAButton.jsx";

export default function Hero(){
  return (
    <section className="hero container">
      <div className="grid-2 card">
        <div>
          <img src="/logo.png" alt="KASH" className="logo" onError={(e)=>{e.currentTarget.style.display='none';}} />
          <h1>Abra sua empresa na Flórida, rápido e sem dor de cabeça</h1>
          <p>Registro no Florida State + EIN no IRS. Atendimento em português. Sem taxas escondidas.</p>
          <div style={{display:"flex",gap:12,marginTop:16}}>
            <CTAButton>Começar</CTAButton>
            <CTAButton variant="ghost">Como funciona</CTAButton>
          </div>
        </div>
        <div>
          <div className="card">
            <h3 className="section-title">Simulador de economia</h3>
            <p className="section-sub">Mantenha este card. Nós vamos religar a lógica nas próximas etapas.</p>
            <div className="card" style={{background:"#0b1220"}}>
              <div style={{display:"grid",gap:8}}>
                <label>Faturamento mensal (US$)</label>
                <input type="number" placeholder="10.000" style="padding:10px;border-radius:8px;border:1px solid #1e293b;background:#0b1220;color:white"/>
                <label>Custos mensais (US$)</label>
                <input type="number" placeholder="6.000" style="padding:10px;border-radius:8px;border:1px solid #1e293b;background:#0b1220;color:white"/>
              </div>
              <div style={{marginTop:12,display:"flex",gap:12}}>
                <CTAButton>Calcular</CTAButton>
                <CTAButton variant="ghost">Comparar</CTAButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
