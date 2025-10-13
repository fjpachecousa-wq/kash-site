import React from "react";

// ========= CONFIG =========
const PROCESSO_API = "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

// ========= HELPERS =========
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}
function safeStr(v) {
  return (v ?? "").toString().trim();
}
function getLocal(name, fallback = "") {
  try { return localStorage.getItem(name) ?? fallback; } catch { return fallback; }
}
function setLocal(name, val) {
  try { localStorage.setItem(name, val); } catch {}
}
function readTracking() {
  return safeStr(getLocal("last_tracking") || getLocal("kashId") || getLocal("tracking"));
}
function ensureKashId() {
  let k = readTracking();
  if (!k) {
    // gera provisório só para UI; o Apps Script devolverá/confirmará o definitivo
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    k = `KASH-${rand}`;
    setLocal("kashId", k);
    setLocal("last_tracking", k);
  }
  return k;
}

// ========= ESTADO INICIAL DO FORM =========
const emptyCompany = {
  companyName: "",
  tradeName: "",
  ein: "",
  email: "",
  phone: "",
  country: "",
  usAddress: { line1: "", line2: "", city: "", state: "", zip: "" },
};

const emptyMember = {
  fullName: "",
  email: "",
  phone: "",
  idOrPassport: "",
  address: "",
  birthdate: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE_COMPANY":
      return { ...state, company: { ...state.company, [action.field]: action.value } };
    case "UPDATE_US_ADDRESS":
      return {
        ...state,
        company: { 
          ...state.company, 
          usAddress: { ...state.company.usAddress, [action.field]: action.value } 
        }
      };
    case "UPDATE_MEMBER":
      return {
        ...state,
        members: state.members.map((m, i) =>
          i === action.index ? { ...m, [action.field]: action.value } : m
        ),
      };
    case "ADD_MEMBER":
      return { ...state, members: [...state.members, { ...emptyMember }] };
    case "REMOVE_MEMBER":
      return { ...state, members: state.members.filter((_, i) => i !== action.index) };
    default:
      return state;
  }
}

// ========= API =========
async function apiUpsertFull({ kashId, company, members, consent }) {
  const payload = {
    action: "upsert",
    kashId,
    company,
    members,
    accepts: { consent: !!consent },
    faseAtual: "Recebido",
    subFase: "Dados coletados",
    consentAt: new Date().toISOString(),
    consentTextVersion: "v2025-10-11",
    source: "kashsolutions.us",
  };

  const res = await fetch(PROCESSO_API, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json", "X-Requested-With": "fetch" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  // tenta extrair tracking da resposta
  const match = text.match(/KASH-[A-Z0-9]{6,}/i);
  if (match) {
    const tk = match[0].toUpperCase();
    setLocal("last_tracking", tk);
    setLocal("kashId", tk);
    setLocal("tracking", tk);
  }
  if (!res.ok) {
    throw new Error(`Apps Script respondeu ${res.status} - ${text}`);
  }
  return text;
}

// ========= COMPONENTES BÁSICOS =========
function Section({ title, subtitle, children }) {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={classNames(
        "w-full rounded-md bg-slate-800/80 border border-slate-700 px-3 py-2 text-slate-100 placeholder-slate-500",
        props.className
      )}
    />
  );
}

function CTAButton({ children, disabled, variant = "primary", ...rest }) {
  const base = "px-4 py-2 rounded-md text-sm font-medium transition";
  const theme =
    variant === "ghost"
      ? "bg-transparent text-slate-200 hover:bg-slate-700/40 border border-slate-600"
      : disabled
      ? "bg-emerald-700/50 text-emerald-100 cursor-not-allowed"
      : "bg-emerald-600 hover:bg-emerald-500 text-white";
  return (
    <button disabled={disabled} className={`${base} ${theme}`} {...rest}>
      {children}
    </button>
  );
}

// ========= MODAL =========
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

