// src/App.jsx – KASH Solutions (reescrita integral, saneada)

import React, { useEffect, useMemo, useReducer, useState } from "react";
import jsPDF from "jspdf"; // jspdf é importado via módulo

/* ========================= KASH CONFIG/CONSTANTS ========================= */

// URL para o script do Google Apps que processa o formulário.
// Acesso direto via constante, evitando poluição do objeto 'window'.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

// Expressões Regulares
const emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const phoneRe = /^[0-9+()\\-\\s]{8,}$/ // Regex permissiva para telefone

// Estados dos EUA (usado para o endereço do Registered Agent)
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

// Funções utilitárias
function classNames(...xs) { return xs.filter(Boolean).join(" "); }

function todayISO() {
  const d = new Date();
  const pad = (n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// Inicializador de UUID (gera um ID de rastreamento simples)
function simpleUUID() {
    return 'KASH-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}


/* ========================= COMPONENTES REUTILIZÁVEIS ========================= */

// Botão de Ação Principal (Call To Action)
function CTAButton({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "btn btn-primary btn-block text-white transition duration-200",
        "shadow-lg shadow-primary/50 hover:shadow-primary/70",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]",
        className
      )}
    >
      {children}
    </button>
  );
}

// Componente de Input para o Formulário
function FormInput({ label, name, type = 'text', value, onChange, placeholder, error, required = false, className = '' }) {
    return (
        <div className={classNames("form-control w-full", className)}>
            <label className="label">
                <span className="label-text text-slate-300">
                    {label} {required && <span className="text-error">*</span>}
                </span>
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={classNames(
                    "input input-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-primary",
                    error && "input-error"
                )}
            />
            {error && <label className="label"><span className="label-text-alt text-error">{error}</span></label>}
        </div>
    );
}

// Componente de Select para o Formulário (como o State)
function FormSelect({ label, name, value, onChange, options, error, required = false, className = '' }) {
    return (
        <div className={classNames("form-control w-full", className)}>
            <label className="label">
                <span className="label-text text-slate-300">
                    {label} {required && <span className="text-error">*</span>}
                </span>
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={classNames(
                    "select select-bordered w-full bg-slate-800 text-white border-slate-700 focus:border-primary",
                    error && "select-error"
                )}
            >
                <option value="" disabled>Selecione</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            {error && <label className="label"><span className="label-text-alt text-error">{error}</span></label>}
        </div>
    );
}

/* ========================= LÓGICA DO FORMULÁRIO (useReducer) ========================= */

const initialFormState = {
    // Passo 1
    companyName: "",
    applicant1Name: "",
    applicant1Email: "",
    applicant1Phone: "",
    // Passo 2
    applicant2Name: "",
    applicant2Email: "",
    applicant2Phone: "",
    // Passo 3 - Endereço
    address: "",
    city: "",
    state: "",
    zip: "",
    // Metadata
    kashId: simpleUUID(),
    dateISO: todayISO(),
};

function formReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_FIELD':
            return { ...state, [action.field]: action.value };
        case 'RESET':
            return initialFormState;
        default:
            return state;
    }
}


/* ========================= MODAL DE APLICAÇÃO (ApplicationModal) ========================= */

