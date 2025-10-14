import React, { useReducer, useState, useEffect } from "react";

/* === KASH WIREFIX (Google Sheets) === */
if (typeof window !== "undefined" && !window.__KASH_WIRE__) {
  window.__KASH_WIRE__ = true;

  // URL publicada do Apps Script
  window.CONFIG = window.CONFIG || {};
  window.CONFIG.appsScriptUrl =
    "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

  const getAPI = () =>
    (window.CONFIG && window.CONFIG.appsScriptUrl) || "";

  // Salva companyName enquanto digita (para auto-preencher envios)
  const mirrorCompany = () => {
    try {
      const $ = (s) => document.querySelector(s);
      const el =
        $('input[name="companyName"]') ||
        $("#companyName") ||
        $("[data-company-name]") ||
        $('input[name="empresaNome"]') ||
        Array.from(
          document.querySelectorAll(
            'input[type="text"],input:not([type])'
          )
        ).find((i) => {
          const ph = (i.placeholder || "").toLowerCase();
          return ph.includes("empresa") || ph.includes("company");
        });
      if (!el) return;
      const save = () => {
        try {
          localStorage.setItem(
            "companyName",
            (el.value || "").trim()
          );
        } catch {}
      };
      el.addEventListener("input", save, { passive: true });
      save();
    } catch {}
  };

  // Captura KASH real no DOM (ignora KASH-XXXXXX)
  const captureKash = () => {
    try {
      const m = (document.body.innerText || "").match(
        /KASH-(?!X{6})[A-Z0-9-]{4,}/i
      );
      if (m && m[0])
        localStorage.setItem(
          "last_tracking",
          String(m[0]).toUpperCase()
        );
    } catch {}
  };

  // Expor função para setar tracking
  window.__setKashTracking = function (code) {
    try {
      const real = String(code || "").toUpperCase();
      if (/^KASH-(?!X{6})[A-Z0-9-]{4,}$/.test(real))
        localStorage.setItem("last_tracking", real);
    } catch {}
  };

  // Injeta hidden em forms do Apps Script
  const ensureHidden = (form, name, val) => {
    let el = form.querySelector('input[name="' + name + '"]');
    if (!el) {
      el = document.createElement("input");
      el.type = "hidden";
      el.name = name;
      form.appendChild(el);
    }
    el.value = val;
  };
  const isAppsScriptForm = (f) => {
    const a = String(f.getAttribute("action") || "");
    const su = getAPI();
    return (
      a.includes("script.google.com/macros") ||
      (su && a.startsWith(su))
    );
  };
  const prepareForm = (form) => {
    const kid = (
      localStorage.getItem("last_tracking") ||
      localStorage.getItem("kashId") ||
      localStorage.getItem("tracking") ||
      ""
    )
      .toUpperCase()
      .trim();
    const cname = (localStorage.getItem("companyName") || "").trim();
    if (kid) {
      ensureHidden(form, "kashId", kid);
      ensureHidden(form, "hashId", kid);
    }
    if (cname) {
      ensureHidden(form, "companyName", cname);
      ensureHidden(form, "empresaNome", cname);
    }
  };
  const wireForms = () => {
    document.querySelectorAll("form").forEach((f) => {
      if (isAppsScriptForm(f) && !f.__kash_wired) {
        f.addEventListener("submit", () => prepareForm(f), true);
        f.addEventListener("focusout", () => prepareForm(f), true);
        prepareForm(f);
        f.__kash_wired = true;
      }
    });
  };

  // Reforço de clique em botões "Concluir teste"
  const reinforceConcluir = () => {
    const su = getAPI();
    if (!su) return;
    Array.from(
      document.querySelectorAll("button,a,[role='button']")
    )
      .filter((b) =>
        /concluir\s*teste/i.test(b.textContent || "")
      )
      .forEach((b) => {
        if (b.__kash_click_wired) return;
        b.addEventListener(
          "click",
          () => {
            try {
              const kashId = (
                localStorage.getItem("last_tracking") ||
                localStorage.getItem("kashId") ||
                localStorage.getItem("tracking") ||
                ""
              )
                .toUpperCase()
                .trim();
              const companyName =
                localStorage.getItem("companyName") || "";
              if (!kashId && !companyName) return;
              const payload = {
                kashId,
                companyName,
                faseAtual: 1,
                subFase: 0,
                atualizadoEm: new Date().toISOString(),
              };
              fetch(su, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                mode: "no-cors",
              }).catch(() => {});
            } catch {}
          },
          { passive: true }
        );
        b.__kash_click_wired = true;
      });
  };

  document.addEventListener("DOMContentLoaded", () => {
    mirrorCompany();
    captureKash();
    wireForms();
    reinforceConcluir();
  });
  new MutationObserver(() => {
    captureKash();
    wireForms();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
/* === /KASH WIREFIX === */

// ===== KASH INLINE SHIM (adiciona kashId/companyName ao fetch do Apps Script) =====
(function () {
  function getCompanyName() {
    try {
      const q = (s) => document.querySelector(s);
      return (
        (q('input[name="companyName"]') &&
          q('input[name="companyName"]').value.trim()) ||
        (q("#companyName") && q("#companyName").value.trim()) ||
        (q("[data-company-name]") &&
          (q("[data-company-name]").getAttribute("data-company-name") ||
            "").trim()) ||
        (q('input[name="empresaNome"]")') &&
          q('input[name="empresaNome"]').value.trim()) ||
        ""
      );
    } catch (_) {
      return "";
    }
  }
  function getKashId() {
    try {
      const v =
        localStorage.getItem("last_tracking") ||
        localStorage.getItem("kashId") ||
        localStorage.getItem("tracking") ||
        "";
      return String(v).toUpperCase().trim();
    } catch (_) {
      return "";
    }
  }
  function addMetaObject(obj) {
    obj = obj || {};
    const k = getKashId();
    const c = getCompanyName();
    if (k && !obj.kashId) obj.kashId = k;
    if (k && !obj.hashId) obj.hashId = k;
    if (c && !obj.companyName) obj.companyName = c;
    if (c && !obj.empresaNome) obj.empresaNome = c;
    return obj;
  }
  function addMetaFormData(fd) {
    try {
      const k = getKashId();
      const c = getCompanyName();
      if (k && !fd.has("kashId")) fd.set("kashId", k);
      if (k && !fd.has("hashId")) fd.set("hashId", k);
      if (c && !fd.has("companyName")) fd.set("companyName", c);
      if (c && !fd.has("empresaNome")) fd.set("empresaNome", c);
    } catch (_){}
  }
  function addMetaSearchParams(sp) {
    try {
      const k = getKashId();
      const c = getCompanyName();
      if (k && !sp.has("kashId")) sp.set("kashId", k);
      if (k && !sp.has("hashId")) sp.set("hashId", k);
      if (c && !sp.has("companyName")) sp.set("companyName", c);
      if (c && !sp.has("empresaNome")) sp.set("empresaNome", c);
    } catch (_){}
  }
  function isAppsScriptUrl(u) {
    try {
      const su =
        (typeof window !== "undefined" &&
          (window.SCRIPT_URL ||
            (window.CONFIG && window.CONFIG.appsScriptUrl))) ||
        (typeof SCRIPT_URL !== "undefined" && SCRIPT_URL) ||
        "";
      return (
        (su && String(u || "").indexOf(String(su)) === 0) ||
        String(u || "").indexOf("script.google.com/macros") >= 0
      );
    } catch (_){
      return false;
    }
  }
  try {
    if (typeof window !== "undefined" && !window.__kash_inline_fetch_patched) {
      const _fetch = window.fetch;
      window.fetch = function (input, init) {
        try {
          const url =
            typeof input === "string"
              ? input
              : (input && input.url) || "";
          if (isAppsScriptUrl(url) && init) {
            const body = init.body;
            if (typeof body === "string" && body) {
              try {
                const obj = JSON.parse(body);
                init.body = JSON.stringify(addMetaObject(obj));
              } catch (_) {
                init.body = JSON.stringify(addMetaObject({ raw: body }));
              }
            } else if (
              typeof FormData !== "undefined" &&
              body instanceof FormData
            ) {
              addMetaFormData(body);
            } else if (
              typeof URLSearchParams !== "undefined" &&
              body instanceof URLSearchParams
            ) {
              addMetaSearchParams(body);
            }
          }
        } catch (_){}
        return _fetch.apply(this, arguments);
      };
      window.__kash_inline_fetch_patched = true;
    }
  } catch (_){}
})();
// ===== FIM KASH INLINE SHIM =====

/* ================== CONFIG & API ================== */
const PROCESSO_API =
  "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

const CONFIG = {
  prices: { llc: "US$ 1,360", flow30: "US$ 300", scale5: "US$ 1,000" },
  contact: {
    whatsapp: "",
    email: "contato@kashsolutions.us",
    calendly: "",
  },
  // checkout: mantido no objeto, mas NÃO renderizado neste fluxo
  checkout: { stripeUrl: "https://buy.stripe.com/5kQdR95j9eJL9E06WVebu00" },
  brand: { legal: "KASH CORPORATE SOLUTIONS LLC", trade: "KASH Solutions" },
};

async function apiGetProcesso(kashId) {
  const r = await fetch(
    `${PROCESSO_API}?kashId=${encodeURIComponent(kashId)}`
  );
  if (!r.ok) throw new Error("not_found");
  return r.json();
}

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
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "fetch",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  try {
    const j = JSON.parse(text);
    if (j?.kashId) localStorage.setItem("kashId", j.kashId);
  } catch {}
  if (!res.ok) throw new Error(text || "Falha no envio");
  return text;
}

/* ===== PRIVACIDADE: armazenar apenas atalhos de tracking ===== */
function saveTrackingShortcut(kashId) {
  try {
    if (!kashId) return;
    const key = "kash.tracking.shortcuts";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    if (!list.includes(kashId)) list.unshift(kashId);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
  } catch {}
}
function getTrackingShortcuts() {
  try {
    return JSON.parse(localStorage.getItem("kash.tracking.shortcuts") || "[]");
  } catch {
    return [];
  }
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;

function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}
function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function calcAgeFullDate(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const t = new Date();
  let age = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) age--;
  return age;
}
function isPercentTotalValid(members) {
  const sum = members.reduce(
    (acc, m) => acc + (Number(m.percent || 0) || 0),
    0
  );
  return Math.abs(sum - 100) < 0.001;
}

