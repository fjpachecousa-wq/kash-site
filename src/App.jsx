import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

/**
 * App.jsx — página completa (único arquivo) com:
 * - Landing/resumo de serviços (sem botões de compra)
 * - Formulário de aplicação (empresa + membros)
 * - Modal de conferência com consentimento obrigatório
 * - Envio completo (company + members + consent) para Google Apps Script
 * - Tela/Modal final apenas com Tracking e mensagem de sucesso
 *
 * Importante:
 * - Nenhuma referência a contratos PT/EN ou Formspree.
 * - Nenhum CTA de pagamento nesta etapa.
 * - Evita caracteres Unicode problemáticos em template literals.
 * - Tag JSX sempre balanceada. Sem "try" perdido dentro de JSX.
 */

/* =========================
   CONFIG / CONSTANTES
   ========================= */
if (typeof window !== "undefined") {
  window.CONFIG = window.CONFIG || {};
  // URL publicada do Apps Script (ajuste apenas se necessário):
  if (!window.CONFIG.appsScriptUrl) {
    window.CONFIG.appsScriptUrl =
      "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";
  }
}

const PROCESSO_API =
  (typeof window !== "undefined" && window.CONFIG?.appsScriptUrl) || "";

const CONFIG = {
  company: {
    legal: "KASH CORPORATE SOLUTIONS LLC",
    trade: "KASH Solutions",
  },
  contact: {
    email: "contato@kashsolutions.us",
    calendly: "",
    whatsapp: "",
  },
  prices: {
    llc: "US$ 1,360",
    flow30: "US$ 300",
    scale5: "US$ 1,000",
  },
};

/* =========================
   UTIL: STORAGE / TRACKING
   ========================= */