function ApplicationModal({ open, onClose }) {
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Memoiza os dados que não mudam no ciclo de vida do modal aberto
  const dateISO = useMemo(todayISO, []);
  const kashId = useMemo(simpleUUID, []);

  // Handler genérico de input
  const handleInputChange = (e) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: e.target.name,
      value: e.target.value,
    });
  };

  // Lógica de validação (Simplificada, em app real usaria estado de erro)
  const validateStep1 = () => {
    let valid = true;
    const errors = {};

    if (!state.companyName) { valid = false; }
    if (!state.applicant1Name) { valid = false; }
    if (!emailRe.test(state.applicant1Email)) { valid = false; }
    if (!phoneRe.test(state.applicant1Phone)) { valid = false; }

    if (!valid) {
        // console.error("Erros no Passo 1:", errors);
        return false;
    }
    return true;
  };

  const validateStep2 = () => {
    let valid = true;

    if (!state.applicant2Name) { valid = false; }
    if (!emailRe.test(state.applicant2Email)) { valid = false; }
    if (!phoneRe.test(state.applicant2Phone)) { valid = false; }

    if (!valid) {
        // console.error("Erros no Passo 2:");
        return false;
    }
    return true;
  };

  const validateStep3 = () => {
    let valid = true;

    if (!state.address) { valid = false; }
    if (!state.city) { valid = false; }
    if (!state.state) { valid = false; }
    if (!state.zip || state.zip.length < 5) { valid = false; }

    if (!valid) {
        // console.error("Erros no Passo 3:");
        return false;
    }
    return true;
  };

  // Handlers de navegação
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handler de submissão final
  // === FUNÇÃO DE ENVIO CORRIGIDA ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) {
        setSubmitError("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // 1. Preparar dados
    const submissionData = {
        ...state,
        kashId: kashId, 
        dateISO: dateISO,
        action: "submitApplication", // Chave para o GAS reconhecer a ação
    };

    // 2. CORREÇÃO: Cria um objeto FormData para imitar um envio de formulário tradicional (POST)
    const formData = new FormData();
    for (const key in submissionData) {
        formData.append(key, submissionData[key]);
    }

    try {
      // 3. Envia o FormData. Importante: Não defina 'Content-Type', deixe o browser fazer isso.
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        body: formData, // Usa FormData para compatibilidade com doPost(e)
      });

      if (!response.ok) {
        throw new Error(`Erro de rede: ${response.statusText}`);
      }

      // O Apps Script deve retornar um JSON com status
      const result = await response.json();

      if (result.status === 'success') {
        setStep(4); // Vai para a tela de sucesso
      } else {
        // Exibe a mensagem de erro retornada pelo Apps Script, se houver
        setSubmitError(result.message || "Erro desconhecido ao processar no servidor.");
      }

    } catch (error) {
      console.error("Erro na submissão:", error);
      setSubmitError("Falha na comunicação com o servidor. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // ===================================


  const handleCloseStep3 = () => {
    // Limpa o estado e fecha o modal
    dispatch({ type: 'RESET' });
    setStep(1);
    setIsSubmitting(false);
    setSubmitError(null);
    onClose();
  };

  // Se o modal não estiver aberto, não renderiza nada
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target.classList.contains('fixed') && onClose()}>
      <div className="modal-box bg-slate-900 text-slate-200 p-0 overflow-hidden shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
            <h3 className="text-2xl font-bold text-primary">Inicie sua Aplicação LLC</h3>
            <button className="btn btn-sm btn-circle btn-ghost text-slate-400" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Indicador de Passo */}
          <ul className="steps steps-vertical lg:steps-horizontal w-full text-sm mb-8">
            <li className={classNames("step", step >= 1 && "step-primary")}>Empresa e Membro 1</li>
            <li className={classNames("step", step >= 2 && "step-primary")}>Membro 2 (Sócio)</li>
            <li className={classNames("step", step >= 3 && "step-primary")}>Endereço do Agente</li>
            <li className={classNames("step", step >= 4 && "step-primary")}>Confirmação</li>
          </ul>


          <form onSubmit={handleSubmit}>

            {/* PASSO 1: Empresa e Membro 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <FormInput
                    label="Nome Desejado da Empresa (ex: MEDIA CROW LLC)"
                    name="companyName"
                    value={state.companyName}
                    onChange={handleInputChange}
                    placeholder="Nome + LLC (Obrigatório)"
                    required
                />
                <h4 className="text-lg font-semibold pt-4 border-t border-slate-800 text-primary">Dados do Membro Fundador 1</h4>
                <FormInput
                    label="Nome Completo (Membro 1)"
                    name="applicant1Name"
                    value={state.applicant1Name}
                    onChange={handleInputChange}
                    placeholder="Seu Nome"
                    required
                />
                <FormInput
                    label="E-mail (Membro 1)"
                    name="applicant1Email"
                    type="email"
                    value={state.applicant1Email}
                    onChange={handleInputChange}
                    placeholder="seu.email@exemplo.com"
                    required
                />
                <FormInput
                    label="Telefone (Membro 1)"
                    name="applicant1Phone"
                    type="tel"
                    value={state.applicant1Phone}
                    onChange={handleInputChange}
                    placeholder="(+XX) XXXXX-XXXX"
                    required
                />
                <div className="mt-6">
                  <CTAButton onClick={handleNext}>Próximo Passo</CTAButton>
                </div>
              </div>
            )}

            {/* PASSO 2: Membro 2 (Sócio) */}
            {step === 2 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">Dados do Membro Fundador 2 (Sócio)</h4>
                <p className="text-sm text-slate-400">
                    Sua LLC na Flórida será registrada como Partnership (mínimo de 2 membros).
                </p>
                <FormInput
                    label="Nome Completo (Membro 2)"
                    name="applicant2Name"
                    value={state.applicant2Name}
                    onChange={handleInputChange}
                    placeholder="Nome do Sócio"
                    required
                />
                <FormInput
                    label="E-mail (Membro 2)"
                    name="applicant2Email"
                    type="email"
                    value={state.applicant2Email}
                    onChange={handleInputChange}
                    placeholder="socio.email@exemplo.com"
                    required
                />
                <FormInput
                    label="Telefone (Membro 2)"
                    name="applicant2Phone"
                    type="tel"
                    value={state.applicant2Phone}
                    onChange={handleInputChange}
                    placeholder="(+XX) XXXXX-XXXX"
                    required
                />
                <div className="flex justify-between gap-4 mt-6">
                  <button type="button" onClick={handleBack} className="btn btn-ghost text-slate-400">Voltar</button>
                  <CTAButton onClick={handleNext} className="w-auto flex-grow">Próximo Passo</CTAButton>
                </div>
              </div>
            )}

            {/* PASSO 3: Endereço do Agente Registrado (USA) */}
            {step === 3 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">Endereço do Agente Registrado (EUA)</h4>
                <p className="text-sm text-slate-400">
                    Este é o endereço físico em solo americano que a KASH fornecerá (incluso no pacote).
                </p>
                <FormInput
                    label="Endereço (Rua, Número, Suíte)"
                    name="address"
                    value={state.address}
                    onChange={handleInputChange}
                    placeholder="Endereço da KASH (Fornecido)"
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Cidade"
                        name="city"
                        value={state.city}
                        onChange={handleInputChange}
                        placeholder="Orlando"
                        required
                    />
                    <FormSelect
                        label="Estado (EUA)"
                        name="state"
                        value={state.state}
                        onChange={handleInputChange}
                        options={US_STATES}
                        required
                    />
                </div>
                <FormInput
                    label="CEP/ZIP Code"
                    name="zip"
                    value={state.zip}
                    onChange={handleInputChange}
                    placeholder="00000"
                    required
                />
                <div className="flex justify-between gap-4 mt-6">
                  <button type="button" onClick={handleBack} className="btn btn-ghost text-slate-400">Voltar</button>
                  <CTAButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <span className="loading loading-spinner"></span> : "Finalizar e Enviar"}
                  </CTAButton>
                </div>
                {submitError && <div className="text-error text-center mt-4 p-3 bg-error/10 rounded-lg">{submitError}</div>}
              </div>
            )}

            {/* PASSO 4: Sucesso e Confirmação */}
            {step === 4 && (
              <div className="text-center p-6 bg-slate-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-success mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="text-xl font-bold mb-2 text-success">Aplicação Enviada com Sucesso!</h4>
                <p className="text-sm text-slate-400">
                  Seu ID de Rastreamento (Tracking ID) é:
                  <span className="block font-mono text-lg text-primary mt-1">{kashId}</span>
                </p>
                <p className="text-sm text-slate-400 mt-4">
                  A KASH Solutions processará sua aplicação e enviará o link de pagamento e contrato por e-mail em até 48 horas.
                </p>
                <div className="mt-6">
                  {/* Chama o handler que limpa a memória e fecha o modal (onClose) */}
                  <CTAButton onClick={handleCloseStep3}>Fechar</CTAButton>
                </div>
              </div>
            )}

          </form>
          <div className="text-center text-[11px] text-slate-500 mt-3">Data: {dateISO}</div>
        </div>
      </div>
    </div>
  );
}