/* ================== UI BÁSICA ================== */
function KLogo({ size = 40 }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-2xl bg-slate-900" />
      <div className="absolute inset-[3px] rounded-xl bg-slate-800 shadow-inner" />
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 64 64"
        className="absolute"
      >
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d="M14 8h8v48h-8z" fill="url(#g)" />
        <path
          d="M26 32l22-24h10L42 32l16 24H48L26 32z"
          fill="url(#g)"
        />
      </svg>
    </div>
  );
}
function CTAButton({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-emerald-500/90 hover:bg-emerald-500 text-slate-900 shadow"
      : variant === "ghost"
      ? "bg-transparent border border-slate-700 text-slate-200 hover:bg-slate-800"
      : "bg-slate-700 text-slate-100 hover:bg-slate-600";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classNames(base, styles)}
    >
      {children}
    </button>
  );
}
function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h3 className="text-2xl text-slate-100 font-semibold">{title}</h3>
      {subtitle && (
        <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
}

/* ================== HERO/SERVICES/PRICING ================== */
function DemoCalculator() {
  const [monthly, setMonthly] = useState(4000);
  const yearly = monthly * 12;
  const withheld = yearly * 0.3;
  const saved = Math.max(0, withheld - 1360);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div className="text-slate-300">Estimativa de economia anual</div>
        <span className="text-xs text-emerald-300">Simulador</span>
      </div>
      <div className="mt-4">
        <input
          type="range"
          min={1000}
          max={20000}
          step={100}
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-2 text-sm text-slate-400">
          Receita mensal:{" "}
          <span className="text-slate-200">
            US$ {monthly.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">Receita/ano</div>
          <div className="text-lg text-slate-100">
            US$ {yearly.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">Retenção 30%</div>
          <div className="text-lg text-slate-100">
            US$ {withheld.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-xs text-slate-400">Economia potencial</div>
          <div className="text-lg text-emerald-400">
            US$ {saved.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
function Hero({ onStart }) {
  return (
    <section className="pt-16 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <KLogo size={42} />
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-100">
              KASH Solutions
            </h1>
            <p className="text-slate-400 text-sm">
              KASH CORPORATE SOLUTIONS LLC · Florida LLC
            </p>
          </div>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-100">
              Abra sua LLC na Flórida e elimine a retenção de 30%.
            </h2>
            <p className="mt-4 text-slate-300">
              Abertura da empresa, EIN, endereço e agente por 12 meses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton onClick={onStart}>Começar agora</CTAButton>
              <a href="#como-funciona" className="inline-flex">
                <CTAButton variant="ghost">Como funciona</CTAButton>
              </a>
            </div>
          </div>
          <DemoCalculator />
        </div>
      </div>
    </section>
  );
}
function Services() {
  const items = [
    { t: "Abertura LLC Partnership", d: "Registro oficial na Flórida (Sunbiz)." },
    { t: "EIN (IRS)", d: "Obtenção do Employer Identification Number." },
    { t: "Operating Agreement", d: "Documento societário digital." },
    { t: "Endereço + Agente (12 meses)", d: "Inclusos no pacote de abertura." },
  ];
  return (
    <section className="py-14 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title="Serviços incluídos"
          subtitle="Pacote completo para começar certo."
        />
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {items.map((it) => (
            <div
              key={it.t}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="text-slate-200 font-medium">{it.t}</div>
              <div className="text-slate-400 text-sm mt-1">{it.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Pricing({ onStart }) {
  const plans = [
    {
      name: "Abertura LLC",
      price: CONFIG.prices.llc,
      features: [
        "Endereço + Agente 12 meses",
        "EIN",
        "Operating Agreement",
      ],
      cta: "Contratar",
      disabled: false,
    },
    {
      name: "KASH FLOW 30 (Mensal)",
      price: CONFIG.prices.flow30,
      features: ["Classificação contábil", "Relatórios mensais"],
      cta: "Assinar",
      disabled: true,
    },
    {
      name: "KASH SCALE 5 (Mensal)",
      price: CONFIG.prices.scale5,
      features: [
        "Até 5 contratos",
        "Suporte prioritário",
        "W-8BEN-E (emitido no onboarding contábil)",
      ],
      cta: "Assinar",
      disabled: true,
    },
  ];
  return (
    <section className="py-14 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title="Planos e preços"
          subtitle="Transparência desde o início."
        />
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="text-slate-100 font-medium">{p.name}</div>
              <div className="text-2xl text-emerald-400 mt-1">
                {p.price}
              </div>
              <ul className="mt-3 text-sm text-slate-400 space-y-1 list-disc list-inside">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="mt-5 flex flex-col items-center gap-1">
                {!p.disabled && (
                  <CTAButton onClick={onStart}>{p.cta}</CTAButton>
                )}
                {p.disabled && (
                  <span className="text-xs text-slate-500">Em breve</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function HowItWorks() {
  const steps = [
    { t: "Consulta", d: "Alinhamento de expectativas (opcional)." },
    { t: "Contrato e pagamento", d: "Assinatura eletrônica e checkout." },
    { t: "Formulário de abertura", d: "Dados da empresa, sócios, KYC/AML." },
    { t: "Pagamento", d: "Fee e taxa estadual - checkout online." },
    { t: "Tracking do processo", d: "Número de protocolo e notificações por e-mail." },
  ];
  return (
    <section className="py-16 border-t border-slate-800" id="como-funciona">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitle
          title="Como funciona"
          subtitle="Fluxo enxuto e auditável, do onboarding ao registro concluído."
        />
        <ol className="mt-10 grid md:grid-cols-5 gap-5">
          {steps.map((s, i) => (
            <li
              key={s.t}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="text-emerald-400 font-semibold">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h4 className="text-slate-100 mt-2 font-medium">{s.t}</h4>
              <p className="text-slate-400 text-sm mt-1">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================== COMPONENTES AUXILIARES ================== */
const initialForm = {
  company: {
    companyName: "",
    email: "",
    phone: "",
    hasFloridaAddress: false,
    usAddress: { line1: "", line2: "", city: "", state: "FL", zip: "" },
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
    },
    {
      fullName: "",
      email: "",
      phone: "",
      passport: "",
      issuer: "",
      docExpiry: "",
      birthdate: "",
      percent: "",
    },
  ],
  accept: { responsibility: false, limitations: false },
};
function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_COMPANY":
      return {
        ...state,
        company: { ...state.company, [action.field]: action.value },
      };
    case "UPDATE_US_ADDRESS":
      return {
        ...state,
        company: {
          ...state.company,
          usAddress: {
            ...state.company.usAddress,
            [action.field]: action.value,
          },
        },
      };
    case "UPDATE_MEMBER":
      return {
        ...state,
        members: state.members.map((m, i) =>
          i === action.index ? { ...m, [action.field]: action.value } : m
        ),
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
            passport: "",
            issuer: "",
            docExpiry: "",
            birthdate: "",
            percent: "",
          },
        ],
      };
    case "REMOVE_MEMBER":
      return {
        ...state,
        members: state.members.filter((_, i) => i !== action.index),
      };
    case "TOGGLE_ACCEPT":
      return {
        ...state,
        accept: { ...state.accept, [action.key]: action.value },
      };
    default:
      return state;
  }
}

function MemberCard({ index, data, onChange, onRemove, canRemove, errors }) {
  return (
    <div className="p-4 border border-slate-700 rounded-xl bg-slate-800 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-slate-300 font-medium">Sócio {index + 1}</div>
        {canRemove && (
          <button
            className="text-slate-400 hover:text-slate-200 text-xs"
            onClick={onRemove}
            type="button"
          >
            Remover
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input
            className={classNames(
              "w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.fullName && "border-red-500"
            )}
            placeholder="Nome completo"
            value={data.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.fullName || ""}</div>
        </div>
        <div>
          <input
            type="email"
            className={classNames(
              "w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.email && "border-red-500"
            )}
            placeholder="E-mail do sócio"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.email || ""}</div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <input
            className={classNames(
              "w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.phone && "border-red-500"
            )}
            placeholder="Telefone do sócio"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.phone || ""}</div>
        </div>
        <div>
          <input
            className={classNames(
              "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.passport && "border-red-500"
            )}
            placeholder="Passaporte (ou RG)"
            value={data.passport}
            onChange={(e) => onChange("passport", e.target.value)}
          />
          <div className="text-red-400 text-xs">{errors.passport || ""}</div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-2">
        <div>
          <input
            className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Órgão emissor"
            value={data.issuer}
            onChange={(e) => onChange("issuer", e.target.value)}
          />
        </div>
        <div>
          <input
            type="date"
            className={classNames(
              "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.docExpiry && "border-red-500"
            )}
            value={data.docExpiry}
            onChange={(e) => onChange("docExpiry", e.target.value)}
          />
          <div className="text-[11px] text-slate-400 mt-1">
            Validade do documento
          </div>
          <div className="text-red-400 text-xs">{errors.docExpiry || ""}</div>
        </div>
        <div>
          <input
            type="date"
            className={classNames(
              "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
              errors.birthdate && "border-red-500"
            )}
            value={data.birthdate}
            onChange={(e) => onChange("birthdate", e.target.value)}
          />
          <div className="text-[11px] text-slate-400 mt-1">
            Data de nascimento
          </div>
          <div className="text-red-400 text-xs">{errors.birthdate || ""}</div>
        </div>
      </div>
      <div>
        <input
          type="number"
          className={classNames(
            "rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500",
            errors.percent && "border-red-500"
          )}
        placeholder="% de participação"
          value={data.percent}
          onChange={(e) => onChange("percent", e.target.value)}
        />
        <div className="text-red-400 text-xs">{errors.percent || ""}</div>
      </div>
    </div>
  );
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

/* ======= Tracking Search (inline) ======= */
function TrackingSearch() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleLookup = async () => {
    try {
      const obj = await apiGetProcesso(code.trim());
      setResult({
        tracking: obj.kashId,
        dateISO: obj.atualizadoEm,
        company: { companyName: obj.companyName || "-" },
        updates: obj.updates || [],
        faseAtual: obj.faseAtual || 1,
        subFase: obj.subFase || null,
      });
      saveTrackingShortcut(code.trim());
      setNotFound(false);
    } catch (e) {
      setResult(null);
      setNotFound(true);
    }
  };

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <SectionTitle
          title="Consultar processo por Tracking"
          subtitle="Insira seu código (ex.: KASH-XXXXXX) para verificar o status."
        />
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="KASH-ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <CTAButton onClick={handleLookup}>Consultar</CTAButton>
        </div>
        {notFound && (
          <div className="text-sm text-red-400 mt-2">
            Tracking não encontrado.
          </div>
        )}
        {result && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-slate-300 font-medium">Status</div>
            <div className="text-slate-400 text-sm mt-1">
              Recebido em {result.dateISO}. Empresa:{" "}
              {result.company?.companyName || "-"}
            </div>
            <div className="mt-3">
              <div className="text-slate-400 text-sm mb-1">
                Linha do tempo:
              </div>
              <div className="space-y-2">
                {(result.updates || []).map((u, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-1" />
                    <div className="text-sm text-slate-300">
                      <div className="font-medium">{u.status}</div>
                      <div className="text-xs text-slate-400">
                        {u.ts}
                        {u.note ? ` - ${u.note}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
                {(!result.updates || result.updates.length === 0) && (
                  <div className="text-xs text-slate-500">
                    Sem atualizações adicionais.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ======= Admin + My Trackings ======= */
function MyTrackings() {
  const [list, setList] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("KASH_TRACKINGS");
      setList(raw ? JSON.parse(raw) : []);
    } catch {
      setList([]);
    }
  }, []);
  if (!list || list.length === 0) return null;
  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <SectionTitle
          title="Meus protocolos neste dispositivo"
          subtitle="Últimos cadastros salvos neste navegador."
        />
        <div className="mt-4 grid gap-3">
          {list.map((e) => (
            <div
              key={e.code}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3"
            >
              <div className="text-sm text-slate-300">
                <div className="font-medium">{e.company || "-"}</div>
                <div className="text-slate-400 text-xs">
                  Tracking: {e.code} · {e.dateISO}
                </div>
              </div>
              <div className="flex gap-2">
                <CTAButton
                  onClick={() => {
                    const raw = localStorage.getItem(e.code);
                    if (!raw) return;
                    const data = JSON.parse(raw);
                    alert(
                      `Empresa: ${
                        data.company?.companyName || "-"
                      }\nTracking: ${data.tracking}\nData: ${data.dateISO}`
                    );
                  }}
                >
                  Ver
                </CTAButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [selected, setSelected] = useState("");
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const refreshList = () => {
    try {
      const raw = localStorage.getItem("KASH_TRACKINGS");
      setList(raw ? JSON.parse(raw) : []);
    } catch {
      setList([]);
    }
  };
  useEffect(() => {
    refreshList();
  }, []);
  const tryAuth = () => {
    if (pin === "246810") setAuthed(true);
    else alert("PIN inválido");
  };
  const addUpdate = async () => {
    if (!selected) return alert("Escolha um tracking.");
    if (!status) return alert("Informe um status.");
    try {
      const raw = localStorage.getItem(selected);
      if (!raw) return alert("Tracking não encontrado.");
      const data = JSON.parse(raw);
      const now = new Date();
      const ts = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(
        2,
        "0"
      )} ${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const upd = { ts, status, note };
      data.updates = Array.isArray(data.updates)
        ? [...data.updates, upd]
        : [upd];
      localStorage.setItem(selected, JSON.stringify(data));
      setStatus("");
      setNote("");
      alert("Atualização adicionada.");
    } catch {
      alert("Falha ao atualizar.");
    }
  };

  return (
    <section className="py-12 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <SectionTitle
            title="Painel interno (admin)"
            subtitle="Adicionar atualizações de status aos trackings salvos neste navegador."
          />
          <button
            className="text-xs text-emerald-400 hover:underline"
            onClick={() => setOpen(!open)}
            type="button"
          >
            {open ? "Ocultar" : "Abrir"}
          </button>
        </div>
        {!open ? null : (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
            {!authed ? (
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="text-sm text-slate-300">
                    PIN de acesso (teste)
                  </div>
                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700"
                    placeholder="Digite o PIN"
                  />
                </div>
                <CTAButton onClick={tryAuth}>Entrar</CTAButton>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-2">
                  <div>
                    <div className="text-sm text-slate-300">Tracking</div>
                    <select
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700"
                    >
                      <option value="">Selecione…</option>
                      {list.map((e) => (
                        <option key={e.code} value={e.code}>
                          {e.code} - {e.company}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Status</div>
                    <input
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700"
                      placeholder='Ex.: "Enviado ao Estado", "EIN solicitado ao IRS"'
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">
                      Nota (opcional)
                    </div>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded bg-slate-950 px-3 py-2 text-sm text-slate-100 border border-slate-700"
                      placeholder="Detalhe adicional"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <CTAButton onClick={addUpdate}>
                    Adicionar atualização
                  </CTAButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/* ======= FORM WIZARD ======= */
const initialErrors = { company: {}, members: [], accept: {} };

function FormWizard({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [tracking, setTracking] = useState("");
  const [consent, setConsent] = useState(false); // checkbox obrigatório
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [errors, setErrors] = useState(initialErrors);

  useEffect(() => {
    // limpa fundo branco e garante overlay escuro
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  // Address logic
  useEffect(() => {
    if (form.company.hasFloridaAddress && form.accept.limitations) {
      dispatch({
        type: "TOGGLE_ACCEPT",
        key: "limitations",
        value: false,
      });
    }
  }, [form.company.hasFloridaAddress]);

  const updateCompany = (field, value) =>
    dispatch({ type: "UPDATE_COMPANY", field, value });
  const updateUS = (field, value) =>
    dispatch({ type: "UPDATE_US_ADDRESS", field, value });
  const updateMember = (index, field, value) =>
    dispatch({ type: "UPDATE_MEMBER", index, field, value });
  const addMember = () => dispatch({ type: "ADD_MEMBER" });
  const removeMember = (i) =>
    dispatch({ type: "REMOVE_MEMBER", index: i });
  const toggleAccept = (k, v) =>
    dispatch({ type: "TOGGLE_ACCEPT", key: k, value: v });

  function validate() {
    const { company, members, accept } = form;
    const errs = {
      company: {},
      members: members.map(() => ({})),
      accept: {},
    };
    if (!company.companyName || company.companyName.length < 3)
      errs.company.companyName = "Informe o nome da LLC.";
    if (!emailRe.test(company.email || ""))
      errs.company.email = "E-mail inválido.";
    if (!phoneRe.test(company.phone || ""))
      errs.company.phone = "Telefone inválido.";
    if (company.hasFloridaAddress) {
      if (!company.usAddress.line1)
        errs.company.line1 = "Address Line 1 obrigatório.";
      if (!company.usAddress.city)
        errs.company.city = "City obrigatória.";
      if (!company.usAddress.state)
        errs.company.state = "State obrigatório.";
      if (!company.usAddress.zip) errs.company.zip = "ZIP obrigatório.";
    }
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.fullName || m.fullName.length < 5)
        errs.members[i].fullName = "Nome inválido.";
      if (!emailRe.test(m.email || ""))
        errs.members[i].email = "E-mail inválido.";
      if (!phoneRe.test(m.phone || ""))
        errs.members[i].phone = "Telefone inválido.";
      if (!m.passport || m.passport.length < 5)
        errs.members[i].passport = "Documento obrigatório.";
      if (!m.docExpiry) errs.members[i].docExpiry = "Validade obrigatória.";
      if (!m.birthdate)
        errs.members[i].birthdate = "Nascimento obrigatório.";
      if (!m.percent || Number(m.percent) <= 0)
        errs.members[i].percent = "% obrigatório.";
      if (m.birthdate && calcAgeFullDate(m.birthdate) < 18)
        errs.members[i].birthdate = "Precisa ter 18+.";
    }
    if (!isPercentTotalValid(members))
      alert("A soma dos percentuais deve ser 100%.");
    if (!accept.responsibility)
      errs.accept.base = "Aceite a declaração de responsabilidade.";
    if (!company.hasFloridaAddress && !accept.limitations)
      errs.accept.base =
        "Aceite as limitações (endereço/agente 12 meses).";
    setErrors(errs);
    const companyOk = Object.keys(errs.company).length === 0;
    const membersOk = errs.members.every(
      (m) => Object.keys(m).length === 0
    );
    const acceptOk =
      accept.responsibility &&
      (company.hasFloridaAddress || accept.limitations);
    return (
      companyOk && membersOk && acceptOk && isPercentTotalValid(members)
    );
  }

  async function handleSubmit() {
    if (!consent) {
      alert("Marque o consentimento para continuar.");
      return;
    }
    setSending(true);
    try {
      let kashId = localStorage.getItem("kashId");
      if (!kashId) {
        kashId =
          "KASH-" +
          Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem("kashId", kashId);
      }
      await apiUpsertFull({
        kashId,
        company: form.company,
        members: form.members,
        consent: true,
      });
      setTracking(kashId);
      setStep(3); // sucesso
    } catch (err) {
      console.error(err);
      alert(
        "Falha ao enviar. " +
          (err && err.message ? err.message : "Tente novamente.")
      );
    } finally {
      setSending(false);
    }
  }

  const { company, members, accept } = form;

  return (
    <div className={classNames("fixed inset-0 z-50", !open && "hidden")}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-10">
          <div className="rounded-2xl bg-slate-950/90 backdrop-blur border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="text-slate-300 font-medium">
                Formulário de Aplicação LLC
              </div>
              <button
                className="text-slate-400 hover:text-slate-200"
                onClick={onClose}
                type="button"
              >
                Fechar
              </button>
            </div>

            {step === 1 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">
                  1/2 - Dados iniciais da LLC
                </h4>
                <div className="mt-4 grid gap-4">
                  <div>
                    <label className="block text-sm text-slate-400">
                      Nome da LLC
                    </label>
                    <input
                      className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Ex.: SUNSHINE MEDIA LLC"
                      value={company.companyName}
                      onChange={(e) =>
                        updateCompany("companyName", e.target.value)
                      }
                    />
                    <div className="text-red-400 text-xs">
                      {errors.company.companyName || ""}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400">
                        E-mail principal
                      </label>
                      <input
                        type="email"
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="email@exemplo.com"
                        value={company.email}
                        onChange={(e) =>
                          updateCompany("email", e.target.value)
                        }
                      />
                      <div className="text-red-400 text-xs">
                        {errors.company.email || ""}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400">
                        Telefone principal
                      </label>
                      <input
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="+1 (305) 123-4567"
                        value={company.phone}
                        onChange={(e) =>
                          updateCompany("phone", e.target.value)
                        }
                      />
                      <div className="text-red-400 text-xs">
                        {errors.company.phone || ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={company.hasFloridaAddress}
                        onChange={(e) =>
                          updateCompany(
                            "hasFloridaAddress",
                            e.target.checked
                          )
                        }
                      />
                      <span>Possui endereço físico na Flórida?</span>
                    </label>
                  </div>
                  {company.hasFloridaAddress ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-slate-300 font-medium mb-2">
                        Endereço da empresa (USA)
                      </div>
                      <input
                        className="w-full rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Address Line 1"
                        value={company.usAddress.line1}
                        onChange={(e) => updateUS("line1", e.target.value)}
                      />
                      <div className="grid md:grid-cols-3 gap-2 mt-2">
                        <input
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="City"
                          value={company.usAddress.city}
                          onChange={(e) =>
                            updateUS("city", e.target.value)
                          }
                        />
                        <select
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          value={company.usAddress.state}
                          onChange={(e) =>
                            updateUS("state", e.target.value)
                          }
                        >
                          {US_STATES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <input
                          className="rounded bg-slate-900 px-3 py-2 text-sm text-slate-100 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="ZIP Code"
                          value={company.usAddress.zip}
                          onChange={(e) => updateUS("zip", e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                      Não possui endereço na Flórida - usaremos o{" "}
                      <b>endereço e agente da KASH por 12 meses</b> incluídos
                      no pacote.
                    </div>
                  )}
                </div>

                <h4 className="mt-6 text-slate-100 font-medium">
                  Sócios (mínimo 2)
                </h4>
                <div className="mt-2 space-y-4">
                  {members.map((m, i) => (
                    <MemberCard
                      key={i}
                      index={i}
                      data={m}
                      canRemove={members.length > 2}
                      onChange={(field, value) =>
                        updateMember(i, field, value)
                      }
                      onRemove={() => removeMember(i)}
                      errors={errors.members[i] || {}}
                    />
                  ))}
                </div>
                <button
                  onClick={addMember}
                  className="mt-4 text-emerald-400 hover:underline"
                  type="button"
                >
                  + Adicionar sócio
                </button>

                <div className="mt-6 space-y-3 text-sm text-slate-300">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={accept.responsibility}
                      onChange={(e) =>
                        toggleAccept("responsibility", e.target.checked)
                      }
                    />
                    <span>
                      Declaro que todas as informações prestadas são
                      verdadeiras e completas e assumo total responsabilidade
                      civil e legal por elas.
                    </span>
                  </label>
                  <label
                    className={classNames(
                      "flex items-start gap-2",
                      company.hasFloridaAddress && "opacity-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={accept.limitations}
                      disabled={company.hasFloridaAddress}
                      onChange={(e) =>
                        toggleAccept("limitations", e.target.checked)
                      }
                    />
                    <span>
                      Estou ciente de que endereço e agente da KASH são
                      válidos por 12 meses.
                    </span>
                  </label>
                  {company.hasFloridaAddress && (
                    <div className="text-[12px] text-slate-400 -mt-2">
                      * Indisponível porque você informou endereço próprio na
                      Flórida.
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <CTAButton
                    onClick={() => {
                      if (validate()) setStep(2);
                    }}
                  >
                    Continuar
                  </CTAButton>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6">
                <h4 className="text-slate-100 font-medium">
                  2/2 - Revisão
                </h4>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-slate-300 font-medium">
                    Empresa
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    <div>
                      <span className="text-slate-500">Nome: </span>
                      {company.companyName || "-"}
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-6">
                      <div>
                        <span className="text-slate-500">E-mail: </span>
                        {company.email || "-"}
                      </div>
                      <div>
                        <span className="text-slate-500">Telefone: </span>
                        {company.phone || "-"}
                      </div>
                    </div>
                    {company.hasFloridaAddress ? (
                      <div className="mt-1">
                        <div className="text-slate-400">
                          Endereço informado:
                        </div>
                        <div>{company.usAddress.line1}</div>
                        <div>
                          {company.usAddress.city}, {company.usAddress.state}{" "}
                          {company.usAddress.zip}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1">
                        Será utilizado o endereço e agente da KASH por 12
                        meses.
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 mt-4">
                  <div className="text-slate-300 font-medium">Sócios</div>
                  <div className="mt-2 space-y-3 text-sm text-slate-400">
                    {members.map((m, i) => (
                      <div key={i}>
                        <div className="font-medium text-slate-300">
                          Sócio {i + 1}: {m.fullName || "-"}
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                          <div>
                            <span className="text-slate-500">E-mail: </span>
                            {m.email || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Telefone:{" "}
                            </span>
                            {m.phone || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Documento:{" "}
                            </span>
                            {m.passport || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Órgão emissor:{" "}
                            </span>
                            {m.issuer || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Validade doc.:{" "}
                            </span>
                            {m.docExpiry || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Nascimento:{" "}
                            </span>
                            {m.birthdate || "-"}
                          </div>
                          <div>
                            <span className="text-slate-500">
                              Participação:{" "}
                            </span>
                            {m.percent || "-"}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CONSENTIMENTO OBRIGATÓRIO */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <label className="flex items-start gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      <b>Autorizo a KASH Corporate Solutions</b> a conferir e
                      validar as informações fornecidas para fins de abertura e
                      registro da empresa.
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex justify-between gap-3">
                  <CTAButton variant="ghost" onClick={() => setStep(1)}>
                    Voltar
                  </CTAButton>
                  <CTAButton onClick={handleSubmit} disabled={!consent || sending}>
                    {sending ? "Enviando..." : "Enviar"}
                  </CTAButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-6">
                <div className="text-center">
                  <h4 className="text-slate-100 font-medium">
                    Dados enviados com sucesso
                  </h4>
                  <p className="text-slate-400 mt-2">
                    Seu código de acompanhamento (tracking):
                  </p>
                  <div className="mt-2 text-emerald-400 text-xl font-bold">
                    {tracking}
                  </div>
                  <p className="text-slate-400 mt-4">
                    Sua aplicação foi recebida. A equipe KASH analisará as
                    informações e enviará o link de pagamento e contrato por
                    e-mail em até 48 horas.
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <CTAButton variant="primary" onClick={onClose}>
                    Concluir
                  </CTAButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== FOOTER & APP ================== */
function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-400 text-sm">
          © {new Date().getFullYear()} KASH Solutions - {CONFIG.brand.legal}
        </div>
        <div className="text-slate-400 text-sm">
          Contato: {CONFIG.contact.email}
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Hero onStart={() => setOpen(true)} />
      <Services />
      <Pricing onStart={() => setOpen(true)} />
      <HowItWorks />
      <AdminPanel />
      <MyTrackings />
      <TrackingSearch />
      <Footer />
      <FormWizard open={open} onClose={() => setOpen(false)} />
    </div>
  );
}