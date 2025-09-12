import React, { useMemo, useState } from "react";

// ===============================
// Configurações
// ===============================
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xblawgpk"; // ajuste se necessário
const REDIRECT_URL = "https://www.kashsolutions.us/sucesso";  // ajuste se já existir

// ===============================
// Componente do Formulário
// ===============================
function ApplicationForm({
  formspreeEndpoint = FORMSPREE_ENDPOINT,
  redirectUrl = REDIRECT_URL,
}) {
  const [form, setForm] = useState({
    applicantName: "",
    applicantEmail: "",
    phone: "",
    businessNamePrimary: "",
    businessNameAlt: "",
    addressChoice: "kash", // "kash" | "own"
    ownStreet: "",
    ownCity: "",
    ownState: "FL",
    ownZip: "",
    agree: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const today = useMemo(() => new Date(), []);
  const dataStr = useMemo(
    () =>
      today.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    [today]
  );

  const usingOwnAddress = form.addressChoice === "own";

  const enderecoResumo = usingOwnAddress
    ? `${form.ownStreet}, ${form.ownCity} - ${form.ownState}, ${form.ownZip}`
    : "Endereço físico KASH Corporate Solutions por até 12 meses (sem custo)";

  const subject = `Nova aplicação LLC — ${form.businessNamePrimary || "(sem nome)"}`;

  const contratoTexto = useMemo(() => {
    return (
      "CONTRATO DE PRESTAÇÃO DE SERVIÇOS — ABERTURA DE LLC NA FLÓRIDA\n\n" +
      `Contratante: ${form.applicantName} (${form.applicantEmail} | ${form.phone})\n` +
      `Business (Primário): ${form.businessNamePrimary}\n` +
      `Business (Alternativo): ${form.businessNameAlt || "—"}\n` +
      `Endereço escolhido: ${enderecoResumo}\n\n` +
      "1. Objeto. O Contratado, KASH Corporate Solutions LLC (\"KASH\"), executará os serviços de aplicação/registro de uma Limited Liability Company (LLC) no Estado da Flórida e, após aprovação, a aplicação para obtenção do EIN junto ao IRS.\n\n" +
      "2. Endereço & Agente Registrado. A KASH disponibilizará endereço físico na Flórida e registered agent por até 12 (doze) meses, sem custo adicional. Caso o Contratante opte por utilizar endereço próprio na Flórida, declara que o endereço informado é válido e apto ao recebimento de correspondências.\n\n" +
      "3. Responsabilidade das Informações. Todas as informações enviadas pelo Contratante são de sua exclusiva responsabilidade, respondendo este pela veracidade e atualização dos dados prestados.\n\n" +
      "4. Pagamento e Vigência. Este contrato entra em vigor após o pagamento integral do pacote de abertura (US$ 1.360) na forma disponibilizada no site.\n\n" +
      "5. Foros. Fica eleito, à escolha do Contratante, o foro da Comarca do Rio de Janeiro/RJ, Brasil, e/ou, se necessário, o do Condado de Orange, Estado da Flórida, EUA.\n\n" +
      "6. Aceite Eletrônico. O Contratante declara que LEU E CONCORDA com os termos deste contrato, substituindo a assinatura manuscrita por aceite eletrônico (checkbox).\n\n" +
      `Local: Orlando-FL (on-line)    Data: ${dataStr}`
    );
  }, [
    form.applicantName,
    form.applicantEmail,
    form.phone,
    form.businessNamePrimary,
    form.businessNameAlt,
    enderecoResumo,
    dataStr,
  ]);

  return (
    <form action={formspreeEndpoint} method="POST" className="grid gap-8">
      {/* Metacampos Formspree */}
      <input type="hidden" name="_subject" value={subject} />
      <input type="hidden" name="_redirect" value={redirectUrl} />
      <input type="text" name="_gotcha" className="hidden" aria-hidden="true" tabIndex={-1} />

      {/* Dados do Solicitante */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Dados do Solicitante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text">Nome completo *</span></label>
            <input
              required
              type="text"
              name="applicantName"
              value={form.applicantName}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="Seu nome"
              autoComplete="name"
            />
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text">E-mail *</span></label>
            <input
              required
              type="email"
              name="applicantEmail"
              value={form.applicantEmail}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="voce@exemplo.com"
              autoComplete="email"
            />
          </div>
          <div className="form-control md:col-span-2">
            <label className="label"><span className="label-text">Telefone (com DDI)</span></label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="+1 (___) ___-____"
              autoComplete="tel"
            />
          </div>
        </div>
      </section>

      {/* Nomes do Business */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Nome(s) do Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text">Primário *</span></label>
            <input
              required
              type="text"
              name="businessNamePrimary"
              value={form.businessNamePrimary}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="Ex.: Sunwave Media LLC"
            />
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text">Alternativo</span></label>
            <input
              type="text"
              name="businessNameAlt"
              value={form.businessNameAlt}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="Opção de backup para aprovação"
            />
          </div>
        </div>
      </section>

      {/* Endereço */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Endereço na Flórida</h2>
        <div className="grid gap-3">
          <div className="join join-vertical md:join-horizontal">
            <label className="btn btn-outline join-item justify-start">
              <input
                type="radio"
                name="addressChoice"
                value="kash"
                checked={form.addressChoice === "kash"}
                onChange={onChange}
                className="radio mr-2"
              />
              Usar endereço físico KASH (12 meses, sem custo)
            </label>
            <label className="btn btn-outline join-item justify-start">
              <input
                type="radio"
                name="addressChoice"
                value="own"
                checked={form.addressChoice === "own"}
                onChange={onChange}
                className="radio mr-2"
              />
              Usar meu próprio endereço na Flórida
            </label>
          </div>

          {usingOwnAddress ? (
            <div className="card bg-base-100">
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control md:col-span-2">
                  <label className="label"><span className="label-text">Street Address *</span></label>
                  <input
                    required={usingOwnAddress}
                    type="text"
                    name="ownStreet"
                    value={form.ownStreet}
                    onChange={onChange}
                    className="input input-bordered"
                    placeholder="1234 Main St, Suite 100"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Cidade *</span></label>
                  <input
                    required={usingOwnAddress}
                    type="text"
                    name="ownCity"
                    value={form.ownCity}
                    onChange={onChange}
                    className="input input-bordered"
                    placeholder="Orlando"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Estado (2 letras) *</span></label>
                  <input
                    required={usingOwnAddress}
                    type="text"
                    name="ownState"
                    value={form.ownState}
                    onChange={onChange}
                    className="input input-bordered uppercase"
                    placeholder="FL"
                    maxLength={2}
                    pattern="[A-Za-z]{2}"
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">ZIP Code *</span></label>
                  <input
                    required={usingOwnAddress}
                    type="text"
                    name="ownZip"
                    value={form.ownZip}
                    onChange={onChange}
                    className="input input-bordered"
                    placeholder="32801"
                    pattern="[0-9]{5}(-[0-9]{4})?"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="alert">
              <span>
                Você está optando por utilizar o endereço físico da KASH por até 12 meses, sem custo.
                Esse endereço será usado para registro e recebimento de correspondências da empresa.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Aceite */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Aceite do Contrato</h2>
        <label className="flex items-start gap-3">
          <input
            required
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={onChange}
            className="checkbox mt-1"
          />
          <span>
            Declaro que <strong>LI E CONCORDO</strong> com os termos do contrato abaixo, ciente de que o aceite
            eletrônico substitui a assinatura manuscrita.
          </span>
        </label>
      </section>

      {/* Contrato (preview + envio hidden) */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Pré-visualização do Contrato</h2>
        <div className="card bg-base-100">
          <div className="card-body whitespace-pre-wrap text-sm leading-6">
            {contratoTexto}
          </div>
        </div>

        {/* Envio do contrato + metadados */}
        <textarea name="contract_text" value={contratoTexto} readOnly className="hidden" />
        <input type="hidden" name="agree_checkbox" value={form.agree ? "true" : "false"} />
        <input type="hidden" name="address_summary" value={enderecoResumo} />
      </section>

      {/* Enviar */}
      <div className="flex items-center justify-between">
        <small className="opacity-70">Ao enviar, sua aplicação e o contrato são encaminhados ao nosso time.</small>
        <button type="submit" className="btn btn-primary">Enviar Aplicação</button>
      </div>
    </form>
  );
}

// ===============================
// App (layout simples)
// ===============================
export default function App() {
  return (
    <div className="min-h-screen">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="navbar-start">
            <a className="text-xl font-bold">KASH Solutions</a>
          </div>
          <div className="navbar-end">
            <a href="/" className="btn btn-ghost">Início</a>
          </div>
        </div>
      </header>

      <section className="container max-w-6xl mx-auto px-4 py-10">
        <div className="hero rounded-2xl bg-base-100 shadow">
          <div className="hero-content text-center">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold">Abertura de LLC na Flórida</h1>
              <p className="py-4 opacity-80">
                Preencha sua aplicação abaixo. O contrato será gerado automaticamente e enviado junto ao Formspree.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container max-w-4xl mx-auto px-4 pb-16">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <ApplicationForm />
          </div>
        </div>
      </main>

      <footer className="footer footer-center bg-base-100 text-base-content py-6 border-t">
        <aside>
          <p>© {new Date().getFullYear()} KASH Corporate Solutions LLC — Todos os direitos reservados.</p>
        </aside>
      </footer>
    </div>
  );
}
