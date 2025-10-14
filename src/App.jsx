import { jsPDF } from "jspdf";
import React, { useReducer, useState, useEffect, useRef } from "react";

// URL publicada do Apps Script
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9mHoyfTP0QfaBgJdbEHmxO2rVDViOJZuXaD8hld2cO7VCRXLMsN2AmYg7A-wNP0abGA/exec";

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

// Função para centralizar a lógica de envio de dados
const postToAppsScript = async (data, trackingCode) => {
  const finalData = {
    ...data,
    companyName: localStorage.getItem("companyName"), // Mantido por compatibilidade
    trackingCode: trackingCode || localStorage.getItem("trackingCode")
  };
  
  const formData = new FormData();
  for (const key in finalData) {
    if (Object.prototype.hasOwnProperty.call(finalData, key)) {
      formData.append(key, finalData[key]);
    }
  }
  
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });
    console.log("Data sent to Apps Script:", response);
    // Nota: 'no-cors' não permite verificar a resposta diretamente.
  } catch (error) {
    console.error("Error sending data to Apps Script:", error);
  }
};

// ===========================================
// COMPONENTES PRINCIPAIS
// ===========================================

// Componente para o Hero Section
const Hero = () => (
  <section className="hero">
    <h1>Abra sua LLC na Flórida com Facilidade</h1>
    <p>
      Nós cuidamos de toda a burocracia para que você possa focar no que
      realmente importa: o seu negócio.
    </p>
  </section>
);

// Componente para o simulador de economia
const EconomySimulator = () => {
  const [savings, setSavings] = useState(1200);

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setSavings(value);
  };

  return (
    <div className="simulator">
      <h3>Calcule sua Economia</h3>
      <p>
        Com nossos serviços, você pode economizar até **${savings}** por ano.
      </p>
      <input
        type="range"
        min="1000"
        max="5000"
        value={savings}
        onChange={handleSliderChange}
      />
    </div>
  );
};

// Componente para a seção de preços
const Pricing = () => (
  <section className="pricing">
    <h2>Nossos Preços</h2>
    <div className="pricing-card">
      <h3>Plano Essencial</h3>
      <p>Serviços básicos para a abertura da sua empresa.</p>
    </div>
  </section>
);

// Componente para o formulário de aplicação
const ApplicationForm = () => {
  const initialState = {
    step: 1,
    form: {
      companyName: "",
      members: [{ fullName: "", idOrPassport: "", email: "" }]
    },
    trackingCode: ""
  };
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "NEXT_STEP":
        return { ...state, step: state.step + 1 };
      case "PREV_STEP":
        return { ...state, step: state.step - 1 };
      case "UPDATE_FORM":
        return { ...state, form: { ...state.form, ...action.payload } };
      case "ADD_MEMBER":
        return {
          ...state,
          form: {
            ...state.form,
            members: [...state.form.members, { fullName: "", idOrPassport: "", email: "" }]
          }
        };
      case "UPDATE_MEMBER":
        const newMembers = [...state.form.members];
        newMembers[action.payload.index] = { ...newMembers[action.payload.index], ...action.payload.data };
        return { ...state, form: { ...state.form, members: newMembers } };
      case "SET_TRACKING_CODE":
        return { ...state, trackingCode: action.payload };
      default:
        return state;
    }
  }, initialState);

  const { step, form, trackingCode } = state;
  const companyNameInputRef = useRef(null);

  useEffect(() => {
    // Sincroniza o companyName com localStorage (Atenção: ver notas de segurança)
    if (companyNameInputRef.current) {
      const storedCompanyName = localStorage.getItem("companyName");
      if (storedCompanyName) {
        dispatch({ type: "UPDATE_FORM", payload: { companyName: storedCompanyName } });
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "UPDATE_FORM", payload: { [name]: value } });
    if (name === "companyName") {
      localStorage.setItem("companyName", value);
    }
  };

  const handleMemberChange = (index, field, value) => {
    dispatch({ type: "UPDATE_MEMBER", payload: { index, data: { [field]: value } } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTrackingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    dispatch({ type: "SET_TRACKING_CODE", payload: newTrackingCode });
    localStorage.setItem("trackingCode", newTrackingCode);
    
    // Envia dados para o Google Apps Script
    await postToAppsScript(form, newTrackingCode);
    
    // Geração do PDF
    generatePDF(form);
    
    dispatch({ type: "NEXT_STEP" });
  };

  // Função para gerar o PDF (simplificada)
  const generatePDF = (data) => {
    const doc = new jsPDF();
    doc.text(`Contrato para: ${data.companyName}`, 10, 10);
    // ... lógica completa de geração de PDF
    doc.save("contrato.pdf");
  };

  // Renderização condicional dos passos do formulário
  if (step === 1) {
    return (
      <form onSubmit={handleSubmit}>
        <input
          ref={companyNameInputRef}
          type="text"
          name="companyName"
          placeholder="Nome da Empresa"
          value={form.companyName}
          onChange={handleInputChange}
          required
        />
        {/* Outros campos */}
        <button type="submit">Próximo</button>
      </form>
    );
  }

  if (step === 2) {
    return (
      <div>
        <h2>Membros da Empresa</h2>
        {form.members.map((member, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Nome Completo"
              value={member.fullName}
              onChange={(e) => handleMemberChange(index, "fullName", e.target.value)}
            />
            <input
              type="text"
              placeholder="ID/Passaporte"
              value={member.idOrPassport}
              onChange={(e) => handleMemberChange(index, "idOrPassport", e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={member.email}
              onChange={(e) => handleMemberChange(index, "email", e.target.value)}
            />
          </div>
        ))}
        <button onClick={() => dispatch({ type: "ADD_MEMBER" })}>Adicionar Membro</button>
        <button onClick={() => dispatch({ type: "PREV_STEP" })}>Voltar</button>
        <button onClick={handleSubmit}>Finalizar</button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div>
        <h2>Processo Concluído!</h2>
        <p>Seu código de rastreamento é: **{trackingCode}**</p>
        <p>
          Guarde este código para acompanhar o status do seu processo.
        </p>
      </div>
    );
  }
};

// Componente para o painel administrativo
const AdminPanel = () => {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    // Este é um exemplo de validação, mas o ideal é que seja
    // uma chamada a uma API segura, não um PIN hardcoded.
    // **NUNCA DEIXE SENHAS NO CÓDIGO-FONTE.**
    // Por exemplo:
    // fetch('/api/validate-pin', { method: 'POST', body: { pin } })
    // .then(res => res.json())
    // .then(data => setIsAuthenticated(data.success));
    if (pin === "246810") {
      setIsAuthenticated(true);
    } else {
      alert("PIN incorreto");
    }
  };

  if (!isAuthenticated) {
    return (
      <form onSubmit={handlePinSubmit}>
        <input
          type="password"
          placeholder="Insira o PIN de administrador"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    );
  }

  return (
    <div>
      <h2>Painel de Administração</h2>
      <p>Conteúdo administrativo seguro.</p>
    </div>
  );
};

// Componente principal
const App = () => {
  return (
    <div className="App">
      <Hero />
      <EconomySimulator />
      <ApplicationForm />
      <Pricing />
      <AdminPanel />
    </div>
  );
};

export default App;