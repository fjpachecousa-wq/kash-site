export default function Services(){
  const items=[
    {title:'Abertura LLC Partnership', desc:'Registro oficial na Flórida (Sunbiz).'},
    {title:'EIN (IRS)', desc:'Obtenção do Employer Identification Number.'},
    {title:'Endereço + Agente (12 meses)', desc:'Inclusos no pacote de abertura.'},
    {title:'Operating Agreement', desc:'Documento societário digital.'},
  ]
  return (
    <section style={{marginTop:24}}>
      <div className="section-title">Serviços incluídos</div>
      <div className="grid">
        {items.map((it,i)=>(
          <div key={i} className="chip">
            <div style={{fontWeight:700, marginBottom:6}}>{it.title}</div>
            <div className="muted">{it.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
