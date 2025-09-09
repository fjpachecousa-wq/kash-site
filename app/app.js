// ======= Config =======
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xblawgpk"; // troque se precisar

// ======= Estado simples =======
const S = {
  appData: {},
  paid: false,
  issuedAt: null,
  signed: false,
  sign: { id:null, verification:null },
  trackId: null,
  status: 'FORM_RECEIVED',
  steps: [
    {code:'FORM_RECEIVED', name:'Formulário recebido'},
    {code:'CONFIRMED', name:'Conteúdo confirmado'},
    {code:'PAID', name:'Pagamento confirmado'},
    {code:'CONTRACT_ISSUED', name:'Contrato emitido'},
    {code:'CONTRACT_SIGNED', name:'Contrato assinado'},
    {code:'LLC_FILED', name:'Aplicação LLC enviada'},
    {code:'LLC_APPROVED', name:'LLC aprovada'},
    {code:'EIN_FILED', name:'Aplicação EIN enviada'},
    {code:'EIN_ISSUED', name:'EIN emitido (USPS)'},
    {code:'PACKAGE_DELIVERED', name:'Pacote entregue'},
    {code:'CLOSED', name:'Encerrado'}
  ],
  docs: []
};

// ======= Navegação e util =======
function nav(id){
  for (const sec of document.querySelectorAll('section')) sec.classList.add('hide');
  document.getElementById(id).classList.remove('hide');
  window.scrollTo({top:0, behavior:'smooth'});
}
function setBadge(){
  const el = document.getElementById('badgeTrack');
  if (el) el.textContent = S.trackId ? `Tracking: ${S.trackId}` : 'Sem Tracking';
}
function formToJSON(form){
  const data = {};
  new FormData(form).forEach((v,k)=>{
    const path = k.split('.');
    let cur = data;
    for (let i=0;i<path.length;i++){
      const key = path[i];
      const m = key.match(/(\w+)\[(\d+)\]/);
      if (m){
        const [,base,idx]=m;
        cur[base]=cur[base]||[];
        cur[base][+idx]=cur[base][+idx]||{};
        if (i===path.length-1) cur[base][+idx]=v; else cur=cur[base][+idx];
      } else {
        if (i===path.length-1) cur[key]=v; else cur=(cur[key]=cur[key]||{});
      }
    }
  });
  return data;
}
function pretty(obj){ return '<pre class="print-area">'+escapeHtml(JSON.stringify(obj,null,2))+'</pre>' }
function escapeHtml(s){return s.replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function nowIssue(){ return new Date().toISOString() }
function dateBR(d){ const dt = new Date(d); return dt.toLocaleDateString('pt-BR') }
function dateEN(d){ const dt = new Date(d); return dt.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) }
function shortHash(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2) }
function genTrack(){ return `KCS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000+Math.random()*9000)}` }

// ======= Simulador =======
function calcSim(){
  const rev = Number(document.getElementById('simRevenue').value||0);
  const rate = Number(document.getElementById('simRate').value||30)/100;
  const retido = rev*rate;
  const liquido = rev - retido;
  const html = `
    <strong>Resultado:</strong><br/>
    Receita mensal: USD ${rev.toLocaleString()}<br/>
    Retenção estimada (sem LLC): USD ${retido.toLocaleString()}<br/>
    Valor líquido mensal (sem LLC): USD ${liquido.toLocaleString()}<br/>
    <hr/>
    <em>Com LLC (W-8BEN-E), você busca afastar a retenção automática de 30% (observadas as condições fiscais aplicáveis).</em>
  `;
  document.getElementById('simOut').innerHTML = `<div>${html}</div>`;
}

// ======= Templates de Contrato (PT/EN) =======
function dictFromApp(d){
  const m=(d.members&&d.members[0])||{}; const c=d.company||{};
  return {
    '[NOME]': m.fullName||'',
    '[DOCUMENTO]': m.passport||'',
    '[ENDERECO]': c.address||'',
    '[EMAIL]': c.email||m.email||'',
    '[TELEFONE]': c.phone||m.phone||'',
    '[NOME_EMPRESA_OPCAO1]': c.companyName||'',
    '[NOME_EMPRESA_OPCAO2]': c.altName2||'',
    '[NOME_EMPRESA_OPCAO3]': c.altName3||'',
    '[CIDADE_UF]': c.cityUF||'Rio de Janeiro/RJ',
    '[DATA_EMISSAO]': dateBR(S.issuedAt||new Date()),
    '[ISSUE_DATE_EN]': dateEN(S.issuedAt||new Date()),
    '[SIGN_ID]': S.sign.id||'—',
    '[VERIFICATION_SHORT]': (S.sign.verification||'').slice(0,16).toUpperCase(),
    '[VALIDATION_URL]': location.origin+`/app/validate.html?sig=${encodeURIComponent(S.sign.id||'')}`
  };
}
function fill(tpl, dict){ return Object.keys(dict).reduce((acc,k)=>acc.split(k).join(dict[k]), tpl); }

