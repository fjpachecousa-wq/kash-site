import React, { useEffect, useMemo, useState } from "react";

const OFFICE_EMAIL = "contato@kashsolutions.us";

export default function ContactEmailModal({ open, onClose, contextLabel = "" }) {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");

  const subject = useMemo(() => {
    return `Contato KASH Solutions${contextLabel ? " - " + contextLabel : ""}`;
  }, [contextLabel]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const buildMailto = () => {
    const body = [
      `Nome: ${name || "(não informado)"}`,
      `Email: ${fromEmail || "(não informado)"}`,
      contextLabel ? `Origem/Plano: ${contextLabel}` : "",
      "",
      "Mensagem:",
      message || "(vazio)",
    ]
      .filter(Boolean)
      .join("\n");

    return `mailto:${OFFICE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const onSend = (e) => {
    e.preventDefault();
    window.location.href = buildMailto();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-800">
          <div>
            <div className="text-slate-100 font-semibold text-base">Enviar e-mail ao escritório</div>
            <div className="text-slate-400 text-xs mt-1">
              Para: <span className="text-slate-200">{OFFICE_EMAIL}</span>
              {contextLabel ? <span className="text-slate-500"> • {contextLabel}</span> : null}
            </div>
          </div>
          <button
            className="btn btn-sm btn-ghost text-slate-200"
            type="button"
            aria-label="Fechar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="p-5 grid gap-3" onSubmit={onSend}>
          <input
            className="input input-bordered bg-slate-950 border-slate-800 text-slate-100"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input input-bordered bg-slate-950 border-slate-800 text-slate-100"
            placeholder="Seu e-mail"
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
          />
          <textarea
            className="textarea textarea-bordered bg-slate-950 border-slate-800 text-slate-100"
            placeholder="Escreva sua mensagem…"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button className="btn btn-outline btn-sm" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-none" type="submit">
              Abrir e-mail
            </button>
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            Ao clicar em <span className="text-slate-300">Abrir e-mail</span>, seu dispositivo abrirá o aplicativo de e-mail
            com a mensagem pré-preenchida.
          </div>
        </form>
      </div>
    </div>
  );
}
