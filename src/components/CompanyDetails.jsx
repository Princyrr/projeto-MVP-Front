import { useState, useEffect } from "react";
import Contacts from "./Contacts";
import Insights from "./Insights";
import Interacoes from "./Interacoes";
import Enriquecimento from "./Enriquecimento";
import AuditHistory from "./AuditHistory";
import { API_URL } from "../config";

import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Briefcase,
  DollarSign,
  Hash,
  CheckCircle,
  XCircle,
} from "lucide-react";

const statusOptions = [
  "Não abordada",
  "Em pesquisa",
  "Contato iniciado",
  "Em negociação",
  "Convertida",
  "Sem interesse",
];

export default function CompanyDetails({
  company,
  empresas,
  onAddCompany,
  onUpdateCompany,
  currentUser,
}) {
  const [statusProspeccao, setStatusProspeccao] = useState(
    company?.status_prospeccao || "",
  );
  const [activeTab, setActiveTab] = useState("detalhes");

  const isRegistered = !!company?._id;
  const getStatusLabel = (status) => {
    switch (status) {
      case "01":
        return "NULA";
      case "02":
        return "ATIVA";
      case "03":
        return "SUSPENSA";
      case "04":
        return "INAPTA";
      case "08":
        return "BAIXADA";
      default:
        return status;
    }
  };
  const [message, setMessage] = useState("");

  useEffect(() => {
    setHistoricoStatus(company?.historico_status || []);
  }, [company]);

  const [historicoStatus, setHistoricoStatus] = useState(
    company?.historico_status || [],
  );

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 ">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">
            Nenhuma empresa selecionada
          </h3>
          <p className="text-gray-500 mt-2">
            Use o campo de busca para encontrar informações de uma empresa
          </p>
        </div>
      </div>
    );
  }

  const InfoCard = ({ icon: Icon, title, value, fullWidth = false }) => (
    <div
      className={`bg-gray-50 rounded-lg p-4 ${fullWidth ? "col-span-2" : ""}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 text-azulclaro mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-sm font-semibold text-gray-900 break-words">
            {value || "Não informado"}
          </p>
        </div>
      </div>
    </div>
  );

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return "";
    const numbers = cnpj.replace(/\D/g, "");
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00") {
      return "Não informado";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Não informado";
    }

    return date.toLocaleDateString("pt-BR", {
      timeZone: "UTC",
    });
  };

  const cadastralColors = {
    NULA: "bg-gray-300 text-gray-800",
    ATIVA: "bg-green-100 text-green-800",
    SUSPENSA: "bg-yellow-100 text-yellow-800",
    INAPTA: "bg-purple-100 text-purple-800",
    BAIXADA: "bg-red-100 text-red-800",
  };

  const formatCurrency = (value) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isValidDate = (date) => {
    if (!date) return false;

    const d = new Date(date);

    return !isNaN(d.getTime()) && d.getTime() > 0;
  };

  const handleEditStatus = (index) => {
    const item = historicoStatus[index];

    setStatusProspeccao(item.status);
  };

  const handleDeleteStatus = async (histId) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja apagar esse histórico?",
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/companies/${company._id}/historico/${histId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Erro DELETE:", err);
      return;
    }

    const updatedCompany = await response.json();
    setHistoricoStatus(updatedCompany.historico_status || []);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pt-20 md:pt-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-azulescuro to-azulescuro p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {company.razao_social || company.nome_fantasia || "Empresa"}
              </h1>
              <p className="text-emerald-100 text-lg">
                {formatCNPJ(company.cnpj)}
              </p>
            </div>
            <div
              className={`rounded-lg px-4 py-2 backdrop-blur-sm ${
                cadastralColors[getStatusLabel(company.situacao_cadastral)] ||
                "bg-gray-100"
              }`}
            >
              <p className="text-xs font-medium">Status</p>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusLabel(company.situacao_cadastral) === "ATIVA" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}

                <span className="font-semibold px-2 py-1 rounded">
                  {getStatusLabel(company.situacao_cadastral) ||
                    "Não informado"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b bg-gray-50 px-8 py-4 flex gap-4">
          <button
            onClick={() => setActiveTab("detalhes")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "detalhes"
                ? "bg-azulclaro text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Detalhes
          </button>

          <button
            onClick={() => setActiveTab("historico")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "historico"
                ? "bg-azulclaro text-white"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Histórico
          </button>
        </div>

        <div className="p-8">
          {activeTab === "detalhes" && (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                  <span>Informações Básicas</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={FileText}
                    title="Razão Social"
                    value={company.razao_social}
                    fullWidth
                  />
                  <InfoCard
                    icon={Building2}
                    title="Nome Fantasia"
                    value={company.nome_fantasia}
                  />
                  <InfoCard icon={Hash} title="Porte" value={company.porte} />
                  <InfoCard
                    icon={Briefcase}
                    title="Natureza Jurídica"
                    value={company.natureza_juridica}
                    fullWidth
                  />
                  <InfoCard
                    icon={Calendar}
                    title="Data de Abertura"
                    value={formatDate(company.data_abertura)}
                  />
                  <InfoCard
                    icon={Calendar}
                    title="Data Situação Cadastral"
                    value={formatDate(company.data_situacao_cadastral)}
                  />
                </div>
              </div>

              {(company.logradouro || company.municipio) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <span>Endereço</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={MapPin}
                      title="Logradouro"
                      value={company.logradouro}
                      fullWidth
                    />
                    <InfoCard
                      icon={Hash}
                      title="Número"
                      value={company.numero}
                    />
                    <InfoCard
                      icon={FileText}
                      title="Complemento"
                      value={company.complemento}
                    />
                    <InfoCard
                      icon={MapPin}
                      title="Bairro"
                      value={company.bairro}
                    />
                    <InfoCard
                      icon={MapPin}
                      title="Município"
                      value={company.municipio}
                    />
                    <InfoCard icon={MapPin} title="UF" value={company.uf} />
                    <InfoCard icon={Hash} title="CEP" value={company.cep} />
                  </div>
                </div>
              )}

              {(company.email || company.telefone) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Phone className="w-6 h-6 text-emerald-600" />
                    <span>Contato</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={Mail}
                      title="E-mail"
                      value={company.email}
                    />
                    <InfoCard
                      icon={Phone}
                      title="Telefone"
                      value={company.telefone}
                    />
                  </div>
                </div>
              )}

              {company.capital_social !== null &&
                company.capital_social !== undefined && (
                  <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                      <span>Informações Financeiras</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        icon={DollarSign}
                        title="Capital Social"
                        value={formatCurrency(company.capital_social)}
                      />
                    </div>
                  </div>
                )}
              <Enriquecimento
                company={company}
                isRegistered={isRegistered}
                onUpdateCompany={onUpdateCompany}
                currentUser={currentUser}
              />
              <Contacts
                cnpj={company.cnpj}
                isRegistered={isRegistered}
                currentUser={currentUser}
              />
              <Insights cnpj={company.cnpj} isRegistered={isRegistered} />
              <Interacoes cnpj={company.cnpj} isRegistered={isRegistered} />

              {company.cnae_fiscal_descricao && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Briefcase className="w-6 h-6 text-emerald-600" />
                    <span>Atividade Econômica</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={Hash}
                      title="CNAE Fiscal"
                      value={company.cnae_fiscal}
                    />
                    <InfoCard
                      icon={FileText}
                      title="Descrição CNAE"
                      value={company.cnae_fiscal_descricao}
                      fullWidth
                    />
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <span>Status da Prospecção</span>
                </h2>

                <div className="bg-gray-50 rounded-lg p-4 col-span-1 md:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-azulclaro mt-0.5" />

                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                          Status atual
                        </p>

                        <select
                          value={statusProspeccao}
                          onChange={(e) => setStatusProspeccao(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="">Selecione um status</option>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                {isRegistered ? (
                  <button
                    onClick={async () => {
                      const updatedCompany = await onUpdateCompany({
                        ...company,
                        status_prospeccao: statusProspeccao,
                        user: {
                          firstName: currentUser?.firstName,
                          lastName: currentUser?.lastName,
                        },
                      });

                      console.log("RETORNO:", updatedCompany);

                      if (!updatedCompany) return;

                      setHistoricoStatus(updatedCompany.historico_status || []);

                      setMessage("Dados atualizados!");
                      setTimeout(() => setMessage(""), 3000);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold mb-4"
                  >
                    Atualizar status
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!empresas.some((e) => e.cnpj === company.cnpj)) {
                        const cleanCompany = {
                          ...company,

                          data_abertura: isValidDate(company.data_abertura)
                            ? company.data_abertura
                            : null,

                          data_situacao_cadastral: isValidDate(
                            company.data_situacao_cadastral,
                          )
                            ? company.data_situacao_cadastral
                            : null,

                          status_prospeccao: statusProspeccao,
                        };

                        onAddCompany(cleanCompany);

                        setMessage("Empresa adicionada!");
                      } else {
                        setMessage("Empresa já cadastrada!");
                      }

                      setTimeout(() => setMessage(""), 3000);
                    }}
                    className="bg-azulclaro hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Adicionar empresa no Sistema
                  </button>
                )}
              </div>
              {historicoStatus.length > 0 && (
                <div className="space-y-2">
                  {historicoStatus.length > 0 && (
                    <div className=" bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold mb-2 text-gray-700">
                        Histórico de Prospecção
                      </h3>

                      <div className="space-y-2">
                        {historicoStatus.map((item, index) => (
                          <div
                            key={index}
                            className="text-xs text-gray-600 border-b pb-1 flex justify-between items-center"
                          >
                            <p>
                              {item.status} •{" "}
                              <span className="font-medium">
                                {item.user?.firstName || "Desconhecido"}{" "}
                                {item.user?.lastName || ""}
                              </span>{" "}
                              • {new Date(item.data).toLocaleString("pt-BR")}
                            </p>
                            {currentUser?.role === "admin" && (
                              <button
                                onClick={() => handleDeleteStatus(item._id)}
                                className="text-red-500 hover:text-red-700 text-xs ml-2"
                              >
                                Apagar
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message && (
                <p className="mt-4 text-green-600 font-medium text-center">
                  {message}
                </p>
              )}
            </>
          )}

          {activeTab === "historico" && <AuditHistory cnpj={company.cnpj} />}
        </div>
      </div>
    </div>
  );
}
