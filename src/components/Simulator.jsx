import React from 'react'
export default function Simulator(){
  const [monthly,setMonthly] = React.useState(4000)
  const recAnual = monthly*12
  const ret30 = recAnual*0.30
  const economia = Math.max(0, recAnual*0.27) // placeholder visual
  const pct = Math.max(0, Math.min(100, Math.round((monthly/20000)*100)))
  return (
    <div className="card" style={{flex:1, minWidth:360}}>
      <div className="hstack" style={{justifyContent:'space-between'}}>
        <div className="section-title">Estimativa de economia anual</div>
        <a className="badge" href="#simulador">Simulador</a>
      </div>
      <input className="slider" type="range" min="500" max="20000" step="100"
        value={monthly}
        onChange={(e)=>{
          const v=Number(e.target.value)
          e.target.style.setProperty('--pct', `${Math.round((v/20000)*100)}%`)
          setMonthly(v)
        }}
        style={{'--pct':`${pct}%`}}/>
      <div className="row" style={{marginTop:14}}>
        <div className="kpi">
          <h3>Receita anual</h3>
          <div className="value">US$ {recAnual.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <h3>Retenção 30%</h3>
          <div className="value">US$ {ret30.toLocaleString()}</div>
        </div>
        <div className="kpi">
          <h3>Economia potencial</h3>
          <div className="value" style={{color:'var(--brand)'}}>US$ {economia.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}
