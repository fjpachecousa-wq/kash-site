import React, { useCallback, useMemo, useReducer, useState } from "react";

const CONFIG = {
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: { whatsapp: "+1 (305) 000-0000", email: "hello@kash.solutions", calendly: "" },
  checkout: { stripeUrl: "" },
  brand: { legal: "KASH CORPORATE SOLUTION", trade: "KA$H Solutions" },
  endpoints: { formspree: "https://formspree.io/f/xblawgpk" },
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;

function classNames(...cls) { return cls.filter(Boolean).join(" "); }
function calcAgeFullDate(birthdateStr) {
  const dob = new Date(birthdateStr); if (Number.isNaN(dob.getTime())) return -1;
  const t = new Date(); let age = t.getFullYear() - dob.getFullYear();
  const m = t.getMonth() - dob.getMonth(); if (m < 0 || (m === 0 && t.getDate() < dob.getDate())) age--;
  return age;
}
function isPercentTotalValid(members) { const total = members.reduce((s, m) => s + (Number(m.share) || 0), 0); return Math.abs(total - 100) <= 0.01; }

function genProtocol(prefix = "KASH") {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${y}${m}${day}-${rand}`;
}

function KLogo({ size = 40 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-2xl bg-slate-900" />
      <div className="absolute inset-[3px] rounded-xl bg-slate-800 shadow-inner" />
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 64 64" className="absolute">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
        <path d="M14 8h8v48h-8z" fill="url(#g)" />
        <path d="M26 32l22-24h10L42 32l16 24H48L26 32z" fill="url(#g)" />
      </svg>
    </div>
  );
}
function Pill({ children }) { return <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300 text-xs">{children}</span>; }
function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {eyebrow && <div className="mb-3"><Pill>{eyebrow}</Pill></div>}
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 tracking-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-400">{subtitle}</p>}
    </div>
  );
}
function CTAButton({ children, onClick, variant = "primary", type = "button", disabled = false }) {
  const base = "px-5 py-3 rounded-2xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = variant === "primary"
    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 focus:ring-emerald-300"
    : variant === "ghost"
    ? "bg-transparent ring-1 ring-slate-700 hover:bg-slate-800 text-slate-200"
    : "bg-slate-200 hover:bg-white text-slate-900";
  return <button type={type} className={classNames(base, styles)} onClick={onClick} disabled={disabled}>{children}</button>;
}

function DemoCalculator() {
  const [gross, setGross] = useState(5000);
  const withholding = useMemo(() => Math.max(0, (gross || 0) * 0.3), [gross]);
  return (
    <div className="rounded-2xl bg-slate-800/60 p-6 border border-slate-700 shadow-lg max-w-md">
      <h3 className="text-slate-100 font-semibold text-lg">Simulador de retenção (30%)</h3>
      <p className="text-slate-400 text-sm mt-1">Insira sua receita mensal em USD</p>
      <div className="mt-4 flex items-center gap-3">
        <input type="number" value={gross} onChange={(e) => setGross(parseFloat(e.target.value) || 0)} className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <span className="text-slate-400">USD</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
          <div className="text-slate-400 text-xs">Retenção estimada</div>
          <div className="text-slate-100 text-xl font-semibold">${withholding.toLocaleString()}</div>
        </div>
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 p-3">
          <div className="text-emerald-300 text-xs">Economia potencial*</div>
          <div className="text-emerald-200 text-xl font-semibold">${withholding.toLocaleString()}</div>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mt-3">*Comparado ao cenário sem LLC e sem declarações corretas.</p>
    </div>
  );
}
function Hero({ onStart }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3">
              <KLogo size={48} />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight">KA$H Solutions</h1>
                <p className="text-slate-400 text-sm">{CONFIG.brand.legal} · Florida LLC</p>
              </div>
            </div>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">Registro e gestão de <span className="text-emerald-400 font-semibold">LLC na Flórida</span> para criadores brasileiros que monetizam nos EUA.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton onClick={onStart}>Começar agora</CTAButton>
              <a href="#como-funciona" className="inline-flex"><CTAButton variant="ghost">Como funciona</CTAButton></a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-slate-400 text-sm">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Agente registrado (até 12 meses, se necessário)*</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Endereço físico (até 12 meses, se necessário)*</div>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Abertura + Operação</div>
            </div>
          </div>
          <div className="md:justify-self-end"><DemoCalculator /></div>
        </div>
      </div>
    </section>
  );
}
function Services() {
  const items = [
    { title: "Abertura de LLC (Florida)", desc: "Registro estatal, EIN, Operating Agreement e documentos digitais prontos para download." },
    { title: "Agente Registrado + Endereço físico", desc: "Recepção de correspondências por até 12 meses (quando necessário); após esse período, renovação cobrada. Repasse digital e alertas de compliance." },
    { title: "Onboarding legal & fiscal", desc: "Checklist, KYC/AML, enquadramento e orientações operacionais para plataformas." },
    { title: "Bookkeeping mensal (KASH FLOW 30)", desc: "Classificação contábil contínua. (Não inclui gestão de contratos.)" },
    { title: "Suporte contratual (KASH SCALE 5)", desc: "Até 5 contratos/mês. Operações com terceiros no Brasil." },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="servicos">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle eyebrow="Serviços KA$H" title="Tudo do registro à operação" subtitle="Feito para criadores brasileiros." />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <h3 className="text-slate-100 font-semibold">{it.title}</h3>
              <p className="text-slate-400 mt-2 text-sm">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Pricing({ onBuy, onBook }) {
  const plans = [
    { name: "Abertura de LLC", price: CONFIG.prices.llc, features: ["Registro Florida + Filing", "EIN + Operating Agreement", "Agente Registrado (até 12 meses, se necessário)", "Endereço físico (até 12 meses, se necessário)"], cta: "Comprar agora", onClick: onBuy, highlight: true },
    { name: "KASH FLOW 30 (Mensal)", price: CONFIG.prices.flow30, features: ["Classificação contábil contínua", "Relatórios mensais", "Suporte fiscal de rotina"], cta: "Assinar", onClick: onBuy },
    { name: "KASH SCALE 5 (Mensal)", price: CONFIG.prices.scale5, features: ["Até 5 contratos/mês", "Operações com terceiros no Brasil", "Prioridade de suporte"], cta: "Falar com especialista", onClick: onBook },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="planos">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle eyebrow="Planos & preços" title="Transparente e direto ao ponto" />
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div key={p.name} className={classNames("rounded-2xl p-6 border shadow-sm flex flex-col", p.highlight ? "border-emerald-400/30 bg-emerald-400/5" : "border-slate-800 bg-slate-900")}>
              <h3 className="text-slate-100 font-semibold">{p.name}</h3>
              <div className="text-3xl font-bold text-emerald-400 mt-2">{p.price}</div>
              <ul className="mt-4 space-y-2 text-slate-400 text-sm">{p.features.map((f) => (<li key={f} className="flex gap-2 items-start"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" /> {f}</li>))}</ul>
              <div className="mt-6"><CTAButton onClick={p.onClick}>{p.cta}</CTAButton></div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          * Agente registrado e endereço físico incluídos por até 12 meses, quando necessários. Após esse período, os serviços são cobrados.
        </p>
      </div>
    </section>
  );
}
function HowItWorks() {
  const steps = [
    { t: "Conhecimento do Serviço", d: "Use o simulador e leia o escopo." },
    { t: "Assinatura do contrato", d: "E-signature com termos, SLA e compliance." },
    { t: "Formulário de abertura", d: "Dados da empresa, sócios, KYC/AML." },
    { t: "Pagamento", d: "Fee e taxa estadual — checkout online." },
    { t: "Tracking do processo", d: "Número de protocolo e notificações por e-mail." },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="como-funciona">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle title="Como funciona" subtitle="Fluxo enxuto e auditável, do onboarding ao registro concluído." />
        <ol className="mt-10 grid md:grid-cols-5 gap-5">
          {steps.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-emerald-400 font-semibold">{String(i + 1).padStart(2, "0")}</div>
              <h4 className="text-slate-100 mt-2 font-medium">{s.t}</h4>
              <p className="text-slate-400 text-sm mt-1">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const initialForm = {
  company: { companyName: "", email: "", phone: "", address: "" },
  members: [
    { fullName: "", passport: "", issuer: "", expiry: "", share: "", phone: "", email: "", birthdate: "" },
    { fullName: "", passport: "", issuer: "", expiry: "", share: "", phone: "", email: "", birthdate: "" },
  ],
  accept: { responsibility: false, limitations: false },
  honeypot: "", // honeypot anti-spam (deve ficar vazio)
};
function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_COMPANY": {
      const { field, value } = action; if (!(field in state.company)) return state;
      if (state.company[field] === value) return state;
      return { ...state, company: { ...state.company, [field]: value } };
    }
    case "UPDATE_MEMBER": {
      const { index, field, value } = action; const members = state.members.slice();
      members[index] = { ...members[index], [field]: value }; return { ...state, members };
    }
    case "ADD_MEMBER": {
      return { ...state, members: [...state.members, { fullName: "", passport: "", issuer: "", expiry: "", share: "", phone: "", email: "", birthdate: "" }] };
    }
    case "REMOVE_MEMBER": {
      const { index } = action; if (state.members.length <= 2) return state;
      return { ...state, members: state.members.filter((_, i) => i !== index) };
    }
    case "TOGGLE_ACCEPT": {
      const { key, value } = action; return { ...state, accept: { ...state.accept, [key]: value } };
    }
    case "SET_HONEYPOT": {
      return { ...state, honeypot: action.value };
    }
    default: return state;
  }
}
function MemberCard({ index, data, onChange, onRemove, canRemove }) {
  return (
    <div className="p-4 border border-slate-700 rounded-xl bg-slate-800 space-y-2">
      <div className="flex items-center justify-between mb-1"><div className="text-slate-400 text-sm">Sócio {index + 1}</div>{canRemove && (<button onClick={onRemove} className="text-slate-400 hover:text-slate-200 text-xs">Remover</button>)}</div>
      <input className="w-full rounded bg-slate-900 px-3 py-2 text-slate-100" placeholder="Nome completo" value={data.fullName} onChange={(e) => onChange("fullName", e.target.value)} />
      <div className="grid md:grid-cols-2 gap-2">
        <input className="rounded bg-slate-900 px-3 py-2 text-slate-100" placeholder="Passaporte" value={data.passport} onChange={(e) => onChange("passport", e.target.value)} />
        <input className="rounded bg-slate-900 px-3 py-2 text-slate-100" placeholder="Emissor" value={data.issuer} onChange={(e) => onChange("issuer", e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <input type="date" className="rounded bg-slate-900 px-3 py-2 text-slate-100" value={data.expiry} onChange={(e) => onChange("expiry", e.target.value)} />
        <input type="number" min={0} max={100} step={0.01} className="rounded bg-slate-900 px-3 py-2 text-slate-100" placeholder="% Participação" value={data.share} onChange={(e) => onChange("share", e.target.value)} />
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <input type="tel" inputMode="tel" className="rounded bg-slate-900 px-3 py-2 text-slate-100" placeholder="Telefone" value={data.phone} onChange={(e) => onChange("phone", e.target.value)} />
        <input type="email" autoComplete="email" className="rounded bg-slate-900 px-3 py-2 text-slate-100" placeholder="E-mail" value={data.email} onChange={(e) => onChange("email", e.target.value)} />
      </div>
      <div><label className="block text-sm text-slate-400">Data de nascimento</label><input type="date" className="w-full rounded bg-slate-900 px-3 py-2 text-slate-100" value={data.birthdate} onChange={(e) => onChange("birthdate", e.target.value)} /></div>
    </div>
  );
}
function FormWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState("");
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const updateCompany = useCallback((field, value) => dispatch({ type: "UPDATE_COMPANY", field, value }), []);
  const updateMember = useCallback((index, field, value) => dispatch({ type: "UPDATE_MEMBER", index, field, value }), []);
  const addMember = useCallback(() => dispatch({ type: "ADD_MEMBER" }), []);
  const removeMember = useCallback((index) => dispatch({ type: "REMOVE_MEMBER", index }), []);
  const toggleAccept = useCallback((key, value) => dispatch({ type: "TOGGLE_ACCEPT", key, value }), []);
  const setHoneypot = useCallback((value) => dispatch({ type: "SET_HONEYPOT", value }), []);

  function validate() {
    const { company, members, accept, honeypot } = form;
    if (honeypot?.trim()) return "Falha na validação.";
    if (!company.companyName || company.companyName.trim().length < 3) return "Informe o nome da empresa (mín. 3).";
    if (!emailRe.test(company.email || "")) return "E-mail principal da empresa inválido.";
    if (!phoneRe.test(company.phone || "")) return "Telefone principal da empresa inválido.";
    if (!Array.isArray(members) || members.length < 2) return "É necessário ao menos 2 sócios.";
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || m.fullName.trim().length < 5) return `Sócio ${i + 1}: informe o nome completo.`;
      if (!m.passport) return `Sócio ${i + 1}: informe o número do passaporte.`;
      if (!m.issuer) return `Sócio ${i + 1}: informe o emissor do passaporte.`;
      if (!m.expiry) return `Sócio ${i + 1}: informe a validade do passaporte.`;
      const p = Number(m.share); if (!Number.isFinite(p) || p <= 0) return `Sócio ${i + 1}: percentual de participação inválido.`;
      if (!phoneRe.test(m.phone || "")) return `Sócio ${i + 1}: telefone inválido.`;
      if (!emailRe.test(m.email || "")) return `Sócio ${i + 1}: e-mail inválido.`;
      if (!m.birthdate) return `Sócio ${i + 1}: informe a data de nascimento.`;
      if (calcAgeFullDate(m.birthdate) < 18) return `Sócio ${i + 1} deve ter 18 anos ou mais.`;
    }
    if (!isPercentTotalValid(members)) return "A soma dos percentuais de participação deve ser 100%.";
    if (!accept.responsibility || !accept.limitations) return "É necessário aceitar as declarações de responsabilidade e limitações.";
    return "";
  }

  async function submit() {
    const err = validate();
    if (err) { alert(err); return; }

    setLoading(true);
    try {
      const protocol = genProtocol();
      const payload = {
        ...form,
        protocol,
        _subject: "Novo pedido: Abertura de LLC (KASH)",
        _origin: typeof window !== "undefined" ? window.location.href : "",
      };

      // Envio JSON para Formspree
      const res = await fetch(CONFIG.endpoints.formspree, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = Array.isArray(data?.errors) ? data.errors.map(e => e.message).join("; ") : `Erro ${res.status}`;
        throw new Error(msg);
      }

      setTracking(protocol);
      setStep(3);
    } catch (e) {
      alert("Falha ao enviar formulário: " + (e?.message || "erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  const { company, members, accept, honeypot } = form;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="text-slate-100 font-semibold">Onboarding de abertura</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">Fechar</button>
        </div>

        {step === 1 && (
          <div className="p-6">
            <h4 className="text-slate-100 font-medium">1/2 — Dados iniciais da LLC</h4>

            {/* honeypot invisível para bots */}
            <label className="sr-only" htmlFor="website">Website</label>
            <input id="website" name="website" autoComplete="off" tabIndex={-1}
              className="absolute opacity-0 pointer-events-none"
              value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

            <div className="mt-4 grid gap-4">
              <div><label className="block text-sm text-slate-400" htmlFor="companyName">Nome da LLC</label><input id="companyName" className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100" value={company.companyName} onChange={(e) => updateCompany("companyName", e.target.value)} /></div>
              <div><label className="block text-sm text-slate-400" htmlFor="companyEmail">E-mail principal</label><input id="companyEmail" type="email" autoComplete="email" className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100" value={company.email} onChange={(e) => updateCompany("email", e.target.value)} /></div>
              <div><label className="block text-sm text-slate-400" htmlFor="companyPhone">Telefone principal</label><input id="companyPhone" type="tel" inputMode="tel" className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100" value={company.phone} onChange={(e) => updateCompany("phone", e.target.value)} /></div>
              <div><label className="block text-sm text-slate-400" htmlFor="companyAddr">Endereço no Brasil</label><input id="companyAddr" className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100" value={company.address} onChange={(e) => updateCompany("address", e.target.value)} /></div>
            </div>

            <h4 className="mt-6 text-slate-100 font-medium">Sócios (mínimo 2)</h4>
            <div className="mt-2 space-y-4">
              {members.map((m, i) => (
                <MemberCard key={i} index={i} data={m} canRemove={members.length > 2}
                  onChange={(field, value) => updateMember(i, field, value)}
                  onRemove={() => removeMember(i)} />
              ))}
            </div>
            <button onClick={addMember} className="mt-4 text-emerald-400 hover:underline">+ Adicionar sócio</button>

            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={accept.responsibility} onChange={(e) => toggleAccept("responsibility", e.target.checked)} />
                <span>Declaro, sob minha responsabilidade, que todas as informações prestadas são verdadeiras e assumo total responsabilidade civil e legal por elas.</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={accept.limitations} onChange={(e) => toggleAccept("limitations", e.target.checked)} />
                <span>Estou ciente de que (i) o registro da LLC <strong>não</strong> implica contratação automática de serviços mensais de contabilidade; (ii) licenças/permissões especiais <strong>não</strong> fazem parte deste processo; e (iii) o mau uso da empresa poderá resultar em medidas judiciais.</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <CTAButton variant="ghost" onClick={() => setStep(1)}>Revisar</CTAButton>
              <CTAButton onClick={() => setStep(2)}>Continuar</CTAButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6">
            <h4 className="text-slate-100 font-medium">2/2 — Revisão e envio</h4>
            <pre className="bg-slate-950 p-4 rounded-xl text-slate-300 text-xs overflow-x-auto max-h-64">{JSON.stringify(form, null, 2)}</pre>
            <div className="mt-6 flex justify-end gap-3">
              <CTAButton variant="ghost" onClick={() => setStep(1)} disabled={loading}>Voltar</CTAButton>
              <CTAButton onClick={submit} disabled={loading}>{loading ? "Enviando..." : "Confirmar & gerar tracking"}</CTAButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center"><span className="text-2xl">✅</span></div>
            <h4 className="mt-4 text-slate-100 font-semibold">Pedido iniciado</h4>
            <div className="mt-2 text-emerald-400 text-xl font-bold">{tracking}</div>
            <p className="text-slate-500 text-xs mt-2">Guarde este código para acompanhar o status (checar e-mail de confirmação do envio).</p>
            <div className="mt-6"><CTAButton onClick={onClose}>Concluir</CTAButton></div>
          </div>
        )}
      </div>
    </div>
  );
}
function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
        <div className="flex items-center gap-3"><KLogo size={28} /> <span>© {new Date().getFullYear()} {CONFIG.brand.trade} — {CONFIG.brand.legal}</span></div>
        <div className="flex items-center gap-4">
          <a className="hover:text-slate-200" href="#servicos">Serviços</a>
          <a className="hover:text-slate-200" href="#planos">Planos</a>
          <a className="hover:text-slate-200" href="#como-funciona">Como funciona</a>
          <a className="hover:text-slate-200" href="#contato">Contato</a>
        </div>
      </div>
    </footer>
  );
}

export default function KashWebsite() {
  const [openWizard, setOpenWizard] = useState(false);
  const onStart = useCallback(() => setOpenWizard(true), []);
  const onBuy = useCallback(() => setOpenWizard(true), []);
  const onBook = useCallback(() => {
    if (CONFIG.contact.calendly) window.location.href = CONFIG.contact.calendly; else alert("Defina CONFIG.contact.calendly para agendar.");
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><KLogo size={32} /><div className="font-semibold text-slate-100">KA$H Solutions</div></div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="hover:text-emerald-400" href="#servicos">Serviços</a>
            <a className="hover:text-emerald-400" href="#planos">Planos</a>
            <a className="hover:text-emerald-400" href="#como-funciona">Como funciona</a>
          </nav>
          <div className="flex items-center gap-3"><CTAButton variant="ghost" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Contato</CTAButton><CTAButton onClick={onStart}>Começar</CTAButton></div>
        </div>
      </header>
      <Hero onStart={onStart} />
      <Services />
      <Pricing onBuy={onBuy} onBook={onBook} />
      <HowItWorks />
      <section id="contato" className="py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <SectionTitle title="Fale com a KA$H" subtitle="Tire dúvidas sobre o enquadramento ideal para o seu caso." />
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-100 font-medium">Consulta inicial</div>
              <p className="text-slate-400 text-sm mt-1">Agende uma conversa de 30 minutos.</p>
              <div className="mt-4"><CTAButton onClick={onBook}>Agendar</CTAButton></div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-100 font-medium">WhatsApp</div>
              <p className="text-slate-400 text-sm mt-1">Atendimento comercial.</p>
              <div className="mt-2 text-emerald-400">{CONFIG.contact.whatsapp}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-slate-100 font-medium">E-mail</div>
              <p className="text-slate-400 text-sm mt-1">Resposta em 1–2 dias úteis.</p>
              <div className="mt-2 text-emerald-400">{CONFIG.contact.email}</div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <FormWizard open={openWizard} onClose={() => setOpenWizard(false)} />
    </div>
  );
}

// Dev tests (console)
(function runDevTests(){
  try {
    console.assert(calcAgeFullDate('2010-01-01') < 18, 'Age: under 18 invalid');
    console.assert(calcAgeFullDate('1990-01-01') >= 18, 'Age: 18+ valid');
    console.assert(isPercentTotalValid([{share:50},{share:50}]) === true, 'Percent total 100 OK');
    console.assert(isPercentTotalValid([{share:60},{share:50}]) === false, 'Percent total not 100 fails');
  } catch(e) { console.warn('Dev tests error', e); }
})();
