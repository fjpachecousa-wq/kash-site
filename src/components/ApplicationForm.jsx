// src/components/ApplicationForm.jsx — v2 (com Sócios + Declarações + Contrato)
import React, { useMemo, useState } from "react";

// ajuste se necessário:
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xblawgpk";
const REDIRECT_URL = "https://www.kashsolutions.us/sucesso";
const MAX_SOCIOS = 5;

export default function ApplicationForm({
  formspreeEndpoint = FORMSPREE_ENDPOINT,
  redirectUrl = REDIRECT_URL,
}) {
  const [form, setForm] = useState({
    // Solicitante
    applicantName: "",
    applicantEmail: "",
    phone: "",
    // Business
    businessNamePrimary: "",
    businessNameAlt: "",
    // Endereço
    addressChoice: "kash", // "kash" | "own"
    ownStreet: "",
    ownCity: "",
    ownState: "FL",
    ownZip: "",
    // Aceites
    agree: false,
    decl_truth: false,
    decl_authorize: false,
    decl_registeredAddress: false,
    decl_taxAwareness: false,
  });

  const [socios, setSocios] = useState([
    { fullName: "", email: "", country: "BR", idDoc: "", ownership: "", role: "Member" },
  ]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Sócios helpers
  const setSocioField = (idx, key, value) =>
    setSocios((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  const addSocio = () =>
    setSocios((prev) =>
      prev.length >= MAX_SOCIOS ? prev : [...prev, { fullName: "", email: "", country: "BR", idDoc: "", ownership: "", role: "Member" }]
    );
  const removeSocio = (idx) => setSocios((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  // Datas e textos
  const today = useMemo(() => new Date(), []);
  const dataStr = useMemo(
    () => today.toLocaleDateString("pt-BR", { year: "numeric", month: "2-digit", day: "2-digit" }),
    [today]
  );
  const usingOwnAddress = form.addressChoice === "own";
  const enderecoResumo = usingOwnAddress
    ? `${form.ownStreet}, ${form.ownCity} - ${form.ownState}, ${form.ownZip}`
    : "Endereço físico KASH Corporate Solutions por até 12 meses (sem custo)";
  const subject = `Nova aplicação LLC — ${form.businessNamePrimary || "(sem nome)"}`;

  const sociosTexto =
    socios.length > 0
      ? socios
          .map(
            (s, i) =>
              `Sócio ${i + 1}: ${s.fullName || "(sem nome)"} | Email: ${s.email || "—"} | País: ${
                s.country || "—"
              } | Doc: ${s.idDoc || "—"} | Quota: ${s.ownership || "—"}% | Papel: ${s.role || "Member"}`
          )
          .join("\n")
      : "—";

  const declaracoesTexto = [
    ["Veracidade das informações", form.decl_truth],
    ["Autorizo a submissão dos dados para abertura de empresa e EIN", form.decl_authorize],
    ["Concordo com uso de endereço/registered agent KASH por até 12 meses (se selecionado)", form.decl_registeredAddress],
    ["Ciente de que questões fiscais específicas exigem orientação própria; este formulário não é consultoria individual", form.decl_taxAwareness],
  ]
    .map(([label, ok], i) => `${i + 1}. ${label}: ${ok ? "SIM" : "NÃO"}`)
    .join("\n");

  const contratoTexto =
    "CONTRATO DE PRESTAÇÃO DE SERVIÇOS — ABERTURA DE LLC NA FLÓRIDA\n\n" +
    `Contratante: ${form.applicantName} (${form.applicantEmail} | ${form.phone})\n` +
    `Business (Primário): ${form.businessNamePrimary}\n` +
    `Business (Alternativo): ${form.businessNameAlt || "—"}\n` +
    `Endereço escolhido: ${enderecoResumo}\n\n` +
    `SÓCIOS\n${sociosTexto}\n\n` +
    "1. Objeto. O Contratado, KASH Corporate Solutions LLC (\"KASH\"), executará os serviços de aplicação/registro de uma Limited Liability Company (LLC) no Estado da Flórida e, após aprovação, a aplicação para obtenção do EIN junto ao IRS.\n\n" +
    "2. Endereço & Agente Registrado. A KASH disponibilizará endereço físico na Flórida e registered agent por até 12 (doze) meses, sem custo adicional. Caso o Contratante opte por utilizar endereço próprio na Flórida, declara que o endereço informado é válido e apto ao recebimento de correspondências.\n\n" +
    "3. Responsabilidade das Informações. Todas as informações enviadas pelo Contratante são de sua exclusiva responsabilidade, respondendo este pela veracidade e atualização dos dados prestados.\n\n" +
    "4. Pagamento e Vigência. Este contrato entra em vigor após o pagamento integral do pacote de abertura (US$ 1.360) na forma disponibilizada no site.\n\n" +
    "5. Foros. Fica eleito, à escolha do Contratante, o foro da Comarca do Rio de Janeiro/RJ, Brasil, e/ou, se necessário, o do Condado de Orange, Estado da Flórida, EUA.\n\n" +
    "6. Aceite Eletrônico. O Contratante declara que LEU E CONCORDA com os termos deste contrato, substituindo a assinatura manuscrita por aceite eletrônico (checkbox).\n\n" +
    `DECLARAÇÕES DO APLICANTE\n${declaracoesTexto}\n\n` +
    `Local: Orlando-FL (on-line)    Data: ${dataStr}`;

  const totalOwnership = socios.reduce((acc, s) => acc + (parseFloat(s.ownership) || 0), 0);

  return (
    <form action={formspreeEndpoint} method="POST" className="grid gap-8">
      {/* Formspree meta */}
      <input type="hidden" name="_subject" value={subject} />
      <input type="hidden" name="_redirect" value={redirectUrl} />
      <input type="text" name="_gotcha" className="hidden" aria-hidden="true" tabIndex={-1} />

      {/* Solicitante */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Dados do Solicitante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text">Nome completo *</span></label>
            <input required name="applicantName" value={form.applicantName} onChange={onChange} className="input input-bordered w-full" />
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text">E-mail *</span></label>
            <input required type="email" name="applicantEmail" value={form.applicantEmail} onChange={onChange} className="input input-bordered w-full" />
          </div>
          <div className="form-control md:col-span-2">
            <label className="label"><span className="label-text">Telefone (com DDI)</span></label>
            <input name="phone" value={form.phone} onChange={onChange} className="input input-bordered w-full" />
          </div>
        </div>
      </section>

      {/* Business */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Nome(s) do Business</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label"><span className="label-text">Primário *</span></label>
            <input required name="businessNamePrimary" value={form.businessNamePrimary} onChange={onChange} className="input input-bordered w-full" />
          </div>
          <div className="form-control w-full">
            <label className="label"><span className="label-text">Alternativo</span></label>
            <input name="businessNameAlt" value={form.businessNameAlt} onChange={onChange} className="input input-bordered w-full" />
          </div>
        </div>
      </section>

      {/* Sócios */}
      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Sócios (1–{MAX_SOCIOS})</h2>
          <div className="text-sm opacity-70">Total de quotas informado: {totalOwnership}%</div>
        </div>

        {socios.map((s, idx) => (
          <div key={idx} className="card bg-base-100 border">
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text">Nome completo do sócio *</span></label>
                <input required name={`partners[${idx}][fullName]`} value={s.fullName} onChange={(e) => setSocioField(idx, "fullName", e.target.value)} className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">E-mail</span></label>
                <input type="email" name={`partners[${idx}][email]`} value={s.email} onChange={(e) => setSocioField(idx, "email", e.target.value)} className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">País</span></label>
                <input name={`partners[${idx}][country]`} value={s.country} onChange={(e) => setSocioField(idx, "country", e.target.value)} className="input input-bordered" placeholder="BR" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Documento (Passaporte/ID)</span></label>
                <input name={`partners[${idx}][idDoc]`} value={s.idDoc} onChange={(e) => setSocioField(idx, "idDoc", e.target.value)} className="input input-bordered" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Quota (%)</span></label>
                <input name={`partners[${idx}][ownership]`} value={s.ownership} onChange={(e) => setSocioField(idx, "ownership", e.target.value)} className="input input-bordered" placeholder="ex.: 50" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Papel</span></label>
                <select name={`partners[${idx}][role]`} value={s.role} onChange={(e) => setSocioField(idx, "role", e.target.value)} className="select select-bordered">
                  <option>Member</option>
                  <option>Manager</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-2">
                {socios.length > 1 && (
                  <button type="button" className="btn btn-outline btn-error" onClick={() => removeSocio(idx)}>
                    Remover sócio
                  </button>
                )}
                {idx === socios.length - 1 && socios.length < MAX_SOCIOS && (
                  <button type="button" className="btn btn-outline" onClick={addSocio}>
                    + Adicionar sócio
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
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
                  <input required={usingOwnAddress} name="ownStreet" value={form.ownStreet} onChange={onChange} className="input input-bordered" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Cidade *</span></label>
                  <input required={usingOwnAddress} name="ownCity" value={form.ownCity} onChange={onChange} className="input input-bordered" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Estado (2 letras) *</span></label>
                  <input required={usingOwnAddress} name="ownState" value={form.ownState} onChange={onChange} className="input input-bordered uppercase" maxLength={2} pattern="[A-Za-z]{2}" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">ZIP Code *</span></label>
                  <input required={usingOwnAddress} name="ownZip" value={form.ownZip} onChange={onChange} className="input input-bordered" pattern="[0-9]{5}(-[0-9]{4})?" />
                </div>
              </div>
            </div>
          ) : (
            <div className="alert">
              <span>Você está optando por utilizar o endereço físico da KASH por até 12 meses, sem custo. Esse endereço será usado para registro e recebimento de correspondências da empresa.</span>
            </div>
          )}
        </div>
      </section>

      {/* Declarações */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Declarações dos Aplicantes</h2>
        <label className="flex items-start gap-3">
          <input required type="checkbox" name="decl_truth" checked={form.decl_truth} onChange={onChange} className="checkbox mt-1" />
          <span>As informações prestadas são verdadeiras e completas.</span>
        </label>
        <label className="flex items-start gap-3">
          <input required type="checkbox" name="decl_authorize" checked={form.decl_authorize} onChange={onChange} className="checkbox mt-1" />
          <span>Autorizo a KASH a submeter os dados para abertura da LLC e obtenção do EIN.</span>
        </label>
        <label className="flex items-start gap-3">
          <input required type="checkbox" name="decl_registeredAddress" checked={form.decl_registeredAddress} onChange={onChange} className="checkbox mt-1" />
          <span>Concordo com o uso do endereço físico e registered agent da KASH por até 12 meses (se selecionado acima).</span>
        </label>
        <label className="flex items-start gap-3">
          <input required type="checkbox" name="decl_taxAwareness" checked={form.decl_taxAwareness} onChange={onChange} className="checkbox mt-1" />
          <span>Estou ciente de que questões fiscais específicas exigem orientação própria; este formulário não é consultoria individual.</span>
        </label>
      </section>

      {/* Aceite + Contrato */}
      <section className="grid gap-3">
        <h2 className="text-base font-semibold tracking-tight">Aceite do Contrato</h2>
        <label className="flex items-start gap-3">
          <input required type="checkbox" name="agree" checked={form.agree} onChange={onChange} className="checkbox mt-1" />
          <span>LI E CONCORDO com os termos do contrato abaixo; o aceite eletrônico substitui a assinatura manuscrita.</span>
        </label>

        <h2 className="text-base font-semibold tracking-tight">Pré-visualização do Contrato</h2>
        <div className="card bg-base-100">
          <div className="card-body whitespace-pre-wrap text-sm leading-6">{contratoTexto}</div>
        </div>

        {/* dados para o Formspree */}
        <textarea name="contract_text" value={contratoTexto} readOnly className="hidden" />
        <input type="hidden" name="address_summary" value={enderecoResumo} />
        <input type="hidden" name="agree_checkbox" value={form.agree ? "true" : "false"} />

        {/* também mandamos os sócios em campos nomeados */}
        {socios.map((s, idx) => (
          <div key={`hidden-${idx}`} className="hidden">
            <input name={`partners[${idx}][fullName]`} defaultValue={s.fullName} />
            <input name={`partners[${idx}][email]`} defaultValue={s.email} />
            <input name={`partners[${idx}][country]`} defaultValue={s.country} />
            <input name={`partners[${idx}][idDoc]`} defaultValue={s.idDoc} />
            <input name={`partners[${idx}][ownership]`} defaultValue={s.ownership} />
            <input name={`partners[${idx}][role]`} defaultValue={s.role} />
          </div>
        ))}
      </section>

      {/* Enviar */}
      <div className="flex items-center justify-between">
        <small className="opacity-70">Ao enviar, sua aplicação, declarações e contrato são encaminhados ao nosso time.</small>
        <button type="submit" className="btn btn-primary">Enviar Aplicação</button>
      </div>
    </form>
  );
}