// ========= APP =========
export default function App() {
  // form state
  const [form, dispatch] = React.useReducer(reducer, {
    company: { ...emptyCompany },
    members: [{ ...emptyMember }],
  });

  // ui state
  const [step, setStep] = React.useState(0); // 0: form, 1: review/consent, 2: success
  const [consent, setConsent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [confirmTracking, setConfirmTracking] = React.useState(readTracking());

  const kashId = React.useMemo(ensureKashId, []);

  // handlers
  function updateCompany(field, value) {
    dispatch({ type: "UPDATE_COMPANY", field, value });
  }
  function updateUS(field, value) {
    dispatch({ type: "UPDATE_US_ADDRESS", field, value });
  }
  function updateMember(ix, field, value) {
    dispatch({ type: "UPDATE_MEMBER", index: ix, field, value });
  }
  function addMember() {
    dispatch({ type: "ADD_MEMBER" });
  }
  function removeMember(ix) {
    dispatch({ type: "REMOVE_MEMBER", index: ix });
  }

  async function handleSubmit() {
    if (!consent) return;
    setSending(true);
    try {
      const company = {
        companyName: safeStr(form.company.companyName),
        tradeName: safeStr(form.company.tradeName),
        ein: safeStr(form.company.ein),
        email: safeStr(form.company.email),
        phone: safeStr(form.company.phone),
        country: safeStr(form.company.country),
        usAddress: {
          line1: safeStr(form.company.usAddress.line1),
          line2: safeStr(form.company.usAddress.line2),
          city: safeStr(form.company.usAddress.city),
          state: safeStr(form.company.usAddress.state),
          zip: safeStr(form.company.usAddress.zip),
        },
      };
      const members = (form.members || []).map((m) => ({
        fullName: safeStr(m.fullName),
        email: safeStr(m.email),
        phone: safeStr(m.phone),
        idOrPassport: safeStr(m.idOrPassport),
        address: safeStr(m.address),
        birthdate: safeStr(m.birthdate),
      }));

      await apiUpsertFull({ kashId, company, members, consent: true });
      const tk = readTracking() || kashId;
      setConfirmTracking(tk);
      setStep(2); // sucesso
    } catch (err) {
      alert("Falha ao enviar os dados. Tente novamente.\n\n" + (err?.message || err));
    } finally {
      setSending(false);
    }
  }

  // ========= UI =========
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Cabeçalho simples */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold">KASH Solutions</div>
          <div className="text-xs text-slate-400">Tracking: {confirmTracking || kashId}</div>
        </div>
      </header>

      {/* Formulário */}
      <main>
        <Section
          title="Abertura de Empresa"
          subtitle="Preencha os dados abaixo. Você confirmará e autorizará o envio no próximo passo."
        >
          {/* COMPANY */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nome da Empresa">
                <Input
                  placeholder="Razão social"
                  value={form.company.companyName}
                  onChange={(e) => updateCompany("companyName", e.target.value)}
                />
              </Field>
              <Field label="Nome Fantasia">
                <Input
                  placeholder="Nome fantasia"
                  value={form.company.tradeName}
                  onChange={(e) => updateCompany("tradeName", e.target.value)}
                />
              </Field>
              <Field label="E-mail da Empresa">
                <Input
                  placeholder="contato@empresa.com"
                  value={form.company.email}
                  onChange={(e) => updateCompany("email", e.target.value)}
                />
              </Field>
              <Field label="Telefone da Empresa">
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={form.company.phone}
                  onChange={(e) => updateCompany("phone", e.target.value)}
                />
              </Field>
              <Field label="País">
                <Input
                  placeholder="País de origem"
                  value={form.company.country}
                  onChange={(e) => updateCompany("country", e.target.value)}
                />
              </Field>
            </div>

            {/* US ADDRESS */}
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Endereço (linha 1)">
                <Input
                  placeholder="Rua, número"
                  value={form.company.usAddress.line1}
                  onChange={(e) => updateUS("line1", e.target.value)}
                />
              </Field>
              <Field label="Endereço (linha 2)">
                <Input
                  placeholder="Complemento (opcional)"
                  value={form.company.usAddress.line2}
                  onChange={(e) => updateUS("line2", e.target.value)}
                />
              </Field>
              <Field label="Cidade">
                <Input
                  value={form.company.usAddress.city}
                  onChange={(e) => updateUS("city", e.target.value)}
                />
              </Field>
              <Field label="Estado (US)">
                <Input
                  value={form.company.usAddress.state}
                  onChange={(e) => updateUS("state", e.target.value)}
                />
              </Field>
              <Field label="ZIP">
                <Input
                  value={form.company.usAddress.zip}
                  onChange={(e) => updateUS("zip", e.target.value)}
                />
              </Field>
            </div>

            {/* MEMBERS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Sócios / Membros</div>
                <CTAButton variant="ghost" onClick={addMember}>Adicionar membro</CTAButton>
              </div>
              <div className="space-y-4">
                {form.members.map((m, idx) => (
                  <div key={idx} className="p-4 border border-slate-800 rounded-lg bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-slate-300 font-medium">Membro {idx + 1}</div>
                      {form.members.length > 1 && (
                        <button
                          className="text-xs text-slate-400 hover:text-slate-200"
                          onClick={() => removeMember(idx)}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Field label="Nome completo">
                        <Input
                          value={m.fullName}
                          onChange={(e) => updateMember(idx, "fullName", e.target.value)}
                        />
                      </Field>
                      <Field label="E-mail">
                        <Input
                          value={m.email}
                          onChange={(e) => updateMember(idx, "email", e.target.value)}
                        />
                      </Field>
                      <Field label="Telefone">
                        <Input
                          value={m.phone}
                          onChange={(e) => updateMember(idx, "phone", e.target.value)}
                        />
                      </Field>
                      <Field label="Documento (ID/Passaporte)">
                        <Input
                          value={m.idOrPassport}
                          onChange={(e) => updateMember(idx, "idOrPassport", e.target.value)}
                        />
                      </Field>
                      <Field label="Endereço completo">
                        <Input
                          value={m.address}
                          onChange={(e) => updateMember(idx, "address", e.target.value)}
                        />
                      </Field>
                      <Field label="Data de Nascimento (YYYY-MM-DD)">
                        <Input
                          value={m.birthdate}
                          onChange={(e) => updateMember(idx, "birthdate", e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <CTAButton onClick={() => setStep(1)}>Conferir e Enviar</CTAButton>
            </div>
          </div>
        </Section>
      </main>

      {/* MODAL: REVIEW + CONSENT */}
      <Modal open={step === 1} onClose={() => setStep(0)}>
        <div className="p-6">
          <div className="text-lg font-semibold">Conferência dos dados</div>
          <p className="text-slate-400 text-sm mt-1">
            Revise as informações abaixo. Para prosseguir, é necessário autorizar a conferência.
          </p>

          <div className="mt-4 space-y-4">
            <div className="border border-slate-800 rounded-lg p-4">
              <div className="text-slate-300 font-medium mb-1">Empresa</div>
              <div className="text-sm text-slate-400 space-y-1">
                <div><span className="text-slate-500">Nome:</span> {form.company.companyName || "-"}</div>
                <div><span className="text-slate-500">Fantasia:</span> {form.company.tradeName || "-"}</div>
                <div><span className="text-slate-500">E-mail:</span> {form.company.email || "-"}</div>
                <div><span className="text-slate-500">Telefone:</span> {form.company.phone || "-"}</div>
                <div><span className="text-slate-500">País:</span> {form.company.country || "-"}</div>
                <div><span className="text-slate-500">Endereço US:</span> {[
                  form.company.usAddress.line1,
                  form.company.usAddress.line2,
                  form.company.usAddress.city,
                  form.company.usAddress.state,
                  form.company.usAddress.zip
                ].filter(Boolean).join(", ") || "-"}</div>
              </div>
            </div>

            <div className="border border-slate-800 rounded-lg p-4">
              <div className="text-slate-300 font-medium mb-1">Membros</div>
              <div className="text-sm text-slate-400 space-y-2">
                {form.members.map((m, i) => (
                  <div key={i} className="border border-slate-800 rounded p-3">
                    <div><span className="text-slate-500">Nome:</span> {m.fullName || "-"}</div>
                    <div><span className="text-slate-500">E-mail:</span> {m.email || "-"}</div>
                    <div><span className="text-slate-500">Telefone:</span> {m.phone || "-"}</div>
                    <div><span className="text-slate-500">Doc:</span> {m.idOrPassport || "-"}</div>
                    <div><span className="text-slate-500">Endereço:</span> {m.address || "-"}</div>
                    <div><span className="text-slate-500">Nascimento:</span> {m.birthdate || "-"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CONSENTIMENTO (obrigatório) */}
            <label className="flex items-start gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-slate-300">
                Estou ciente de que as informações serão usadas para abertura e registro empresarial. <br/>
                <span className="font-medium">
                  Autorizo a KASH Corporate Solutions a conferir e validar as informações fornecidas para fins de abertura e registro da empresa.
                </span>
              </span>
            </label>

            <div className="flex items-center justify-between">
              <CTAButton variant="ghost" onClick={() => setStep(0)}>Voltar</CTAButton>
              <CTAButton disabled={!consent || sending} onClick={handleSubmit}>
                {sending ? "Enviando..." : "Confirmar envio"}
              </CTAButton>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: SUCESSO / TRACKING */}
      <Modal open={step === 2} onClose={() => {}}>
        <div className="p-6">
          <div className="text-lg font-semibold">Aplicação recebida</div>
          <p className="text-slate-400 text-sm mt-1">
            A equipe KASH analisará as informações e enviará o link de pagamento e contrato por e-mail em até 48 horas.
          </p>
          <div className="mt-4 border border-emerald-700/40 bg-emerald-900/20 rounded-lg p-4">
            <div className="text-sm text-slate-400">Tracking Number</div>
            <div className="text-xl font-mono">{confirmTracking || readTracking() || ensureKashId()}</div>
          </div>
          <div className="mt-4 flex justify-end">
            <CTAButton onClick={() => setStep(0)}>Concluir</CTAButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}