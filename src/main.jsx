import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

function showFatal(message) {
  const div = document.createElement("div");
  div.style.cssText = "padding:16px; font-family:ui-monospace,Menlo,monospace; white-space:pre-wrap; color:#fff; background:#111;";
  div.textContent = message;
  document.body.innerHTML = "";
  document.body.appendChild(div);
}

window.addEventListener("error", (e) => {
  showFatal(`Runtime error: ${e.message}\n${e.filename}:${e.lineno}:${e.colno}`);
  if (import.meta.env && import.meta.env.DEV) console.error(e.error || e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  const msg = e?.reason?.stack || e?.reason?.message || String(e.reason || e);
  showFatal(`Unhandled promise rejection:\n${msg}`);
  if (import.meta.env && import.meta.env.DEV) console.error(e);
});

function boot() {
  const el = document.getElementById("root");
  if (!el) { showFatal("Elemento #root não encontrado."); return; }
  try {
    const root = createRoot(el);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    showFatal(`Falha ao montar o App:\n${err?.stack || err?.message || String(err)}`);
    if (import.meta.env && import.meta.env.DEV) console.error(err);
  }
}

boot();
