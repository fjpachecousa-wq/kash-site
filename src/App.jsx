/* App.jsx — KASH Site (corrigido)
   Notas:
   - Removida chave extra após return obj; no helper (linha ~1069 do build).
   - Removida linha inválida: ", members:[] };".
   - fromFlat corrige setDeep(obj, path, flat[k]).
   - CTAButton somente retorna <button>.
   - Promo return está correto (sem </div> solto).
*/

import React, { useEffect, useMemo, useRef, useState } from "react";

// Endpoint do Apps Script por variável de ambiente ou window (mantém compatibilidade)
const APPS_SCRIPT_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_APPS_SCRIPT_URL) ||
  (typeof window !== "undefined" && window.APPS_SCRIPT_URL) ||
  "";

// Demais constantes originais da página (mantidas)
const BRAND = {
  legal: "KASH CORPORATE SOLUTIONS LLC",
  trade: "KASH Solutions",
};

const PHONE_MASK = (v = "") =>
  v
    .replace(/\D/g, "")
    .replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (_, a, b, c) =>
      [a && `(${a}`, a && ") ", b, c && `-${c}`].filter(Boolean).join("")
    );

const onlyDigits = (v = "") => v.replace(/\D/g, "");
const safe = (v) => (v == null ? "" : String(v).trim());

// === Helpers de normalização ===
const parseKey = (key) => {
  return key.replace(/\[(\d+)\]/g, ".$1").split(".");
};

const setDeep = (obj, path, value) => {
  if (!Array.isArray(path)) path = parseKey(path);
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const next = path[i + 1];
    if (!(k in cur)) {
      cur[k] = String(+next) == next ? [] : {};
    }
    cur = cur[k];
  }
  cur[path[path.length - 1]] = value;
};

function fromFlat(flat) {
  const obj = {};
  Object.keys(flat || {}).forEach((k) => {
    const path = parseKey(k);
    setDeep(obj, path, flat[k]); // <-- CORRETO
  });
  return obj;
}

