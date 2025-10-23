// src/App.jsx – KASH Solutions (Tema Escuro Aplicado)

import React, { useEffect, useMemo, useReducer, useState } from "react";

/* ========================= KASH CONFIG ========================= */
if (typeof window !== "undefined") {
  window.CONFIG = window.CONFIG || {};
  // IMPORTANTE: VERIFIQUE se esta URL corresponde EXATAMENTE ao seu Web App publicado (DEPLOY)
  window.CONFIG.appsScriptUrl =
    "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+()\-\s]{8,}$/;
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

function classNames(...xs) { return xs.filter(Boolean).join(" "); }
function todayISO() {
  const d = new Date();
  const pad = (n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

const initialFormState = {
  // Step 1: Informações da Empresa
  company: {
    companyName: "",
    cnpj: "",
    usaddressline1: "",
    usaddressline2: "",
    usaddresscity: "",
    usaddressstate: "FL",
    usaddresszip: "",
    usaddresscountry: "United States",
  },
  // Step 2: Informações do Aplicante/Membros
  memberCount: 1, // 1 a 3
  members: [
    { fullName: "", email: "", phone: "", passport: "", docExpiry: "", percent: "" },
    { fullName: "", email: "", phone: "", passport: "", docExpiry: "", percent: "" },
    { fullName: "", email: "", phone: "", passport: "", docExpiry: "", percent: "" },
  ],
  accepts: {
    terms: false,
    privacy: false,
    paymentMethod: "",
    companyNameOption1: "",
    companyNameOption2: "",
    companyNameOption3: "",
  },
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.name]: action.value };
    case "UPDATE_NESTED_FIELD":
      return {
        ...state,
        [action.parent]: {
          ...state[action.parent],
          [action.name]: action.value,
        },
      };
    case "UPDATE_MEMBER_FIELD":
      return {
        ...state,
        members: state.members.map((member, index) =>
          index === action.index ? { ...member, [action.name]: action.value } : member
        ),
      };
    case "SET_MEMBER_COUNT":
      return { ...state, memberCount: action.count };
    case "RESET_FORM":
      return initialFormState;
    default:
      return state;
  }
};

/* ========================= COMPONENTES DE UI ========================= */

function CTAButton({ children, onClick, disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // Estilo de botão ESCURO - Mantido o acento indigo para contraste
      className={classNames(
        "px-6 py-3 font-semibold text-white transition duration-300 rounded-md shadow-lg",
        disabled
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-indigo-500 hover:bg-indigo-400 hover:shadow-xl transform hover:scale-[1.01]"
      )}
    >
      {children}
    </button>
  );
}

function Input({ label, name, type = "text", value, onChange, error, placeholder, required = false, mask, disabled = false }) {
  const handleMaskedChange = (e) => {
    let rawValue = e.target.value;
    if (mask === 'phone') {
      rawValue = rawValue.replace(/\D/g, '');
    }
    onChange(e, rawValue);
  };

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-300"> {/* Texto claro */}
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleMaskedChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        // Estilo de input ESCURO
        className={classNames(
          "px-3 py-2 border rounded-md focus:outline-none transition duration-150 text-gray-50",
          error ? "border-red-500 bg-gray-900" : "bg-gray-800 border-gray-600 focus:border-indigo-500",
          disabled && "bg-gray-700 cursor-not-allowed text-gray-400"
        )}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, name, value, onChange, options, required = false, disabled = false }) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-300"> {/* Texto claro */}
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        // Estilo de select ESCURO
        className={classNames(
          "px-3 py-2 border rounded-md focus:outline-none transition duration-150 text-gray-50",
          "bg-gray-800 border-gray-600 focus:border-indigo-500",
          disabled && "bg-gray-700 opacity-70 cursor-not-allowed text-gray-400"
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled} className="bg-gray-800 text-gray-100">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({ label, name, checked, onChange, required = false }) {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          className="w-4 h-4 text-indigo-500 bg-gray-800 border-gray-600 rounded focus:ring-indigo-400"
        />
      </div>
      <label htmlFor={name} className="ml-2 text-sm text-gray-300 cursor-pointer"> {/* Texto claro */}
        {label}
      </label>
    </div>
  );
}