function readState() {
  try {
    const raw = localStorage.getItem("kashState");
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}
function writeState(obj) {
  try {
    localStorage.setItem("kashState", JSON.stringify(obj || {}));
  } catch (_) {}
}

function getKashId() {
  try {
    const st = readState();
    return st?.kashId || "";
  } catch (_) {
    return "";
  }
}
function setKashId(kashId) {
  const curr = readState();
  curr.kashId = kashId;
  writeState(curr);
}

function generateKashId() {
  // Exemplo: KASH-20251013-1530-ABC123
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ymd =
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "-" +
    pad(d.getHours()) +
    pad(d.getMinutes());
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KASH-${ymd}-${rnd}`;
}

/* =========================
   UTIL: FORM NORMALIZATION
   ========================= */
function trimStr(v) {
  return typeof v === "string" ? v.trim() : v;
}
function normalizeCompany(c) {
  const base = {
    companyName: "",
    ein: "",
    state: "",
    email: "",
    phone: "",
    usAddress: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },
    intlAddress: "",
    website: "",
    notes: "",
  };
  const out = { ...base, ...(c || {}) };
  out.companyName = trimStr(out.companyName);
  out.ein = trimStr(out.ein);
  out.state = trimStr(out.state);
  out.email = trimStr(out.email);
  out.phone = trimStr(out.phone);
  if (out.usAddress && typeof out.usAddress === "object") {
    out.usAddress = {
      street: trimStr(out.usAddress.street),
      city: trimStr(out.usAddress.city),
      state: trimStr(out.usAddress.state),
      zip: trimStr(out.usAddress.zip),
    };
  } else {
    out.usAddress = { street: "", city: "", state: "", zip: "" };
  }
  out.intlAddress = trimStr(out.intlAddress);
  out.website = trimStr(out.website);
  out.notes = trimStr(out.notes);
  return out;
}
function normalizeMember(m) {
  const base = {
    fullName: "",
    email: "",
    role: "",
    phone: "",
    idOrPassport: "",
    address: "",
  };
  const v = { ...base, ...(m || {}) };
  v.fullName = trimStr(v.fullName);
  v.email = trimStr(v.email);
  v.role = trimStr(v.role);
  v.phone = trimStr(v.phone);
  v.idOrPassport = trimStr(v.idOrPassport);
  v.address = trimStr(v.address);
  return v;
}
function normalizeMembers(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeMember).filter((m) => m.fullName || m.email);
}

/* =========================
   REDUCER DO FORMULÁRIO
   ========================= */
const initialForm = {
  company: {
    companyName: "",
    ein: "",
    state: "",
    email: "",
    phone: "",
    usAddress: { street: "", city: "", state: "", zip: "" },
    intlAddress: "",
    website: "",
    notes: "",
  },
  members: [{ fullName: "", email: "", role: "", phone: "", idOrPassport: "", address: "" }],
};

function formReducer(state, action) {
  switch (action.type) {
    case "SET_COMPANY":
      return { ...state, company: { ...state.company, ...action.payload } };
    case "SET_US_ADDRESS":
      return {
        ...state,
        company: { ...state.company, usAddress: { ...state.company.usAddress, ...action.payload } },
      };
    case "ADD_MEMBER":
      return {
        ...state,
        members: [...state.members, { fullName: "", email: "", role: "", phone: "", idOrPassport: "", address: "" }],
      };
    case "UPDATE_MEMBER":
      return {
        ...state,
        members: state.members.map((m, i) => (i === action.index ? { ...m, ...action.payload } : m)),
      };
    case "REMOVE_MEMBER":
      return { ...state, members: state.members.filter((_, i) => i !== action.index) };
    case "HYDRATE":
      return { ...state, ...(action.payload || {}) };
    default:
      return state;
  }
}

/* =========================
   API: ENVIO COMPLETO
   ========================= */
async function apiUpsertFull({ kashId, company, members, consent }) {
  if (!PROCESSO_API) throw new Error("Apps Script URL ausente.");
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
  const r = await fetch(PROCESSO_API, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "fetch",
    },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  // Tenta JSON, mas aceita texto simples
  try {
    const js = JSON.parse(text);
    return { ok: r.ok, data: js };
  } catch (_) {
    return { ok: r.ok, data: text };
  }
}

/* =========================
   COMPONENTES BÁSICOS
   ========================= */
function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-100">{title}</h2>
          {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({ children }) {
  return <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">{children}</div>;
}

function Field({ label, children }) {
  return (
    <label className="block text-sm mb-4">
      <span className="text-slate-300">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

/* =========================
   MODAL
   ========================= */
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

/* =========================
   APP
   ========================= */
export default function App() {
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmTracking, setConfirmTracking] = useState("");

  // Hidrata a partir do localStorage (se existir)
  useEffect(() => {
    try {
      const st = readState();
      if (st?.form) dispatch({ type: "HYDRATE", payload: st.form });
    } catch (_) {}
  }, []);

  // Persiste rascunho
  useEffect(() => {
    const curr = readState();
    curr.form = form;
    writeState(curr);
  }, [form]);

  // Certifica que existe um kashId no início do fluxo
  useEffect(() => {
    const id = getKashId();
    if (!id) {
      const novo = generateKashId();
      setKashId(novo);
    }
  }, []);

  const kashId = getKashId();

  // Derivados
  const company = useMemo(() => normalizeCompany(form.company), [form.company]);
  const members = useMemo(() => normalizeMembers(form.members), [form.members]);

  /* ============
     SUBMISSÃO
     ============ */
  async function handleSubmit() {
    if (!consent) return;
    setSending(true);
    try {
      const res = await apiUpsertFull({ kashId, company, members, consent: true });
      if (!res.ok) throw new Error("Falha ao enviar. Verifique o Apps Script.");
      // Confirma tracking (pega do localStorage para consistencia)
      const tk = getKashId();
      setConfirmTracking(tk || kashId);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      alert("Erro ao enviar. " + (err?.message || "Tente novamente."));
    } finally {
      setSending(false);
    }
  }

  /* ============
     UI
     ============ */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/70 bg-slate-900/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">KASH Solutions</div>
          <nav className="text-sm text-slate-300">
            <a href="#servicos" className="hover:text-white mr-4">
              Servicos
            </a>
            <a href="#aplicacao" className="hover:text-white">
              Aplicacao
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <Section
        id="inicio"
        title="Abertura e suporte corporativo nos EUA"
        subtitle="Fluxo simples: preencha os dados, confirme e receba seu Tracking. A KASH confere e envia instrucoes por e-mail em ate 48 horas."
      >
        <Card>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <div className="font-medium">LLC Formation</div>
              <div className="text-slate-400 text-sm">Abertura da empresa</div>
              <div className="mt-2 text-emerald-300 text-sm">{CONFIG.prices.llc}</div>
            </div>
            <div>
              <div className="font-medium">KASH Flow 30</div>
              <div className="text-slate-400 text-sm">Orientacao inicial 30 dias</div>
              <div className="mt-2 text-emerald-300 text-sm">{CONFIG.prices.flow30}</div>
            </div>
            <div>
              <div className="font-medium">Scale 5</div>
              <div className="text-slate-400 text-sm">Pacote aceleracao</div>
              <div className="mt-2 text-emerald-300 text-sm">{CONFIG.prices.scale5}</div>
            </div>
          </div>
        </Card>
      </Section>

      {/* Aplicação */}
      <Section id="aplicacao" title="Aplicacao" subtitle="Preencha os dados da empresa e dos membros.">
        <Card>
          {/* Empresa */}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nome da empresa (Company Name)">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.companyName}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { companyName: e.target.value } })}
              />
            </Field>
            <Field label="EIN (se houver)">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.ein}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { ein: e.target.value } })}
              />
            </Field>
            <Field label="Estado (State)">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.state}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { state: e.target.value } })}
              />
            </Field>
            <Field label="E-mail de contato">
              <input
                type="email"
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.email}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { email: e.target.value } })}
              />
            </Field>
            <Field label="Telefone">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.phone}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { phone: e.target.value } })}
              />
            </Field>
            <Field label="Website (opcional)">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.website}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { website: e.target.value } })}
              />
            </Field>
          </div>

          <div className="mt-4 grid md:grid-cols-4 gap-4">
            <Field label="End. EUA - Rua">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.usAddress.street}
                onChange={(e) => dispatch({ type: "SET_US_ADDRESS", payload: { street: e.target.value } })}
              />
            </Field>
            <Field label="Cidade">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.usAddress.city}
                onChange={(e) => dispatch({ type: "SET_US_ADDRESS", payload: { city: e.target.value } })}
              />
            </Field>
            <Field label="Estado (UF)">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.usAddress.state}
                onChange={(e) => dispatch({ type: "SET_US_ADDRESS", payload: { state: e.target.value } })}
              />
            </Field>
            <Field label="ZIP">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.usAddress.zip}
                onChange={(e) => dispatch({ type: "SET_US_ADDRESS", payload: { zip: e.target.value } })}
              />
            </Field>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <Field label="Endereco internacional (opcional)">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.intlAddress}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { intlAddress: e.target.value } })}
              />
            </Field>
            <Field label="Notas (opcional)">
              <input
                className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={form.company.notes}
                onChange={(e) => dispatch({ type: "SET_COMPANY", payload: { notes: e.target.value } })}
              />
            </Field>
          </div>

          {/* Membros */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Membros</div>
              <CTAButton
                variant="ghost"
                onClick={() => dispatch({ type: "ADD_MEMBER" })}
                className="text-xs px-3 py-1"
              >
                Adicionar membro
              </CTAButton>
            </div>

            <div className="space-y-4">
              {form.members.map((m, idx) => (
                <div key={idx} className="rounded-lg border border-slate-700/60 p-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <Field label="Nome completo">
                      <input
                        className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={m.fullName}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_MEMBER", index: idx, payload: { fullName: e.target.value } })
                        }
                      />
                    </Field>
                    <Field label="E-mail">
                      <input
                        type="email"
                        className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={m.email}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_MEMBER", index: idx, payload: { email: e.target.value } })
                        }
                      />
                    </Field>
                    <Field label="Funcao (ex.: Owner, Manager)">
                      <input
                        className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={m.role}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_MEMBER", index: idx, payload: { role: e.target.value } })
                        }
                      />
                    </Field>
                  </div>
                  <div className="grid md:grid-cols-3 gap-3 mt-3">
                    <Field label="Telefone">
                      <input
                        className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={m.phone}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_MEMBER", index: idx, payload: { phone: e.target.value } })
                        }
                      />
                    </Field>
                    <Field label="ID/Passaporte">
                      <input
                        className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={m.idOrPassport}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_MEMBER", index: idx, payload: { idOrPassport: e.target.value } })
                        }
                      />
                    </Field>
                    <Field label="Endereco">
                      <input
                        className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                        value={m.address}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_MEMBER", index: idx, payload: { address: e.target.value } })
                        }
                      />
                    </Field>
                  </div>

                  {form.members.length > 1 && (
                    <div className="mt-3">
                      <CTAButton
                        variant="ghost"
                        className="text-xs px-3 py-1"
                        onClick={() => dispatch({ type: "REMOVE_MEMBER", index: idx })}
                      >
                        Remover
                      </CTAButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA: abrir modal de confirmacao */}
          <div className="mt-8 flex items-center justify-end">
            <CTAButton onClick={() => setShowConfirmModal(true)}>Revisar e Enviar</CTAButton>
          </div>
        </Card>
      </Section>

      {/* Rodape simples */}
      <footer className="py-10 border-t border-slate-800/70 mt-12">
        <div className="mx-auto max-w-5xl px-4 text-sm text-slate-400">
          <div>{CONFIG.company.legal} — {CONFIG.company.trade}</div>
          <div className="mt-1">Contato: {CONFIG.contact.email}</div>
        </div>
      </footer>

      {/* Modal de Conferencia + Consentimento */}
      <Modal open={showConfirmModal} onClose={() => !sending && setShowConfirmModal(false)}>
        <div className="p-5">
          <div className="text-lg font-semibold">Conferir informacoes</div>
          <div className="text-slate-400 text-sm mt-1">
            Revise os dados antes de enviar. Ao confirmar, seu Tracking sera exibido.
          </div>

          {/* Resumo */}
          <div className="mt-4 space-y-3 max-h-[50vh] overflow-auto pr-1">
            <div className="rounded-lg border border-slate-700 p-3">
              <div className="font-medium mb-2">Empresa</div>
              <div className="text-sm text-slate-300">
                <div><span className="text-slate-400">Nome:</span> {company.companyName || "-"}</div>
                <div><span className="text-slate-400">EIN:</span> {company.ein || "-"}</div>
                <div><span className="text-slate-400">Estado:</span> {company.state || "-"}</div>
                <div><span className="text-slate-400">E-mail:</span> {company.email || "-"}</div>
                <div><span className="text-slate-400">Telefone:</span> {company.phone || "-"}</div>
                <div className="mt-1">
                  <span className="text-slate-400">Endereco EUA:</span>{" "}
                  {[
                    company.usAddress?.street,
                    company.usAddress?.city,
                    company.usAddress?.state,
                    company.usAddress?.zip,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </div>
                <div><span className="text-slate-400">Endereco internacional:</span> {company.intlAddress || "-"}</div>
                <div><span className="text-slate-400">Website:</span> {company.website || "-"}</div>
                <div><span className="text-slate-400">Notas:</span> {company.notes || "-"}</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-700 p-3">
              <div className="font-medium mb-2">Membros</div>
              {members.length === 0 ? (
                <div className="text-sm text-slate-400">Nenhum membro informado.</div>
              ) : (
                <div className="space-y-2">
                  {members.map((m, i) => (
                    <div key={i} className="text-sm text-slate-300">
                      <div><span className="text-slate-400">Nome:</span> {m.fullName || "-"}</div>
                      <div><span className="text-slate-400">E-mail:</span> {m.email || "-"}</div>
                      <div><span className="text-slate-400">Funcao:</span> {m.role || "-"}</div>
                      <div><span className="text-slate-400">Telefone:</span> {m.phone || "-"}</div>
                      <div><span className="text-slate-400">ID/Passaporte:</span> {m.idOrPassport || "-"}</div>
                      <div><span className="text-slate-400">Endereco:</span> {m.address || "-"}</div>
                      {i < members.length - 1 && <div className="h-px bg-slate-700/60 my-2" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Consentimento + Acoes */}
          <div className="mt-4">
            <label className="flex items-start gap-2 select-none">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span className="text-sm text-slate-300">
                Estou ciente de que as informacoes fornecidas serao utilizadas para abertura e suporte corporativo.
                <br />
                <span className="font-medium">
                  Autorizo a KASH Corporate Solutions a conferir e validar as informacoes fornecidas para fins de abertura e registro da empresa.
                </span>
              </span>
            </label>

            <div className="mt-4 flex items-center justify-between gap-2">
              <CTAButton variant="ghost" onClick={() => !sending && setShowConfirmModal(false)}>
                Voltar
              </CTAButton>
              <CTAButton disabled={!consent || sending} onClick={handleSubmit}>
                {sending ? "Enviando..." : "Confirmar envio"}
              </CTAButton>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Sucesso (apenas Tracking e mensagem) */}
      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <div className="p-5">
          <div className="text-lg font-semibold">Aplicacao recebida</div>
          <div className="text-slate-300 mt-2">
            Obrigado. O seu codigo de acompanhamento (Tracking) esta abaixo.
          </div>
          <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
            <div className="text-sm text-slate-300">Tracking Number</div>
            <div className="text-xl font-mono select-all">{confirmTracking || kashId}</div>
          </div>
          <div className="text-slate-400 text-sm mt-4">
            A equipe KASH analisara as informacoes e enviara o link de pagamento e contrato por e-mail em ate 48 horas.
          </div>
          <div className="mt-5 flex justify-end">
            <CTAButton onClick={() => setShowSuccessModal(false)}>Fechar</CTAButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}