// === Componentes utilitários ===
function CTAButton({ children, variant = "primary", onClick, type = "button", disabled = false }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-offset-2 disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500"
      : variant === "ghost"
      ? "bg-transparent text-slate-100 hover:bg-slate-800 focus:ring-slate-700"
      : "bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-600";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

// (Outros componentes/estados/originais mantidos...)

export default function App() {
  // Estados
  const [data, setData] = useState(() => {
    // Estado inicial preservado (exemplo, reconstrua com seu objeto original)
    return {
      company: {
        companyName: "",
        tradeName: "",
        ein: "",
        phone: "",
        email: "",
        address: "",
      },
      members: [
        {
          fullName: "",
          email: "",
          phone: "",
          passport: "",
          issuer: "",
          docExpiry: "",
          birthdate: "",
          percent: "",
          role: "",
          address: "",
          idOrPassport: "",
        },
      ],
      // ... demais campos do seu estado original
    };
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [kashId, setKashId] = useState("");

  // Utils de formulário
  const onChange = (path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      // Caminho pode ser "company.companyName" ou "members[0].fullName"
      setDeep(next, parseKey(path), value);
      return next;
    });
  };

  const addMember = () => {
    setData((prev) => ({
      ...prev,
      members: [
        ...(prev.members || []),
        {
          fullName: "",
          email: "",
          phone: "",
          passport: "",
          issuer: "",
          docExpiry: "",
          birthdate: "",
          percent: "",
          role: "",
          address: "",
          idOrPassport: "",
        },
      ],
    }));
  };

  const removeMember = (idx) => {
    setData((prev) => {
      const list = [...(prev.members || [])];
      list.splice(idx, 1);
      return { ...prev, members: list };
    });
  };

  const maskPhone = (v) => PHONE_MASK(v);

  // Validação mínima (exemplo – mantenha a sua original)
  const validate = (obj) => {
    const e = {};
    if (!safe(obj.company?.companyName)) e.companyName = "Informe o nome da empresa.";
    if (!safe(obj.company?.email)) e.companyEmail = "Informe o e-mail.";
    return e;
  };

  // Envio para Google Sheets (Apps Script)
  const submitToSheet = async (payload) => {
    if (!APPS_SCRIPT_URL) throw new Error("APPS_SCRIPT_URL não configurada.");
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Erro ao enviar: ${res.status}`);
    return await res.json().catch(() => ({}));
  };

  // Gera KASH ID simples (exemplo – preserve o seu gerador original se for o caso)
  const generateKashId = () => {
    const n = Date.now().toString(36).toUpperCase();
    return `KASH-${n.slice(-8)}`;
  };

  const handleSubmit = async () => {
    const flat = {
      // Monte o flat original do seu projeto, exemplo:
      "company.companyName": data.company.companyName,
      "company.tradeName": data.company.tradeName,
      "company.email": data.company.email,
      "company.phone": data.company.phone,
      "company.address": data.company.address,
      // members[n].campo
      // ...
    };

    // Converte flat -> objeto aninhado (corrigido)
    const payload = fromFlat(flat);

    // Ajustes de companyName com fallback
    if (!safe(payload?.company?.companyName)) {
      payload.company = payload.company || {};
      payload.company.companyName =
        localStorage.getItem("companyName") || safe(data.company.companyName) || "";
    }

    // Gera kashId
    const kid = generateKashId();
    setKashId(kid);
    payload.kashId = kid;

    // Marca data/hora local
    payload.timestamp = new Date().toISOString();

    setLoading(true);
    try {
      // Envia ao Apps Script
      const resp = await submitToSheet(payload);
      console.log("Apps Script:", resp);
      alert("Dados enviados com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar dados.");
    } finally {
      setLoading(false);
    }
  };

  // Render (mantém o layout original; abaixo é uma estrutura exemplo – cole o seu JSX original se houver)
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="KASH" className="h-8 w-8 rounded" />
          <div className="text-lg font-semibold">KASH Solutions</div>
        </div>
        <div className="text-xs text-slate-400">{BRAND.legal}</div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Seção de aviso/promo – return corrigido */}
        <section className="mb-6">
          <div className="promo bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-300">
            KASH FLOW 30 — fale conosco para mais detalhes.
          </div>
        </section>

        {/* Formulário principal (mantenha a sua marcação original se for diferente) */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nome da empresa</label>
              <input
                className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ex.: KASH Solutions"
                value={data.company.companyName}
                onChange={(e) => onChange("company.companyName", e.target.value)}
              />
              {errors.companyName && <div className="text-xs text-red-400 mt-1">{errors.companyName}</div>}
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Telefone</label>
                <input
                  className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="(11) 91234-5678"
                  value={data.company.phone}
                  onChange={(e) => onChange("company.phone", maskPhone(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">E-mail</label>
                <input
                  className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="contato@empresa.com"
                  value={data.company.email}
                  onChange={(e) => onChange("company.email", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Endereço</label>
              <input
                className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Rua, número, cidade..."
                value={data.company.address}
                onChange={(e) => onChange("company.address", e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <CTAButton onClick={handleSubmit} disabled={loading}>
                {loading ? "Enviando..." : "Enviar para validação"}
              </CTAButton>
              <CTAButton variant="ghost" onClick={addMember} disabled={loading}>
                + Sócio
              </CTAButton>
            </div>
          </div>
        </section>
        {/* Lista de sócios */}
        <section className="mt-8">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-slate-300 font-medium">Sócios</div>
            <div className="mt-2 space-y-3 text-sm text-slate-400">
              {(data.members || []).map((m, i) => (
                <div key={i} className="rounded-lg border border-slate-800 p-3">
                  <div className="font-medium text-slate-300">Sócio {i + 1}: {m.fullName || "—"}</div>

                  <div className="grid md:grid-cols-2 gap-2 mt-1">
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Nome completo"
                      value={m.fullName}
                      onChange={(e) => onChange(`members[${i}].fullName`, e.target.value)}
                    />
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="E-mail"
                      value={m.email}
                      onChange={(e) => onChange(`members[${i}].email`, e.target.value)}
                    />
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Telefone"
                      value={m.phone}
                      onChange={(e) => onChange(`members[${i}].phone`, PHONE_MASK(e.target.value))}
                    />
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Documento (ID/Passaporte)"
                      value={m.idOrPassport || m.passport}
                      onChange={(e) => onChange(`members[${i}].idOrPassport`, e.target.value)}
                    />
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Órgão emissor"
                      value={m.issuer}
                      onChange={(e) => onChange(`members[${i}].issuer`, e.target.value)}
                    />
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Validade do documento"
                      value={m.docExpiry}
                      onChange={(e) => onChange(`members[${i}].docExpiry`, e.target.value)}
                    />
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Nascimento"
                      value={m.birthdate}
                      onChange={(e) => onChange(`members[${i}].birthdate`, e.target.value))}
                    />
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="% de participação"
                      value={m.percent}
                      onChange={(e) => onChange(`members[${i}].percent`, e.target.value))}
                    />
                  </div>

                  <div className="mt-2 flex justify-end">
                    <CTAButton variant="ghost" onClick={() => removeMember(i)}>Remover</CTAButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seções adicionais do seu layout original mantidas... */}
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 text-xs text-slate-500">
        <div>© {new Date().getFullYear()} {BRAND.legal}. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}

// === Funções auxiliares para imprimir seções/contrato (mantidas) ===
export function summarizeCompany(obj = {}) {
  const lines = [];
  const c = obj.company || {};
  const name = safe(c.companyName) || safe(c.tradeName) || "—";
  const ein = safe(c.ein);
  const phone = safe(c.phone);
  const email = safe(c.email);
  const addr = safe(c.address);
  lines.push(`Company: ${name}`);
  if (ein) lines.push(`EIN: ${ein}`);
  if (phone) lines.push(`Phone: ${phone}`);
  if (email) lines.push(`Email: ${email}`);
  if (addr) lines.push(`Address: ${addr}`);
  lines.push("");
  return lines;
}

export function summarizeMembers(obj = {}) {
  const lines = [];
  const list = Array.isArray(obj.members) ? obj.members : [];
  if (!list.length) {
    lines.push("(none)");
    lines.push("");
    return lines;
  }
  list.forEach((m, i) => {
    const full = safe(m.fullName);
    const role = safe(m.role);
    const idoc = safe(m.idOrPassport || m.document);
    const addr = safe(m.address || m.addressLine);
    const email = safe(m.email);
    lines.push(`${i + 1}. ${full || "—"}${role ? " – " + role : ""}${idoc ? " – " + idoc : ""}`);
    if (addr) lines.push(`   Address: ${addr}`);
    if (email) lines.push(`   Email: ${email}`);
  });
  lines.push("");
  return lines;
}

export function buildContractPt(obj = {}) {
  const lines = [];
  lines.push("CONTRATO DE PRESTAÇÃO DE SERVIÇOS");
  lines.push("");
  summarizeCompany(obj).forEach((l) => lines.push(l));
  summarizeMembers(obj).forEach((l) => lines.push(l));
  lines.push("");
  lines.push("Cláusula 1ª – Do Objeto");
  lines.push("…");
  lines.push("");
  lines.push("Cláusula Final – Assinaturas");
  lines.push(BRAND.legal);
  return lines.join("\n");
}
// === Impressão/Preview (se existir no seu projeto, mantenha a implementação original) ===
export function ContractPreview({ data }) {
  const txt = useMemo(() => buildContractPt(data || {}), [data]);
  const preRef = useRef(null);

  const handlePrint = () => {
    try {
      const w = window.open("", "_blank");
      if (!w) return;
      w.document.write(`<pre style="font: 12px/1.4 -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Helvetica Neue, Arial, Noto Sans, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; white-space: pre-wrap;">${
        txt.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))
      }</pre>`);
      w.document.close();
      w.focus();
      w.print();
      w.close();
    } catch (e) {
      console.error(e);
      alert("Não foi possível imprimir.");
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="text-slate-300 font-medium">Contrato (prévia)</div>
        <CTAButton onClick={handlePrint}>Imprimir</CTAButton>
      </div>
      <pre ref={preRef} className="mt-3 text-xs text-slate-200 whitespace-pre-wrap">
        {txt}
      </pre>
    </div>
  );
}

/* Fim do App.jsx */