/* ========================= PASSOS DO FORMULÁRIO ========================= */

function Step1({ formState, dispatch, goToNextStep, validationErrors }) {
  const handleChange = (parent, name) => (e) => {
    dispatch({ type: "UPDATE_NESTED_FIELD", parent, name, value: e.target.value });
  };
  
  const stateOptions = useMemo(() => ([
    { label: "Selecione o Estado", value: "", disabled: true },
    ...US_STATES.map(s => ({ label: s, value: s }))
  ]), []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">1. Informações da Futura Empresa Americana</h2> {/* Título claro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome Completo da Empresa (Opção 1)"
          name="companyNameOption1"
          value={formState.accepts.companyNameOption1}
          onChange={handleChange("accepts", "companyNameOption1")}
          error={validationErrors.companyNameOption1}
          placeholder="Ex: KASH Corporate Solutions LLC"
          required
        />
        <Input
          label="Nome Completo da Empresa (Opção 2)"
          name="companyNameOption2"
          value={formState.accepts.companyNameOption2}
          onChange={handleChange("accepts", "companyNameOption2")}
          error={validationErrors.companyNameOption2}
          placeholder="Ex: KASH Investments"
        />
        <Input
          label="Nome Completo da Empresa (Opção 3)"
          name="companyNameOption3"
          value={formState.accepts.companyNameOption3}
          onChange={handleChange("accepts", "companyNameOption3")}
          error={validationErrors.companyNameOption3}
          placeholder="Ex: KASH Holding"
        />
        <Input
          label="CNPJ (Se empresa brasileira)"
          name="cnpj"
          value={formState.company.cnpj}
          onChange={handleChange("company", "cnpj")}
          error={validationErrors.cnpj}
          placeholder="00.000.000/0000-00"
        />
      </div>

      <h3 className="text-lg font-semibold text-gray-200 mt-6">Endereço nos EUA (Virtual/Físico)</h3> {/* Título claro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Endereço Linha 1 (Rua, Número, Suite)"
          name="usaddressline1"
          value={formState.company.usaddressline1}
          onChange={handleChange("company", "usaddressline1")}
          error={validationErrors.usaddressline1}
          required
        />
        <Input
          label="Endereço Linha 2 (Opcional)"
          name="usaddressline2"
          value={formState.company.usaddressline2}
          onChange={handleChange("company", "usaddressline2")}
        />
        <Input
          label="Cidade"
          name="usaddresscity"
          value={formState.company.usaddresscity}
          onChange={handleChange("company", "usaddresscity")}
          error={validationErrors.usaddresscity}
          required
        />
        <Select
          label="Estado (US)"
          name="usaddressstate"
          value={formState.company.usaddressstate}
          onChange={handleChange("company", "usaddressstate")}
          options={stateOptions}
          required
        />
        <Input
          label="ZIP Code"
          name="usaddresszip"
          type="number"
          value={formState.company.usaddresszip}
          onChange={handleChange("company", "usaddresszip")}
          error={validationErrors.usaddresszip}
          required
        />
        <Input
          label="País"
          name="usaddresscountry"
          value={formState.company.usaddresscountry}
          onChange={handleChange("company", "usaddresscountry")}
          disabled
        />
      </div>
      
      <div className="flex justify-end pt-4">
        <CTAButton onClick={goToNextStep}>Próximo: Aplicantes & Membros</CTAButton>
      </div>
    </div>
  );
}

function Step2({ formState, dispatch, goToNextStep, goToPrevStep, validationErrors }) {
  const { memberCount } = formState;

  const handleMemberCountChange = (e) => {
    const count = parseInt(e.target.value);
    dispatch({ type: "SET_MEMBER_COUNT", count });
  };

  const handleMemberChange = (index, name) => (e, rawValue = e.target.value) => {
    dispatch({ type: "UPDATE_MEMBER_FIELD", index, name, value: rawValue });
  };

  const memberInputs = formState.members.slice(0, memberCount).map((member, index) => (
    // Estilo de cartão ESCURO
    <div key={index} className="border border-gray-700 p-4 rounded-md bg-gray-800 space-y-4 shadow-xl">
      <h3 className="text-lg font-semibold text-indigo-400">Aplicante {index + 1} ({index === 0 ? "Principal" : "Adicional"})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome Completo (Conforme Passaporte/Documento)"
          name="fullName"
          value={member.fullName}
          onChange={handleMemberChange(index, "fullName")}
          error={validationErrors[`member${index}fullName`]}
          required
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          value={member.email}
          onChange={handleMemberChange(index, "email")}
          error={validationErrors[`member${index}email`]}
          placeholder="exemplo@email.com"
          required
        />
        <Input
          label="Telefone (Com Código do País)"
          name="phone"
          type="tel"
          mask="phone"
          value={member.phone}
          onChange={handleMemberChange(index, "phone")}
          error={validationErrors[`member${index}phone`]}
          placeholder="+55 (11) 99999-9999"
          required
        />
        <Input
          label="Passaporte ou Documento de Identidade"
          name="passport"
          value={member.passport}
          onChange={handleMemberChange(index, "passport")}
          error={validationErrors[`member${index}passport`]}
          required
        />
        <Input
          label="Data de Expiração do Documento"
          name="docExpiry"
          type="date"
          value={member.docExpiry}
          onChange={handleMemberChange(index, "docExpiry")}
          error={validationErrors[`member${index}docExpiry`]}
          required
        />
        <Input
          label="Percentual de Participação (%)"
          name="percent"
          type="number"
          value={member.percent}
          onChange={handleMemberChange(index, "percent")}
          error={validationErrors[`member${index}percent`]}
          placeholder="Ex: 50"
          required
        />
      </div>
    </div>
  ));

  const totalPercentage = formState.members.slice(0, memberCount).reduce((acc, member) => acc + (parseFloat(member.percent) || 0), 0);
  const percentageError = totalPercentage !== 100 && memberCount > 0 ? "A soma total dos percentuais deve ser 100%" : null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">2. Detalhes dos Aplicantes e Membros</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Número de Membros/Sócios"
          name="memberCount"
          value={memberCount}
          onChange={handleMemberCountChange}
          options={[
            { label: "1 (Membro Único)", value: 1 },
            { label: "2 Membros", value: 2 },
            { label: "3 Membros", value: 3 },
          ]}
          required
        />
        {percentageError && (
            // Mensagem de erro ESCURA
            <div className="col-span-1 md:col-span-2 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-md">
                {percentageError}
            </div>
        )}
      </div>

      <div className="space-y-6">
        {memberInputs}
      </div>

      <div className="flex justify-between pt-4">
        <CTAButton onClick={goToPrevStep}>Voltar: Informações da Empresa</CTAButton>
        <CTAButton onClick={goToNextStep} disabled={!!percentageError || memberCount === 0}>
          Próximo: Aceites e Pagamento
        </CTAButton>
      </div>
    </div>
  );
}

function Step3({ formState, dispatch, handleSubmit, goToPrevStep, validationErrors, isSubmitting, submitStatus }) {
  const handleChange = (parent, name) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    dispatch({ type: "UPDATE_NESTED_FIELD", parent, name, value });
  };
  
  const paymentOptions = [
    { label: "Selecione a forma de pagamento", value: "", disabled: true },
    { label: "Transferência Bancária (Wire Transfer)", value: "Wire Transfer" },
    { label: "Cartão de Crédito", value: "Credit Card" },
    { label: "Criptomoeda (USDC/USDT)", value: "Crypto" },
  ];

  const termsChecked = formState.accepts.terms;
  const privacyChecked = formState.accepts.privacy;
  const paymentSelected = !!formState.accepts.paymentMethod;
  
  const isReadyToSubmit = termsChecked && privacyChecked && paymentSelected && !isSubmitting;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-100">3. Aceites e Forma de Pagamento</h2>
      
      <div className="space-y-4">
        <Checkbox
          label="Eu li e aceito os Termos e Condições da KASH Corporate Solutions LLC."
          name="terms"
          checked={termsChecked}
          onChange={handleChange("accepts", "terms")}
          required
        />
        <Checkbox
          label="Eu li e concordo com a Política de Privacidade da KASH Corporate Solutions LLC."
          name="privacy"
          checked={privacyChecked}
          onChange={handleChange("accepts", "privacy")}
          required
        />
      </div>

      <Select
        label="Forma de Pagamento Preferida"
        name="paymentMethod"
        value={formState.accepts.paymentMethod}
        onChange={handleChange("accepts", "paymentMethod")}
        options={paymentOptions}
        required
      />

      <div className="flex justify-between pt-6">
        <CTAButton onClick={goToPrevStep} disabled={isSubmitting}>Voltar: Aplicantes & Membros</CTAButton>
        <CTAButton 
          onClick={handleSubmit} 
          disabled={!isReadyToSubmit}
        >
          {isSubmitting ? "Enviando Dados..." : "Finalizar & Enviar Pedido"}
        </CTAButton>
      </div>
      
      {submitStatus.error && (
        // Estilo de erro ESCURO
        <div className="p-4 mt-4 bg-red-900/30 border border-red-500 text-red-300 rounded-md">
          <p className="font-bold">Erro ao Enviar:</p>
          <p>{submitStatus.error}</p>
          <p className="mt-2 text-sm">Por favor, verifique sua conexão e tente novamente. Se o problema persistir, entre em contato.</p>
        </div>
      )}
      
      {isSubmitting && (
        // Estilo de loading ESCURO
        <div className="p-4 mt-4 bg-indigo-900/30 border border-indigo-500 text-indigo-300 rounded-md flex items-center space-x-3">
          <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processando seu pedido. Aguarde...</span>
        </div>
      )}
    </div>
  );
}

/* ========================= COMPONENTE PRINCIPAL DO FORMULÁRIO ========================= */

function ApplicationForm({ onClose }) {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, error: null, kashId: null });
  
  const dateISO = useMemo(todayISO, []);

  // =======================================================
  // FUNÇÕES DE VALIDAÇÃO (MANTIDAS INTACTAS)
  // =======================================================
  const validateForm = (currentStep) => {
    let errors = {};
    let isValid = true;
    
    const checkRequired = (key, value, message) => {
        if (!value || String(value).trim() === "" || (typeof value === 'number' && isNaN(value))) {
            errors[key] = message;
            isValid = false;
        }
    };
    
    if (currentStep === 1 || currentStep === 4) {
        const company = formState.company;
        const accepts = formState.accepts;
        
        checkRequired('companyNameOption1', accepts.companyNameOption1, 'Nome da Opção 1 é obrigatório.');
        
        checkRequired('usaddressline1', company.usaddressline1, 'Endereço Linha 1 é obrigatório.');
        checkRequired('usaddresscity', company.usaddresscity, 'Cidade é obrigatória.');
        checkRequired('usaddresszip', company.usaddresszip, 'ZIP Code é obrigatório.');
    }
    
    if (currentStep === 2 || currentStep === 4) {
        const memberCount = formState.memberCount;
        const members = formState.members.slice(0, memberCount);
        let totalPercentage = 0;

        members.forEach((member, index) => {
            checkRequired(`member${index}fullName`, member.fullName, 'Nome completo é obrigatório.');
            checkRequired(`member${index}email`, member.email, 'E-mail é obrigatório.');
            if (member.email && !emailRe.test(member.email)) {
                errors[`member${index}email`] = 'Formato de e-mail inválido.';
                isValid = false;
            }
            
            checkRequired(`member${index}phone`, member.phone, 'Telefone é obrigatório.');
            if (member.phone && !phoneRe.test(member.phone)) {
                errors[`member${index}phone`] = 'Formato de telefone inválido.';
                isValid = false;
            }
            
            checkRequired(`member${index}passport`, member.passport, 'Documento (Passaporte/ID) é obrigatório.');
            checkRequired(`member${index}docExpiry`, member.docExpiry, 'Data de expiração do documento é obrigatória.');
            
            const percentValue = parseFloat(member.percent);
            if (isNaN(percentValue) || percentValue <= 0) {
                errors[`member${index}percent`] = 'Percentual deve ser um número válido e maior que zero.';
                isValid = false;
            } else {
                totalPercentage += percentValue;
            }
        });
        
        if (memberCount > 0 && totalPercentage !== 100) {
            errors.totalPercentage = 'A soma dos percentuais deve ser 100%.';
            isValid = false;
        }
    }
    
    if (currentStep === 3 || currentStep === 4) {
        checkRequired('terms', formState.accepts.terms, 'Você deve aceitar os Termos e Condições.');
        checkRequired('privacy', formState.accepts.privacy, 'Você deve aceitar a Política de Privacidade.');
        checkRequired('paymentMethod', formState.accepts.paymentMethod, 'Forma de pagamento é obrigatória.');
    }

    setValidationErrors(errors);
    return isValid;
  };

  // =======================================================
  // FUNÇÕES DE NAVEGAÇÃO (MANTIDAS INTACTAS)
  // =======================================================
  const goToNextStep = () => {
    if (validateForm(step)) {
      setStep(step + 1);
    } else {
      console.error("Validação falhou.");
    }
  };

  const goToPrevStep = () => setStep(step - 1);
  
  const handleCloseStep3 = () => {
    dispatch({ type: "RESET_FORM" });
    onClose();
  };

  // =======================================================
  // FUNÇÃO DE SUBMISSÃO (MANTIDA INTACTA)
  // =======================================================
  const handleSubmit = async () => {
    if (!validateForm(3)) {
      return;
    }
    
    if (!window.CONFIG.appsScriptUrl) {
        setSubmitStatus({ success: false, error: "URL do Apps Script não configurada." });
        return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ success: false, error: null });

    const dataToSend = {
      company: formState.company,
      memberCount: formState.memberCount,
      members: formState.members.slice(0, formState.memberCount),
      accepts: formState.accepts,
    };
    

    try {
      const response = await fetch(window.CONFIG.appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`Falha HTTP. Status: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === "success") {
        setSubmitStatus({ success: true, error: null, kashId: result.kashId });
        setStep(4);
        
        console.log("SUCESSO na gravação. KASH ID:", result.kashId);
        
      } else {
        const errorMessage = result.message || "Erro desconhecido retornado pelo servidor.";
        setSubmitStatus({ success: false, error: `Erro do Servidor (GAS): ${errorMessage}` });
      }

    } catch (error) {
      console.error("Erro na submissão do formulário:", error);
      setSubmitStatus({ success: false, error: `Erro de Conexão ou Resposta: ${error.message}. Verifique o URL do Apps Script e as permissões de acesso (CORS).` });
    } finally {
      setIsSubmitting(false);
    }
  };


  // =======================================================
  // RENDERIZAÇÃO
  // =======================================================
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 {...{ formState, dispatch, goToNextStep, validationErrors }} />;
      case 2:
        return <Step2 {...{ formState, dispatch, goToNextStep, goToPrevStep, validationErrors }} />;
      case 3:
        return (
          <Step3 
            {...{ 
              formState, 
              dispatch, 
              handleSubmit, 
              goToPrevStep, 
              validationErrors,
              isSubmitting,
              submitStatus 
            }} 
          />
        );
      case 4:
        return null;
      default:
        return null;
    }
  };

  return (
    // Estilo de modal ESCURO
    <div className={classNames("fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex justify-center p-4 overflow-y-auto transition-opacity duration-300", submitStatus.success ? "opacity-100" : (open ? "opacity-100" : "opacity-0 pointer-events-none"))}>
      
      <div className="absolute inset-0" onClick={submitStatus.success ? handleCloseStep3 : undefined} aria-label="Fechar formulário"></div>
      
      <div 
        className={classNames(
          // Fundo escuro, borda sutil, sombra corporativa
          "bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-4xl h-fit min-h-[400px] mt-10 mb-20 transform transition-all duration-300",
          submitStatus.success ? "scale-100" : (open ? "scale-100" : "scale-95")
        )}
      >
        <div className="relative p-6 sm:p-10">
          
          {/* Header e Navegação */}
          <div className="pb-6 border-b border-gray-700 flex justify-between items-center">
            <h1 className="text-2xl font-extrabold text-indigo-400">
              Formulário de Aplicação KASH LLC
            </h1>
            <button 
              onClick={handleCloseStep3} 
              className="text-gray-400 hover:text-red-400 transition"
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="pt-8">
            {/* Step Content */}
            {renderStep()}

            {/* Modal de Sucesso (Step 4) */}
            {submitStatus.success && (
              <div className="text-center py-10">
                <div className="flex justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-green-400 mb-3">Pedido Recebido com Sucesso!</h2>
                <p className="text-gray-300 text-lg">
                  Seu código de referência é: <strong className="text-indigo-400">{submitStatus.kashId || 'N/A'}</strong>
                </p>
                <div className="mt-6 max-w-md mx-auto">
                  <p className="text-gray-400">
                    A KASH Solutions está processando sua aplicação. Nossa equipe enviará o link de pagamento e o contrato (PDF) para o e-mail do aplicante principal (<strong className="text-gray-200">{formState.members[0].email}</strong>) em até 48 horas úteis.
                  </p>
                  <div className="mt-6">
                    <CTAButton onClick={handleCloseStep3}>Fechar</CTAButton>
                  </div>
                </div>
              </div>
            )}

          </div>
          <div className="text-center text-[11px] text-gray-600 mt-3">Data: {dateISO}</div>
        </div>
      </div>
    </div>
  );
}

/* ========================= FOOTER ========================= */
function Footer() {
  return (
    // Estilo de footer ESCURO
    <footer className="py-10 border-t border-gray-800 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-gray-500 text-sm">© {new Date().getFullYear()} KASH Solutions - KASH CORPORATE SOLUTIONS LLC</div>
        <div className="text-gray-500 text-sm">Contato: contato@kashsolutions.us</div>
      </div>
    </footer>
  );
}

/* ========================= APP ROOT ========================= */
export default function App() {
  const [open, setOpen] = useState(false);
  return (
    // Estilo de fundo do corpo ESCURO
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <Hero onStart={() => setOpen(true)} />
      <Services />
      <Pricing onStart={() => setOpen(true)} />
      {(open) && <ApplicationForm onClose={() => setOpen(false)} />}
      <Footer />
    </div>
  );
}


/* ========================= MARKETING/HERO SECTION ========================= */
function Hero({ onStart }) {
  return (
    // Estilo de Hero ESCURO
    <div className="bg-gray-900 pt-20 pb-16 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-50 mb-4">
          KASH Corporate Solutions
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Sua ponte para o sucesso empresarial nos Estados Unidos. Abra sua LLC de forma rápida e segura.
        </p>
        <CTAButton onClick={onStart}>Iniciar Aplicação Agora</CTAButton>
      </div>
    </div>
  );
}
function Services() {
    return (
        // Estilo de seção de serviços ESCURO
        <section className="py-16 bg-gray-950">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-100 mb-10">Nossos Serviços Incluem</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ServiceCard title="Abertura Rápida de LLC" description="Processamento em 24-48h no estado da Flórida (FL)." />
                    <ServiceCard title="Endereço Fiscal nos EUA" description="Inclusão de endereço virtual para correspondência oficial." />
                    <ServiceCard title="Consultoria Contábil" description="Orientação inicial sobre impostos e compliance nos EUA." />
                </div>
            </div>
        </section>
    );
}
function ServiceCard({ title, description }) {
    return (
        // Estilo de cartão de serviço ESCURO
        <div className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-700 hover:border-indigo-500 transition duration-300">
            <h3 className="text-xl font-semibold text-indigo-400 mb-3">{title}</h3>
            <p className="text-gray-300">{description}</p>
        </div>
    );
}

// ⚠️ PREÇO CORRIGIDO E MANTIDO EM $399
function Pricing({ onStart }) {
    return (
        // Estilo de seção de preço ESCURO
        <section className="py-16 bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-50 mb-6">Preço Transparente</h2>
                <div className="bg-gray-800 p-8 rounded-xl border border-indigo-500 shadow-xl">
                    <p className="text-5xl font-extrabold text-indigo-400 mb-4">
                        $399<span className="text-xl text-gray-400"> (Taxas Estaduais Inclusas)</span>
                    </p>
                    <p className="text-gray-300 mb-8">
                        Este valor cobre a abertura da sua LLC, taxas de registro estaduais na Flórida, e documentação inicial.
                    </p>
                    <CTAButton onClick={onStart}>Começar a Aplicação</CTAButton>
                </div>
            </div>
        </section>
    );
}
