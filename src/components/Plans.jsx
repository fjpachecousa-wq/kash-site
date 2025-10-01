export default function Plans(){
  return (
    <section id="planos" style={{marginTop:24}}>
      <div className="section-title">Planos e preços</div>
      <div className="grid">
        <div className="card">
          <div className="muted" style={{marginBottom:6}}>Divulgação</div>
          <div style={{fontWeight:700}}>KASH FLOW 30 (Mensal)</div>
          <p className="muted" style={{marginTop:8}}>Planejamento e gestão financeira.</p>
        </div>
        <div className="card">
          <div className="muted" style={{marginBottom:6}}>Pacote principal</div>
          <div style={{fontWeight:700}}>Abertura de empresa</div>
          <div className="price" style={{margin:'10px 0'}}>US$ 1.360</div>
          <button className="btn">Começar agora</button>
        </div>
        <div className="card">
          <div className="muted" style={{marginBottom:6}}>Divulgação</div>
          <div style={{fontWeight:700}}>KASH SCALE 5 (Mensal)</div>
          <p className="muted" style={{marginTop:8}}>Crescimento e escala comercial.</p>
        </div>
      </div>
    </section>
  )
}