const templatePT = `
<h3 style="margin:0 0 8px">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h3>
<p><strong>CONTRATANTE:</strong> [NOME], portador(a) do documento [DOCUMENTO], residente em [ENDERECO], e-mail [EMAIL], telefone [TELEFONE].</p>
<p><strong>CONTRATADA:</strong> KASH CORPORATE SOLUTIONS LLC, registrada no Estado da Flórida, EUA.</p>
<p><strong>Objeto:</strong> Registro da LLC na Flórida (opções: [NOME_EMPRESA_OPCAO1]; [NOME_EMPRESA_OPCAO2]; [NOME_EMPRESA_OPCAO3]) e, após aprovado, aplicação para obtenção do EIN junto ao IRS.</p>
<p><strong>Endereço virtual e agente registrado:</strong> fornecidos por 12 meses a partir da assinatura, sem uso físico do espaço.</p>
<p><strong>Responsabilidade das informações:</strong> exclusivas do CONTRATANTE.</p>
<p><strong>Limitações:</strong> não inclui licenças/alvarás, contabilidade, declarações/pagamento de tributos, abertura de conta bancária.</p>
<p><strong>Prazos médios:</strong> LLC até 15 dias úteis (sem pendências). EIN ~4 semanas da aplicação (sem pendências). Carta EIN enviada pelo IRS via USPS.</p>
<p><strong>Encerramento:</strong> após emissão do EIN e entrega dos documentos digitais.</p>
<p><strong>Validade:</strong> produz efeitos apenas após pagamento integral (conta única, conforme site).</p>
<p><strong>Acompanhamento:</strong> após pagamento e assinatura eletrônica, será disponibilizado um Track Number exclusivo.</p>
<p><strong>Foro (jurisdição concorrente a critério do CONTRATANTE):</strong> Brasil – Comarca da Capital do Estado do Rio de Janeiro (Rio de Janeiro/RJ) ou EUA – Orlando, Estado da Flórida.</p>
<p><strong>[CIDADE_UF], [DATA_EMISSAO]</strong></p>
<p class="muted">Signature ID: [SIGN_ID] • Verification: [VERIFICATION_SHORT] • Validation: [VALIDATION_URL]</p>
`;

const templateEN = `
<h3 style="margin:0 0 8px">SERVICE AGREEMENT</h3>
<p><strong>CLIENT:</strong> [NOME], holder of [DOCUMENTO], residing at [ENDERECO], email [EMAIL], phone [TELEFONE].</p>
<p><strong>PROVIDER:</strong> KASH CORPORATE SOLUTIONS LLC, organized under the laws of the State of Florida, USA.</p>
<p><strong>Scope:</strong> Formation of a Florida LLC (name options: [NOME_EMPRESA_OPCAO1]; [NOME_EMPRESA_OPCAO2]; [NOME_EMPRESA_OPCAO3]) and, once approved, EIN application with the IRS.</p>
<p><strong>Virtual address & registered agent:</strong> provided for 12 months from signature, with no physical use.</p>
<p><strong>Information responsibility:</strong> solely the CLIENT’s.</p>
<p><strong>Limitations:</strong> excludes permits/licenses, accounting, tax returns/payments, bank account opening.</p>
<p><strong>Average timeframes:</strong> LLC up to 15 business days (no pending items). EIN ~4 weeks from application (no pending items). EIN letter sent by IRS via USPS.</p>
<p><strong>Completion:</strong> upon EIN issuance and delivery of digital documents.</p>
<p><strong>Effectiveness:</strong> takes effect only after full payment (single charge, as per website).</p>
<p><strong>Tracking:</strong> after payment and e-signature, a unique Track Number will be provided.</p>
<p><strong>Jurisdiction (concurrent at CLIENT’s discretion):</strong> Brazil – Court of the Capital District of the State of Rio de Janeiro (Rio de Janeiro/RJ) or USA – Orlando, Florida.</p>
<p><strong>[CIDADE_UF], [ISSUE_DATE_EN]</strong></p>
<p class="muted">Signature ID: [SIGN_ID] • Verification: [VERIFICATION_SHORT] • Validation: [VALIDATION_URL]</p>
`;

