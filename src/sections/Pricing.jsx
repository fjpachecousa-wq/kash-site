import React from "react";
import CTAButton from "../components/CTAButton.jsx";

export default function Pricing(){
  return (
    <section className="container">
      <h3 className="section-title">Planos</h3>
      <p className="section-sub">Somente abertura de empresa disponível para contratação. KASH FLOW 30 e KASH SCALE 5 aparecem como divulgação.</p>
      <div className="card" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        <div className="card">
          <h4>Registro de Empresa</h4>
          <p>Florida State + EIN</p>
          <CTAButton>Contratar</CTAButton>
        </div>
        <div className="card">
          <h4>KASH FLOW 30 (Mensal)</h4>
          <p>Divulgação – não contratável aqui</p>
          <CTAButton variant="ghost">Saiba mais</CTAButton>
        </div>
        <div className="card">
          <h4>KASH SCALE 5 (Mensal)</h4>
          <p>Divulgação – não contratável aqui</p>
          <CTAButton variant="ghost">Saiba mais</CTAButton>
        </div>
      </div>
    </section>
  );
}
