import React, { useState } from "react";

const APPS_SCRIPT_URL = (typeof import !== "undefined" && import.meta && import.meta.env && import.meta.env.VITE_APPS_SCRIPT_URL) || window.APPS_SCRIPT_URL || "";
const STRIPE_PAYLINK  = (typeof import !== "undefined" && import.meta && import.meta.env && import.meta.env.VITE_STRIPE_PAYLINK)  || window.STRIPE_PAYLINK  || "";

function newKashId(){ const s=Date.now().toString(36).toUpperCase(); const r=Math.random().toString(36).slice(2,8).toUpperCase(); return `KSH-${s}-${r}`; }
async function postJSON(url,data){ const res=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}); const txt=await res.text(); try{return JSON.parse(txt)}catch{return{ok:true,raw:txt}} }

export default function App(){
  const [step,setStep]=useState(1);
  const [kashId,setKashId]=useState(localStorage.getItem("kashId")||"");
  const [form,setForm]=useState({ companyName:localStorage.getItem("companyName")||"", clienteNome:"", clienteEmail:"", socios:[{nome:"",doc:""}] });
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [statusData,setStatusData]=useState(null);

  function onChange(e,idx){
    const {name,value}=e.target;
    if(name.startsWith("socio.")){ const[,f]=name.split("."); const c=[...form.socios]; c[idx][f]=value; setForm({...form,socios:c}); }
    else { setForm({...form,[name]:value}); if(name==="companyName") localStorage.setItem("companyName", value); }
  }
  function addSocio(){ setForm({...form,socios:[...form.socios,{nome:"",doc:""}]}); }
  function next(){ setStep(s=>s+1) } function back(){ setStep(s=>Math.max(1,s-1)) }

  async function gerar(){ const id=newKashId(); setKashId(id); localStorage.setItem("kashId",id);
    try{ if(APPS_SCRIPT_URL){ await postJSON(APPS_SCRIPT_URL,{action:"upsert",kashId:id,companyName:form.companyName||localStorage.getItem("companyName")||"",status:"Rascunho",atualizadoEm:new Date().toISOString()}); } }catch{}
    next();
  }
  function contratoHTML(){ const d=new Date().toLocaleString("pt-BR"); const socios=(form.socios||[]).map((s,i)=>`<li>${i+1}. ${s.nome} — ${s.doc||""}</li>`).join("");
    return `<style>body{font-family:Arial,sans-serif;margin:32px;line-height:1.5}.muted{color:#666;font-size:12px}.box{border:1px solid #ddd;padding:16px;border-radius:8px}.sign{margin-top:48px}.sign .line{margin:28px 0 40px;border-bottom:1px solid #000;height:0}.footer{position:fixed;bottom:16px;left:32px;right:32px;font-size:12px;color:#666;display:flex;justify-content:space-between}</style>
      <h1>Contrato de Prestação de Serviços</h1>
      <div class="muted">KASH Corporate Solutions LLC — Tracking: ${kashId}</div>
      <div class="box"><h3>Objeto</h3><p>Registro na Flórida (Sunbiz), posterior EIN, endereço e agente por 12 meses.</p>
      <h3>Dados do Contratante</h3><p><b>Empresa:</b> ${form.companyName||"(informar)"}<br/><b>Responsável:</b> ${form.clienteNome||"(informar)"} — <b>E-mail:</b> ${form.clienteEmail||"(informar)"}</p>
      <p><b>Sócios:</b></p><ul>${socios||"<li>(informar)</li>"}</ul>
      <h3>Responsabilidade</h3><p>Informações sob responsabilidade do CONTRATANTE.</p>
      <h3>Pagamento</h3><p>Vigência após pagamento (valor referencial US$ 1.360).</p>
      <h3>Foro</h3><p>Rio de Janeiro — Capital e, se necessário, Orlando — Flórida, EUA.</p></div>
      <div class="sign"><p>Local e Data: ________________________________ — ${d}</p><div class="line"></div><p>Assinatura</p></div>
      <div class="footer"><span>${form.companyName||""}</span><span>Tracking: ${kashId}</span></div>`;
  }
  function imprimirContrato(){ const w=window.open("","_blank"); w.document.write(contratoHTML()); w.document.close(); w.focus(); w.print(); }
  async function pagar(){ if(!STRIPE_PAYLINK){ alert("Defina STRIPE PAYLINK"); return; }
    try{ if(APPS_SCRIPT_URL){ await postJSON(APPS_SCRIPT_URL,{action:"event",kashId,companyName:form.companyName||localStorage.getItem("companyName")||"",status:"Pagamento iniciado",atualizadoEm:new Date().toISOString(),event:"payment_start"}); } }catch{}
    window.location.href=STRIPE_PAYLINK;
  }
  async function concluir(){ setLoading(true); setError(""); try{
      if(!APPS_SCRIPT_URL) throw new Error("Configure APPS_SCRIPT_URL");
      const res=await postJSON(APPS_SCRIPT_URL,{action:"upsert",kashId,companyName:form.companyName||localStorage.getItem("companyName")||"",clienteNome:form.clienteNome,clienteEmail:form.clienteEmail,socios:form.socios,atualizadoEm:new Date().toISOString(),status:"Concluído"});
      if(!res||res.ok===false) throw new Error(res&&res.error?res.error:"Falha ao salvar"); next();
    }catch(e){ setError(e.message||"Erro ao salvar"); } finally{ setLoading(false); } }
  async function consultar(){ setLoading(True); setError(""); setStatusData(null); try{
      if(!APPS_SCRIPT_URL) throw new Error("Configure APPS_SCRIPT_URL");
      const r=await postJSON(APPS_SCRIPT_URL,{action:"status",kashId}); setStatusData(r);
    }catch(e){ setError(e.message||"Erro ao consultar"); } finally{ setLoading(false); } }

  const I={display:"block",width:"100%",padding:"10px 12px",border:"1px solid #ccc",borderRadius:6,marginBottom:8};
  const B={padding:"10px 14px",border:"1px solid #333",background:"#111",color:"#fff",borderRadius:6,cursor:"pointer"};
  const BG={padding:"10px 14px",border:"1px solid #ccc",background:"#fff",color:"#111",borderRadius:6,cursor:"pointer"};

  return (<div style={{maxWidth:900,margin:"0 auto",padding:16}}>
    <h1 style={{marginBottom:8}}>KASH Solutions</h1>
    <p style={{marginTop:0,color:"#555"}}>Fluxo: Coleta → Tracking → Contrato → Pagamento → Gravar → Status</p>

    {step===1&&(<div><h2>1) Dados</h2>
      <input name="companyName" placeholder="Nome da Empresa" value={form.companyName} onChange={onChange} style={I}/>
      <input name="clienteNome" placeholder="Seu nome completo" value={form.clienteNome} onChange={onChange} style={I}/>
      <input name="clienteEmail" type="email" placeholder="Seu e-mail" value={form.clienteEmail} onChange={onChange} style={I}/>
      <div style={{marginTop:16}}><button onClick={gerar} style={B}>Gerar Tracking (kashId)</button></div>
    </div>)}

    {step===2&&(<div><h2>2) Seu kashId</h2>
      <div style={{border:"1px solid #ddd",padding:12,borderRadius:6,marginBottom:12}}>kashId: <b>{kashId}</b></div>
      <button onClick={()=>setStep(3)} style={B}>Avançar</button>
    </div>)}

    {step===3&&(<div><h2>3) Contrato</h2>
      <button onClick={imprimirContrato} style={B}>Visualizar/Imprimir Contrato</button>{" "}
      <button onClick={()=>setStep(4)} style={BG}>Continuar</button>
    </div>)}

    {step===4&&(<div><h2>4) Pagamento</h2>
      <button onClick={()=>setStep(3)} style={BG}>Voltar</button>{" "}
      <button onClick={pagar} style={B}>Pagar</button>{" "}
      <button onClick={()=>setStep(5)} style={BG}>Já paguei</button>
    </div>)}

    {step===5&&(<div><h2>5) Concluir</h2>
      {error&&<div style={{color:"red",marginBottom:8}}>{error}</div>}
      <button onClick={()=>setStep(4)} style={BG}>Voltar</button>{" "}
      <button onClick={concluir} style={B} disabled={loading}>{loading?"Salvando...":"Concluir"}</button>
    </div>)}

    {step===6&&(<div><h2>6) Acompanhar</h2>
      <div style={{display:"flex",gap:8}}>
        <input value={kashId} onChange={e=>setKashId(e.target.value)} style={I}/>
        <button onClick={async()=>{ await consultar(); }} style={B}>Consultar</button>
      </div>
      {statusData&&<pre style={{background:"#f4f4f4",padding:12,marginTop:12,overflowX:"auto"}}>{JSON.stringify(statusData,null,2)}</pre>}
    </div>)}
  </div>);
}
