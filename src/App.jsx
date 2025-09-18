import React, { useEffect, useMemo, useState } from "react";

/** =====================================================
 *  KASH — App.jsx (standalone)
 *  - SPA sem react-router (state-based routes)
 *  - Form + Contract (PT/EN)
 *  - Formspree endpoint + tracking + PDF (jsPDF via import dinâmico)
 *  ===================================================== */

const ENDPOINT_FORMSPREE = "https://formspree.io/f/xblawgpk";
const PRODUCT_PRICE = 1360; // USD

/* --------------------- helpers --------------------- */
const pad2 = (n) => String(n).padStart(2, "0");
function nowFmt(locale = "pt-BR") {
  const d = new Date();
  return d.toLocaleString(locale, { hour12: false });
}
function makeTracking() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KASH-${stamp}-${rand}`;
}
function download(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* --------------------- layout --------------------- */
const Container = ({ children }) => (
  <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
    {children}
  </div>
);
const Section = ({ title, children, subtitle }) => (
  <section style={{ marginBottom: 24 }}>
    {title && <h2 style={{ margin: "0 0 8px" }}>{title}</h2>}
    {subtitle && <p style={{ margin: "0 0 16px", opacity: 0.75 }}>{subtitle}</p>}
    {children}
  </section>
);
const chip = { border: "1px solid #e5e7eb", padding: "8px 12px", borderRadius: 8, background: "#fff" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb" };
const textarea = { ...input, minHeight: 120, resize: "vertical" };
const button = { padding: "10px 14px", borderRadius: 10, border: "1px solid #222", background: "#111", color: "#fff", cursor: "pointer" };
const ghost = { padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" };

/* --------------------- navbar --------------------- */
function Navbar({ route, setRoute }) {
  const Item = ({ id, label }) => (
    <button
      onClick={() => setRoute(id)}
      style={{ ...chip, background: route === id ? "#f3f4f6" : "#fff", cursor: "pointer" }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
      <div style={{ fontWeight: 700 }}>KASH Corporate Solutions LLC</div>
      <span style={{ opacity: 0.4 }}>|</span>
      <Item id="home" label="Início" />
      <Item id="apply" label="Aplicação" />
      <Item id="contract" label="Contrato" />
    </div>
  );
}

/* --------------------- home --------------------- */
function Home() {
  return (
    <Section title="Bem-vindo à KASH Solutions" subtitle="Abertura de LLC na Flórida, EIN, endereço físico e agente registrado por 12 meses.">
      <div style={{ display: "grid", gap: 10 }}>
        <div style={chip}>
          Contato: <a href="mailto:contato@kashsolutions.us">contato@kashsolutions.us</a>
        </div>
        <div style={chip}>
          Planos mensais: Kash Flow 30 (US$ 300) e Kash Scale 5 (US$ 1.000). O contrato de abertura (US$ 1.360) é pago no ato.
        </div>
      </div>
    </Section>
  );
}

/* --------------------- form --------------------- */
function ApplicationForm({ onSubmitted }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    applicantFullName: "",
    applicantEmail: "",
    phone: "",
    businessName1: "",
    businessName2: "",
    hasFloridaAddress: "no",
    floridaAddress: "",
    members: "",
    declarationsAccepted: false,
  });
  const hasFL = form.hasFloridaAddress === "yes";

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.applicantFullName.trim()) return "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicantEmail)) return "E-mail inválido.";
    if (!form.businessName1.trim()) return "Informe o Business Name (opção 1).";
    if (!form.businessName2.trim()) return "Informe o Business Name (opção 2).";
    if (hasFL && !form.floridaAddress.trim()) return "Informe o endereço na Flórida.";
    if (!form.declarationsAccepted) return "Você deve aceitar os termos.";
    return null;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    const err = validate();
    if (err) { setMsg({ type: "error", text: err }); return; }
    const tracking = makeTracking();
    const submittedAt = nowFmt("pt-BR");
    const payload = { ...form, tracking, submittedAt, productPrice: PRODUCT_PRICE };

    try {
      setLoading(true);
      const res = await fetch(ENDPOINT_FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Falha ao enviar (${res.status})`);

      // download JSON-resumo (útil para auditoria do cliente)
      download(`KASH-Application-${tracking}.json`, JSON.stringify(payload, null, 2));
      setMsg({ type: "ok", text: "Aplicação enviada. O Tracking Number foi gerado." });
      onSubmitted?.(payload);
    } catch (error) {
      console.error(error);
      setMsg({ type: "error", text: "Não foi possível enviar agora. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="Formulário de Aplicação de LLC (Flórida)">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 820 }}>
        <label>Nome completo*<input style={input} name="applicantFullName" value={form.applicantFullName} onChange={onChange} /></label>
        <label>E-mail*<input style={input} name="applicantEmail" value={form.applicantEmail} onChange={onChange} /></label>
        <label>Telefone<input style={input} name="phone" value={form.phone} onChange={onChange} /></label>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <label>Business Name — Opção 1*<input style={input} name="businessName1" value={form.businessName1} onChange={onChange} /></label>
          <label>Business Name — Opção 2*<input style={input} name="businessName2" value={form.businessName2} onChange={onChange} /></label>
        </div>

        <fieldset style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
          <legend style={{ padding: "0 6px" }}>Endereço na Flórida</legend>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="radio" name="hasFloridaAddress" value="yes" checked={form.hasFloridaAddress==="yes"} onChange={onChange}/>Tenho endereço físico na Flórida</label>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="radio" name="hasFloridaAddress" value="no"  checked={form.hasFloridaAddress==="no"}  onChange={onChange}/>Não tenho endereço na Flórida</label>
          {hasFL ? (
            <label style={{ marginTop: 8 }}>Endereço na Flórida*<input style={input} name="floridaAddress" value={form.floridaAddress} onChange={onChange}/></label>
          ) : (
            <div style={{ marginTop: 8, padding: 12, background: "#fff8e1", border: "1px solid #ffe0a1", borderRadius: 8 }}>
              Será disponibilizado <b>endereço físico do escritório</b> por 12 meses, juntamente com <b>Agente Registrado</b> pelo mesmo período.
            </div>
          )}
        </fieldset>

        <label>Nomes dos sócios (um por linha)<textarea style={textarea} name="members" value={form.members} onChange={onChange} /></label>

        <label style={{ display: "flex", gap: 8 }}>
          <input type="checkbox" name="declarationsAccepted" checked={form.declarationsAccepted} onChange={onChange} />
          <span>Li e concordo com os termos. O contrato passa a valer após o pagamento único de <b>US$ {PRODUCT_PRICE.toLocaleString()}</b> (serviços e taxas) e será fornecido um <b>Tracking Number</b> para acompanhamento.</span>
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={loading} style={button}>{loading ? "Enviando..." : "Enviar aplicação"}</button>
          <a href="mailto:contato@kashsolutions.us" style={{ ...ghost, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Dúvidas</a>
        </div>

        {msg && (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 8, ...(msg.type==="ok" ? { background: "#ecfdf5", border: "1px solid #a7f3d0" } : { background: "#fef2f2", border:"1px solid #fecaca" })}}>
            {msg.text}
          </div>
        )}
      </form>
    </Section>
  );
}

/* --------------------- contrato --------------------- */
function ContractView({ data }) {
  const [lang, setLang] = useState("pt"); // 'pt' | 'en'

  const membersList = useMemo(() => {
    if (!data?.members) return [];
    return data.members.split("\n").map(s => s.trim()).filter(Boolean);
  }, [data]);

  const todayPT = nowFmt("pt-BR");
  const todayEN = nowFmt("en-US");
  const tracking = data?.tracking || makeTracking();

  const contratoPT = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS — KASH Corporate Solutions LLC
Partes: KASH Corporate Solutions LLC ("Contratada") e o(s) Contratante(s) indicado(s) no formulário de aplicação.
Objeto: A Contratada realizará a abertura de empresa LLC no Estado da Flórida e, após aprovação, solicitará o EIN.
Endereço e Agente Registrado: Será disponibilizado endereço físico e agente registrado por 12 (doze) meses a partir da assinatura.
Responsabilidade: As informações prestadas pelo(s) contratante(s) são de inteira responsabilidade dos declarantes.
Preço e Pagamento: O contrato entra em vigor após o pagamento único de US$ ${PRODUCT_PRICE.toLocaleString()} (serviços e taxas) nos meios disponibilizados no site.
Acompanhamento: Será fornecido um Tracking Number para atualização do caso.
Foro: Rio de Janeiro/RJ, Brasil, e/ou Orlando/FL, EUA, conforme conveniência do contratante.
Disposições finais: Permanecem válidas as demais condições usuais aplicáveis, sem prejuízo de ajustes específicos por escrito.`;

  const contratoEN = `SERVICE AGREEMENT — KASH Corporate Solutions LLC
Parties: KASH Corporate Solutions LLC ("Provider") and the Client(s) as indicated in the application form.
Scope: The Provider will form a Florida LLC and, after approval, apply for the EIN.
Registered Agent & Address: A physical business address and registered agent will be provided for 12 (twelve) months from the signing date.
Responsibility: All information provided by the client(s) is under their sole responsibility.
Price & Payment: This agreement becomes effective after a one-time payment of US$ ${PRODUCT_PRICE.toLocaleString()} (services and fees) via the methods available on the website.
Case Updates: A Tracking Number will be provided for status updates.
Jurisdiction: Rio de Janeiro/RJ, Brazil, and/or Orlando/FL, USA, at the Client’s convenience.
Final Provisions: All standard conditions apply, without prejudice to specific written adjustments.`;

  async function generatePDF() {
    try {
      if (typeof window === "undefined") return; // SSR guard
      const { jsPDF } = await import("jspdf"); // dynamic client-only
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const left = 56, top = 64, width = 483;

      const addPageFooter = (pageNumber, pagesTotal) => {
        const footerY = 812;
        doc.setFontSize(9);
        doc.text(`Página ${pageNumber} / ${pagesTotal}`, 530, footerY, { align: "right" });
      };

      const addHeader = () => {
        doc.setFontSize(14);
        doc.text("KASH Corporate Solutions LLC", left, top - 24);
      };

      const addSignatureBlock = () => {
        const yStart = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 640;
        let y = Math.max(yStart, 520);
        doc.setFontSize(11);

        // Local e Data + Tracking (tracking acima da data, à ESQ)
        doc.text(`Tracking: ${tracking}`, left, y);
        y += 16;
        doc.text(lang === "pt" ? `Local e Data: ${todayPT}` : `Place and Date: ${todayEN}`, left, y);
        y += 22;

        // Assinaturas dos sócios em blocos espaçados
        const list = membersList.length ? membersList : ["Sócio 1", "Sócio 2"];
        list.forEach((m, i) => {
          if (i) y += 30;
          doc.line(left, y, left + 240, y); // linha assinatura
          y += 14;
          doc.text(m, left, y);
        });
      };

      // Conteúdo (linguagem selecionada)
      const body = lang === "pt" ? contratoPT : contratoEN;

      // Paginação com splitTextToSize
      doc.setFont("Times", "Roman");
      doc.setFontSize(12);
      addHeader();
      const text = doc.splitTextToSize(body, width);
      let cursorY = top;
      const lineHeight = 16;
      let page = 1;

      for (let i = 0; i < text.length; i++) {
        if (cursorY > 720) {
          addPageFooter(page, "{pages}");
          doc.addPage();
          page++;
          addHeader();
          cursorY = top;
        }
        doc.text(text[i], left, cursorY);
        cursorY += lineHeight;
      }
      // Bloco de assinatura
      if (cursorY > 640) { addPageFooter(page, "{pages}"); doc.addPage(); page++; addHeader(); cursorY = top; }
      addSignatureBlock();

      addPageFooter(page, "{pages}");
      const pagesTotal = doc.getNumberOfPages();
      // Atualiza total nas páginas
      for (let n = 1; n <= pagesTotal; n++) {
        doc.setPage(n);
        doc.setFontSize(9);
        doc.text(`Página ${n} / ${pagesTotal}`, 530, 812, { align: "right" });
      }

      const filename = `KASH-Contract-${tracking}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error("PDF error:", e);
      alert("Não foi possível gerar o PDF neste navegador.");
    }
  }

  return (
    <Section title="Contrato de Prestação de Serviços">
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setLang("pt")} style={{ ...chip, background: lang==="pt" ? "#f3f4f6" : "#fff", cursor: "pointer" }}>Português</button>
        <button onClick={() => setLang("en")} style={{ ...chip, background: lang==="en" ? "#f3f4f6" : "#fff", cursor: "pointer" }}>English</button>
        <div style={{ flex: 1 }} />
        <button onClick={generatePDF} style={button}>Gerar PDF</button>
      </div>
      <article style={{ whiteSpace: "pre-wrap", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        {lang === "pt" ? (
          <>
            <h3 style={{ marginTop: 0 }}>Contrato — Português (Brasil)</h3>
            <p><b>Tracking:</b> {tracking}</p>
            <p><b>Local e Data:</b> {todayPT}</p>
            <p>{`CONTRATO DE PRESTAÇÃO DE SERVIÇOS — KASH Corporate Solutions LLC
Partes: KASH Corporate Solutions LLC ("Contratada") e o(s) Contratante(s) indicado(s) no formulário de aplicação.
Objeto: A Contratada realizará a abertura de empresa LLC no Estado da Flórida e, após aprovação, solicitará o EIN.
Endereço e Agente Registrado: Será disponibilizado endereço físico e agente registrado por 12 (doze) meses a partir da assinatura.
Responsabilidade: As informações prestadas pelo(s) contratante(s) são de inteira responsabilidade dos declarantes.
Preço e Pagamento: O contrato entra em vigor após o pagamento único de US$ ${PRODUCT_PRICE.toLocaleString()} (serviços e taxas) nos meios disponibilizados no site.
Acompanhamento: Será fornecido um Tracking Number para atualização do caso.
Foro: Rio de Janeiro/RJ, Brasil, e/ou Orlando/FL, EUA, conforme conveniência do contratante.
Disposições finais: Permanecem válidas as demais condições usuais aplicáveis, sem prejuízo de ajustes específicos por escrito.`}</p>
            {membersList.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div><b>Sócios:</b></div>
                <ul>{membersList.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 style={{ marginTop: 0 }}>Agreement — English (US)</h3>
            <p><b>Tracking:</b> {tracking}</p>
            <p><b>Place and Date:</b> {todayEN}</p>
            <p>{`SERVICE AGREEMENT — KASH Corporate Solutions LLC
Parties: KASH Corporate Solutions LLC ("Provider") and the Client(s) as indicated in the application form.
Scope: The Provider will form a Florida LLC and, after approval, apply for the EIN.
Registered Agent & Address: A physical business address and registered agent will be provided for 12 (twelve) months from the signing date.
Responsibility: All information provided by the client(s) is under their sole responsibility.
Price & Payment: This agreement becomes effective after a one-time payment of US$ ${PRODUCT_PRICE.toLocaleString()} (services and fees) via the methods available on the website.
Case Updates: A Tracking Number will be provided for status updates.
Jurisdiction: Rio de Janeiro/RJ, Brazil, and/or Orlando/FL, USA, at the Client’s convenience.
Final Provisions: All standard conditions apply, without prejudice to specific written adjustments.`}</p>
            {membersList.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div><b>Members:</b></div>
                <ul>{membersList.map((m, i) => <li key={i}>{m}</li>)}</ul>
              </div>
            )}
          </>
        )}
      </article>
    </Section>
  );
}

/* --------------------- app --------------------- */
export default function App() {
  const [route, setRoute] = useState("home");
  const [lastSubmission, setLastSubmission] = useState(null);

  return (
    <Container>
      <Navbar route={route} setRoute={setRoute} />

      {route === "home" && <Home />}

      {route === "apply" && (
        <ApplicationForm
          onSubmitted={(payload) => {
            setLastSubmission(payload);
            setRoute("contract");
            // scroll ao topo para o contrato
            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
          }}
        />
      )}

      {route === "contract" && <ContractView data={lastSubmission} />}

      <footer style={{ marginTop: 24, opacity: 0.6, fontSize: 12 }}>
        © {new Date().getFullYear()} KASH Corporate Solutions LLC — contato@kashsolutions.us
      </footer>
    </Container>
  );
}
