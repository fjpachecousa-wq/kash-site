// src/App.jsx
import React, { useEffect, useMemo, useReducer, useState } from "react";

/**
 * KASH Solutions - Single file App.jsx
 * - Coleta de consentimento no modal de conferência (antes do envio)
 * - Removido "Li e Concordo" na tela de tracking
 * - Envio completo (company + members) para Google Sheets (Apps Script)
 * - Sem pagamento/contrato neste fluxo
 * - Geração e exibição do Tracking Number ao final
 */

/* =========================
   Configurações do Site
   ========================= */
const CONFIG = {
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
  contact: { whatsapp: "", email: "contato@kashsolutions.us", calendly: "" },
  // URL pública do Apps Script
  appsScriptUrl:
    "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec",
};

/* =========================
   Utilitários de Tracking
   ========================= */
function _rand4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1)
    .toUpperCase();
}
function _genTracking() {
  // Ex: KASH-2025-AB12-CD34
  const now = new Date();
  const y = now.getFullYear();
  return `KASH-${y}-${_rand4()}-${_rand4()}`;
}
function _readTrackingCode() {
  try {
    const v = localStorage.getItem("kash_tracking");
    return v || "";
  } catch {
    return "";
  }
}
function _saveTrackingCode(code) {
  try {
    localStorage.setItem("kash_tracking", code || "");
  } catch {
    /* noop */
  }
}

/* =========================
   Utilitários de KashId
   ========================= */
function getKashId() {
  try {
    return localStorage.getItem("kash_id") || "";
  } catch {
    return "";
  }
}
function setKashId(v) {
  try {
    localStorage.setItem("kash_id", v);
  } catch {
    /* noop */
  }
}
function getOrCreateKashId() {
  let id = getKashId();
  if (!id) {
    id = _genTracking(); // usa o mesmo formato para simplificar
    setKashId(id);
  }
  return id;
}

/* =========================
   Form State (empresa + membros)
   ========================= */
const initialForm = {
  company: {
    companyName: "",
    email: "",
    phone: "",
    einOrItin: "",
    usAddress: {
      street: "",
      number: "",
      complement: "",
      city: "",
      state: "",
      zip: "",
    },
    activityDescription: "",
  },
  members: [
    {
      fullName: "",
      email: "",
      phone: "",
      idOrPassport: "",
      address: "",
      role: "",
    },
  ],
};

function formReducer(state, action) {
  switch (action.type) {
    case "SET_COMPANY_FIELD":
      return {
        ...state,
        company: { ...state.company, [action.field]: action.value },
      };
    case "SET_USADDR_FIELD":
      return {
        ...state,
        company: {
          ...state.company,
          usAddress: { ...state.company.usAddress, [action.field]: action.value },
        },
      };
    case "ADD_MEMBER":
      return {
        ...state,
        members: [
          ...state.members,
          {
            fullName: "",
            email: "",
            phone: "",
            idOrPassport: "",
            address: "",
            role: "",
          },
        ],
      };
    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.filter((_, idx) => idx !== action.index),
      };
    case "SET_MEMBER_FIELD":
      return {
        ...state,
        members: state.members.map((m, idx) =>
          idx === action.index ? { ...m, [action.field]: action.value } : m
        ),
      };
    case "RESET":
      return initialForm;
    default:
      return state;
  }
}

/* =========================
   UI Helpers
   ========================= */
function Section({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700 p-5">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <div className="text-sm text-slate-300 mb-1">{label}</div>
      {children}
    </label>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
        (props.className || "")
      }
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={
        "w-full min-h-[90px] rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 " +
        (props.className || "")
      }
    />
  );
}

function CTAButton({ children, variant = "primary", ...rest }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
  const map = {
    primary:
      base +
      " bg-emerald-500 text-emerald-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      base +
      " bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700/70",
  };
  return (
    <button {...rest} className={map[variant]}>
      {children}
    </button>
  );
}

/* =========================
   API - Envio Completo
   ========================= */
async function apiUpsertFull({
  kashId,
  company,
  members,
  consent,
  source = "kashsolutions.us",
}) {
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
    source,
  };

  const res = await fetch(CONFIG.appsScriptUrl, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json", "X-Requested-With": "fetch" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  // Apps Script normalmente retorna texto. Tentamos JSON, mas caímos em texto puro se falhar.
  try {
    const json = JSON.parse(text);
    return { ok: res.ok, status: res.status, data: json, raw: text };
  } catch {
    return { ok: res.ok, status: res.status, data: null, raw: text };
  }
}

/* =========================
   Modal Genérico
   ========================= */