function renderContracts(){
  const dict = dictFromApp(S.appData);
  document.getElementById('contratoPT').innerHTML = fill(templatePT, dict);
  document.getElementById('contratoEN').innerHTML = fill(templateEN, dict);
}

// ======= Eventos =======
window.addEventListener('DOMContentLoaded', ()=>{
  // Simulador
  document.getElementById('simCalc').addEventListener('click', calcSim);
  calcSim();

  // Form
  const form = document.getElementById('appForm');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = formToJSON(form);
    S.appData = data;
    sessionStorage.setItem('appData', JSON.stringify(data));

    // Envia ao Formspree
    try{
      const r = await fetch(FORMSPREE_ENDPOINT, {
        method:'POST', headers:{'Accept':'application/json'}, body: new FormData(form)
      });
      document.getElementById('formMsg').textContent = r.ok ? 'Formulário enviado com sucesso.' : 'Falha ao enviar ao Formspree.';
    }catch(err){ document.getElementById('formMsg').textContent = 'Falha de rede ao enviar ao Formspree.' }

    document.getElementById('confirmJSON').innerHTML = pretty(S.appData);
    nav('stepConfirm');
  });

  // Confirmação/Aceite
  const acceptTos = document.getElementById('acceptTos');
  const goPay = document.getElementById('goPay');
  acceptTos.addEventListener('change', ()=> goPay.disabled = !acceptTos.checked);
  goPay.addEventListener('click', ()=>{ S.status='CONFIRMED'; nav('stepPay'); });

  // Pagamento (simulado)
  document.getElementById('btnPaySuccess').addEventListener('click', ()=>{
    S.paid = true; S.status = 'PAID'; S.issuedAt = nowIssue(); S.trackId = genTrack(); setBadge();
    S.status = 'CONTRACT_ISSUED'; renderContracts(); nav('stepContract');
  });

  // Contrato → Assinar
  document.getElementById('toSign').addEventListener('click', ()=> nav('stepSign'));

  // Assinatura
  const signAck = document.getElementById('signAck');
  const btnSign = document.getElementById('btnSign');
  signAck.addEventListener('change', ()=> btnSign.disabled = !signAck.checked);

  document.getElementById('btnSign').addEventListener('click', ()=>{
    const sigId = `KCS-SIG-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000+Math.random()*9000)}`;
    const verification = shortHash(); // DEMO: em produção, calcular HMAC no servidor
    S.sign = { id:sigId, verification }; S.signed = true; S.status='CONTRACT_SIGNED';
    renderContracts();
    document.getElementById('signInfo').innerHTML = `Assinado! Signature ID: <b>${sigId}</b> — Verificação (parcial): <b>${verification.slice(0,16).toUpperCase()}</b>`;
    buildDashboard();
    nav('stepTrack');
  });

  // Restaura rascunho
  try{ const stash = sessionStorage.getItem('appData'); if (stash){ S.appData = JSON.parse(stash); }}catch{}
  setBadge();

  // Começa no simulador
  nav('stepSim');
});

// ======= Dashboard =======
function buildDashboard(){
  document.getElementById('trackOut').textContent = S.trackId||'—';
  document.getElementById('statusOut').textContent = S.status;
  const list = document.getElementById('timeline'); list.innerHTML='';
  const doneSet = new Set(['FORM_RECEIVED','CONFIRMED','PAID','CONTRACT_ISSUED','CONTRACT_SIGNED']);
  for(const st of S.steps){
    const li = document.createElement('li');
    const isDone = doneSet.has(st.code);
    li.innerHTML = `<div class="row"><div class="badge" style="border-color:${isDone?'#2e7d32':'#2c3950'};color:${isDone?'#8ee0a5':'var(--muted)'}">${isDone?'Concluído':'Pendente'}</div><strong>${st.name}</strong></div>`;
    list.appendChild(li);
  }
  const docs = document.getElementById('docsList'); docs.innerHTML='';
  const li = document.createElement('li');
  li.innerHTML = `<div class="row"><span>Contrato (PT/EN) — versão emitida</span><button class="btn ghost" onclick="window.print()">Imprimir</button></div>`;
  docs.appendChild(li);
}

// ======= Finalização =======
function voltarHome(){
  // Redirecione para a home do seu site
  window.location.href = "/";
}