/* ========================= HERO SECTION (Mock) ========================= */
function Hero({ onStart }) {
    return (
        <header className="pt-20 pb-32 bg-slate-900 shadow-xl">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
                    <span className="text-primary">KASH</span> Solutions
                </h1>
                <p className="mt-4 text-xl text-slate-300 max-w-3xl mx-auto">
                    A maneira mais rápida e segura de registrar sua LLC e obter seu EIN nos EUA.
                </p>
                <div className="mt-8">
                    <CTAButton onClick={onStart} className="px-10 py-3 text-lg">
                        Iniciar Minha Aplicação
                    </CTAButton>
                </div>
            </div>
        </header>
    );
}

/* ========================= SERVICES SECTION (Mock) ========================= */
function Services() {
    const services = [
        { icon: '🌎', title: 'LLC na Flórida', description: 'Registro completo da sua Limited Liability Company no estado da Flórida.' },
        { icon: '🆔', title: 'Obtenção de EIN', description: 'Aplicação e obtenção do Employer Identification Number junto ao IRS.' },
        { icon: '🏢', title: 'Agente Registrado', description: 'Serviço de Registered Agent e endereço físico (virtual) comercial por 12 meses.' },
    ];

    return (
        <section className="py-20 bg-slate-950">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">O que Inclui no Pacote KASH</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="card bg-slate-900 shadow-xl p-6 border border-slate-800 transition-transform hover:scale-[1.03]">
                            <p className="text-5xl mb-4">{service.icon}</p>
                            <h3 className="text-xl font-semibold text-primary mb-2">{service.title}</h3>
                            <p className="text-slate-400">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ========================= PRICING SECTION (Mock) ========================= */
function Pricing({ onStart }) {
    return (
        <section className="py-20 bg-slate-900">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-6 text-white">Preço Transparente. Sem Surpresas.</h2>
                <div className="card bg-primary text-primary-content shadow-2xl p-8 transform hover:scale-[1.02] transition-transform duration-300">
                    <p className="text-4xl font-extrabold">Pacote LLC + EIN</p>
                    <p className="text-6xl font-black my-4">$999</p>
                    <p className="text-lg mb-6">Taxa única. Inclui taxas estaduais, Registered Agent por 1 ano, e aplicação do EIN.</p>
                    <CTAButton onClick={onStart} className="bg-white text-primary hover:bg-slate-100">
                        Começar Agora
                    </CTAButton>
                </div>
            </div>
        </section>
    );
}


/* ========================= FOOTER ========================= */
function Footer() {
  return (
    <footer className="py-10 border-t border-slate-800 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-slate-400 text-sm">© {new Date().getFullYear()} KASH Solutions - KASH CORPORATE SOLUTIONS LLC</div>
        <div className="text-slate-400 text-sm">Contato: contato@kashsolutions.us</div>
      </div>
    </footer>
  );
}

/* ========================= APP ROOT ========================= */
export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <Hero onStart={() => setOpen(true)} />
      <Services />
      <Pricing onStart={() => setOpen(true)} />
      <Footer />
      {/* O modal de aplicação é renderizado aqui */}
      <ApplicationModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