function Modal({ open, onClose, children, maxWidth = "max-w-2xl" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth}`}>
        <div className="rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================
   App
   ========================= */
export default function App() {
  const [form, dispatch] = useReducer(formReducer, initialForm);

  // Etapas
  const [step, setStep] = useState(1);

  // Modal de conferência e envio
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);

  // Modal final (tracking)
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [confirmTracking, setConfirmTracking] = useState("");

  // Carrega tracking existente (se houver)
  useEffect(() => {
    const t = _readTrackingCode();
    if (t) setConfirmTracking(t);
  }, []);

  const membersSafe = Array.isArray(form.members) ? form.members : [];
  const companySafe = useMemo(() => form.company || initialForm.company, [form]);

  // Campos "prontos" para envio
  const normalized = useMemo(
    () => ({
      company: {
        companyName: (companySafe.companyName || "").trim(),
        email: (companySafe.email || "").trim(),
        phone: (companySafe.phone || "").trim(),
        einOrItin: (companySafe.einOrItin || "").trim(),
        usAddress: {
          street: (companySafe.usAddress?.street || "").trim(),
          number: (companySafe.usAddress?.number || "").trim(),
          complement: (companySafe.usAddress?.complement || "").trim(),
          city: (companySafe.usAddress?.city || "").trim(),
          state: (companySafe.usAddress?.state || "").trim(),
          zip: (companySafe.usAddress?.zip || "").trim(),
        },
        activityDescription: (companySafe.activityDescription || "").trim(),
      },
      members: membersSafe.map((m) => ({
        fullName: (m.fullName || "").trim(),
        email: (m.email || "").trim(),
        phone: (m.phone || "").trim(),
        idOrPassport: (m.idOrPassport || "").trim(),
        address: (m.address || "").trim(),
        role: (m.role || "").trim(),
      })),
    }),
    [companySafe, membersSafe]
  );

  async function handleSubmit() {
    if (!consent) return; // não envia sem consentimento

    setSending(true);
    try {
      const kashId = getOrCreateKashId();
      const tracking = _genTracking(); // gera um novo tracking para esta submissão
      _saveTrackingCode(tracking);

      const r = await apiUpsertFull({
        kashId,
        company: normalized.company,
        members: normalized.members,
        consent: true,
      });

      // Se o endpoint respondeu OK, abrimos o modal final
      if (r.ok) {
        setConfirmTracking(tracking);
        setShowConfirmModal(false);
        setShowDoneModal(true);
        setStep(3); // etapa final
      } else {
        alert(
          "Não foi possível enviar sua aplicação no momento. Tente novamente mais tarde."
        );
      }
    } catch (e) {
      alert("Ocorreu um erro no envio. Verifique sua conexão e tente novamente.");
    } finally {
      setSending(false);
    }
  }

  /* =========================
     UI - Etapas
     1) Formulário
     2) Rever dados e consentimento (em modal)
     3) Tracking (sucesso)
     ========================= */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header simples */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-lg font-bold">{CONFIG.brand.trade}</div>
          <div className="text-xs text-slate-400">
            {CONFIG.brand.legal} &middot; Florida
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Etapa 1: Formulário */}
        <Section
          title="Aplicação de abertura de empresa"
          subtitle="Preencha os dados da empresa e dos membros."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome da Empresa">
              <Input
                value={companySafe.companyName}
                onChange={(e) =>
                  dispatch({
                    type: "SET_COMPANY_FIELD",
                    field: "companyName",
                    value: e.target.value,
                  })
                }
                placeholder="Ex.: KASH Solutions LLC"
              />
            </Field>
            <Field label="E-mail principal">
              <Input
                type="email"
                value={companySafe.email}
                onChange={(e) =>
                  dispatch({
                    type: "SET_COMPANY_FIELD",
                    field: "email",
                    value: e.target.value,
                  })
                }
                placeholder="email@empresa.com"
              />
            </Field>
            <Field label="Telefone principal">
              <Input
                value={companySafe.phone}
                onChange={(e) =>
                  dispatch({
                    type: "SET_COMPANY_FIELD",
                    field: "phone",
                    value: e.target.value,
                  })
                }
                placeholder="+1 (555) 000-0000"
              />
            </Field>
            <Field label="EIN/ITIN (se houver)">
              <Input
                value={companySafe.einOrItin}
                onChange={(e) =>
                  dispatch({
                    type: "SET_COMPANY_FIELD",
                    field: "einOrItin",
                    value: e.target.value,
                  })
                }
                placeholder="Opcional neste momento"
              />
            </Field>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Endereço - Rua">
              <Input
                value={companySafe.usAddress.street}
                onChange={(e) =>
                  dispatch({
                    type: "SET_USADDR_FIELD",
                    field: "street",
                    value: e.target.value,
                  })
                }
                placeholder="Street"
              />
            </Field>
            <Field label="Número">
              <Input
                value={companySafe.usAddress.number}
                onChange={(e) =>
                  dispatch({
                    type: "SET_USADDR_FIELD",
                    field: "number",
                    value: e.target.value,
                  })
                }
                placeholder="Number"
              />
            </Field>
            <Field label="Complemento">
              <Input
                value={companySafe.usAddress.complement}
                onChange={(e) =>
                  dispatch({
                    type: "SET_USADDR_FIELD",
                    field: "complement",
                    value: e.target.value,
                  })
                }
                placeholder="Apt, Suite..."
              />
            </Field>
            <Field label="Cidade">
              <Input
                value={companySafe.usAddress.city}
                onChange={(e) =>
                  dispatch({
                    type: "SET_USADDR_FIELD",
                    field: "city",
                    value: e.target.value,
                  })
                }
                placeholder="City"
              />
            </Field>
            <Field label="Estado">
              <Input
                value={companySafe.usAddress.state}
                onChange={(e) =>
                  dispatch({
                    type: "SET_USADDR_FIELD",
                    field: "state",
                    value: e.target.value,
                  })
                }
                placeholder="FL"
              />
            </Field>
            <Field label="ZIP">
              <Input
                value={companySafe.usAddress.zip}
                onChange={(e) =>
                  dispatch({
                    type: "SET_USADDR_FIELD",
                    field: "zip",
                    value: e.target.value,
                  })
                }
                placeholder="00000"
              />
            </Field>
          </div>

          <div className="mt-6">
            <Field label="Descrição da atividade (breve)">
              <TextArea
                value={companySafe.activityDescription}
                onChange={(e) =>
                  dispatch({
                    type: "SET_COMPANY_FIELD",
                    field: "activityDescription",
                    value: e.target.value,
                  })
                }
                placeholder="Descreva sua atividade principal..."
              />
            </Field>
          </div>

          {/* Membros */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Membros</h3>
              <CTAButton
                variant="ghost"
                onClick={() => dispatch({ type: "ADD_MEMBER" })}
              >
                Adicionar membro
              </CTAButton>
            </div>

            <div className="space-y-4">
              {membersSafe.map((m, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-700 p-4 bg-slate-900/60"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-slate-300">
                      Membro #{idx + 1}
                    </div>
                    {membersSafe.length > 1 && (
                      <button
                        onClick={() =>
                          dispatch({ type: "REMOVE_MEMBER", index: idx })
                        }
                        className="text-xs text-red-300 hover:text-red-200"
                        type="button"
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome completo">
                      <Input
                        value={m.fullName}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_MEMBER_FIELD",
                            index: idx,
                            field: "fullName",
                            value: e.target.value,
                          })
                        }
                        placeholder="Nome completo"
                      />
                    </Field>
                    <Field label="E-mail">
                      <Input
                        type="email"
                        value={m.email}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_MEMBER_FIELD",
                            index: idx,
                            field: "email",
                            value: e.target.value,
                          })
                        }
                        placeholder="email@exemplo.com"
                      />
                    </Field>
                    <Field label="Telefone">
                      <Input
                        value={m.phone}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_MEMBER_FIELD",
                            index: idx,
                            field: "phone",
                            value: e.target.value,
                          })
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                    </Field>
                    <Field label="Documento (ID/Passaporte)">
                      <Input
                        value={m.idOrPassport}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_MEMBER_FIELD",
                            index: idx,
                            field: "idOrPassport",
                            value: e.target.value,
                          })
                        }
                        placeholder="ID ou Passaporte"
                      />
                    </Field>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Endereço completo">
                      <Input
                        value={m.address}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_MEMBER_FIELD",
                            index: idx,
                            field: "address",
                            value: e.target.value,
                          })
                        }
                        placeholder="Rua, número, cidade, estado, país"
                      />
                    </Field>
                    <Field label="Função (ex.: Membro, Manager)">
                      <Input
                        value={m.role}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_MEMBER_FIELD",
                            index: idx,
                            field: "role",
                            value: e.target.value,
                          })
                        }
                        placeholder="Role"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações do formulário */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <CTAButton
              variant="primary"
              onClick={() => {
                // Abre modal de conferência
                setConsent(false);
                setShowConfirmModal(true);
              }}
            >
              Conferir e enviar
            </CTAButton>
          </div>
        </Section>

        {/* Etapa 3: Tracking (sucesso) - aparece após envio */}
        {step === 3 && (
          <Section
            title="Aplicação enviada com sucesso"
            subtitle="Guarde seu código de acompanhamento (Tracking Number)."
          >
            <div className="space-y-4">
              <div className="text-slate-300">
                Sua aplicação foi recebida. A equipe KASH analisará as
                informações e enviará o link de pagamento e contrato por e-mail
                em até 48 horas.
              </div>
              <div className="rounded-lg border border-emerald-600 bg-emerald-500/10 p-4">
                <div className="text-xs uppercase tracking-wide text-emerald-400">
                  Tracking Number
                </div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">
                  {confirmTracking || _readTrackingCode() || "N/A"}
                </div>
              </div>
            </div>
          </Section>
        )}
      </main>

      {/* Modal de conferência + consentimento */}
      <Modal
        open={showConfirmModal}
        onClose={() => {
          if (!sending) setShowConfirmModal(false);
        }}
        maxWidth="max-w-3xl"
      >
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Conferência dos dados</h3>
              <p className="text-sm text-slate-400 mt-1">
                Revise os dados abaixo. Se estiver tudo correto, marque o
                consentimento e confirme o envio.
              </p>
            </div>
            <button
              className="text-slate-400 hover:text-white"
              onClick={() => !sending && setShowConfirmModal(false)}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Resumo dos dados */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-700 p-4 bg-slate-900/60">
              <div className="text-sm font-semibold mb-3">Empresa</div>
              <div className="space-y-1 text-sm text-slate-300">
                <div>
                  <span className="text-slate-400">Nome: </span>
                  {normalized.company.companyName || "-"}
                </div>
                <div>
                  <span className="text-slate-400">E-mail: </span>
                  {normalized.company.email || "-"}
                </div>
                <div>
                  <span className="text-slate-400">Telefone: </span>
                  {normalized.company.phone || "-"}
                </div>
                <div>
                  <span className="text-slate-400">EIN/ITIN: </span>
                  {normalized.company.einOrItin || "-"}
                </div>
                <div className="mt-2">
                  <div className="text-slate-400">Endereço (EUA)</div>
                  <div>
                    {[
                      normalized.company.usAddress.street,
                      normalized.company.usAddress.number,
                      normalized.company.usAddress.complement,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </div>
                  <div>
                    {[
                      normalized.company.usAddress.city,
                      normalized.company.usAddress.state,
                      normalized.company.usAddress.zip,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-slate-400">Atividade</div>
                  <div>{normalized.company.activityDescription || "-"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 p-4 bg-slate-900/60">
              <div className="text-sm font-semibold mb-3">Membros</div>
              <div className="space-y-3 text-sm text-slate-300">
                {normalized.members.length === 0 && <div>-</div>}
                {normalized.members.map((m, i) => (
                  <div key={i} className="pb-3 border-b border-slate-800 last:border-0">
                    <div>
                      <span className="text-slate-400">Nome: </span>
                      {m.fullName || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">E-mail: </span>
                      {m.email || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Telefone: </span>
                      {m.phone || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Documento: </span>
                      {m.idOrPassport || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Endereço: </span>
                      {m.address || "-"}
                    </div>
                    <div>
                      <span className="text-slate-400">Função: </span>
                      {m.role || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Consentimento (logo acima do botão) */}
          <div className="mt-5 rounded-lg border border-slate-700 p-4 bg-slate-900/60">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-300 leading-relaxed">
                Estou ciente de que as informações fornecidas serão utilizadas
                para abertura e registro da empresa na Flórida. <br />
                <strong className="text-slate-200">
                  Autorizo a KASH Corporate Solutions a conferir e validar as
                  informações fornecidas para fins de abertura e registro da
                  empresa.
                </strong>
              </span>
            </label>

            <div className="mt-4 flex items-center justify-end gap-2">
              <CTAButton
                variant="ghost"
                onClick={() => !sending && setShowConfirmModal(false)}
              >
                Voltar
              </CTAButton>
              <CTAButton disabled={!consent || sending} onClick={handleSubmit}>
                {sending ? "Enviando..." : "Confirmar Envio"}
              </CTAButton>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de sucesso com Tracking (sem checkbox, sem pagamento, sem contrato) */}
      <Modal
        open={showDoneModal}
        onClose={() => setShowDoneModal(false)}
        maxWidth="max-w-lg"
      >
        <div className="p-6">
          <div className="text-lg font-semibold">Aplicação enviada</div>
          <p className="text-sm text-slate-400 mt-1">
            Sua aplicação foi recebida. Anote o código de acompanhamento.
          </p>

          <div className="mt-4 rounded-lg border border-emerald-600 bg-emerald-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald-400">
              Tracking Number
            </div>
            <div className="text-2xl font-bold text-emerald-300 mt-1">
              {confirmTracking || _readTrackingCode() || "N/A"}
            </div>
          </div>

          <div className="mt-4 text-sm text-slate-300">
            A equipe KASH analisará as informações e enviará o link de
            pagamento e contrato por e-mail em até 48 horas.
          </div>

          <div className="mt-6 flex items-center justify-end">
            <CTAButton variant="primary" onClick={() => setShowDoneModal(false)}>
              Fechar
            </CTAButton>
          </div>
        </div>
      </Modal>

      {/* Footer simples */}
      <footer className="mt-16 border-t border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-4 text-xs text-slate-500">
          {CONFIG.brand.legal} &middot; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}