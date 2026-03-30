import { useState, useEffect } from "react";
import { Building2, TrendingUp, Activity, Users } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { API_URL } from "../config";

export default function Dashboard({ company, registeredCompanies }) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/contacts`)
      .then((res) => res.json())
      .then((data) => setContacts(data));
  }, []);

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

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

  const StatCard = ({ icon: Icon, title, value, color = "emerald" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`bg-${color}-100 p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  // 🔹 MÉTRICAS
  const totalEmpresas = registeredCompanies?.length || 0;
  const totalContatos = contacts.length;
  const empresasComContato = new Set(contacts.map((c) => c.cnpj)).size;

  const statusCount = registeredCompanies?.reduce((acc, empresa) => {
    const status = empresa.status_prospeccao || "Não definido";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusLabel = getStatusLabel(company?.situacao_cadastral);

  const ultimosContatos = [...contacts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getEmpresaNome = (cnpj) => {
    const empresa = registeredCompanies?.find((e) => e.cnpj === cnpj);

    if (empresa) {
      return empresa.nome_fantasia || empresa.razao_social;
    }

    return `Empresa não carregada (${cnpj})`;
  };

  const pieData = Object.entries(statusCount || {}).map(([status, count]) => ({
    name: getStatusLabel(status),
    value: count,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Visão geral da prospecção de empresas
      </p>

      {/* 🔹 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Building2}
          title="Empresas cadastradas"
          value={totalEmpresas}
        />

        <StatCard
          icon={Users}
          title="Total de contatos"
          value={totalContatos}
          color="blue"
        />

        <StatCard
          icon={Activity}
          title="Empresas com contato"
          value={empresasComContato}
          color="green"
        />

        <StatCard
          icon={TrendingUp}
          title="Status atual"
          value={company?.status_prospeccao || "N/A"}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">
          Status das Empresas Cadastradas
        </h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Nenhum dado para mostrar</p>
        )}
      </div>

      {/* 🔹 FUNIL */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Funil de Prospecção</h2>

        <div className="space-y-2">
          {statusCount &&
            Object.entries(statusCount).map(([status, count]) => (
              <div key={status} className="flex justify-between border-b pb-2">
                <span className="text-gray-600">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* 🔹 ÚLTIMOS CONTATOS */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Últimos contatos adicionados</h2>

        {ultimosContatos.length > 0 ? (
          <div className="space-y-3">
            {ultimosContatos.map((c) => (
              <div key={c._id} className="border-b pb-2 flex justify-between">
                <div>
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-sm text-gray-600">
                    {getEmpresaNome(c.cnpj)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.cargo || "Sem cargo"}
                  </p>
                </div>

                <div className="text-xs text-gray-400">
                  {formatDateTime(c.createdAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum contato cadastrado ainda</p>
        )}
      </div>

      {/* 🔹 ÚLTIMA EMPRESA */}
      {company ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold mb-4">Última empresa consultada</h2>

          <div className="space-y-2">
            <p>
              <strong>Razão:</strong> {company.razao_social}
            </p>
            <p>
              <strong>CNPJ:</strong> {company.cnpj}
            </p>
            <p>
              <strong>Cidade:</strong> {company.municipio}
            </p>
            <p>
              <strong>Status Receita:</strong>{" "}
              <span
                className={
                  statusLabel === "ATIVA" ? "text-green-600" : "text-red-600"
                }
              >
                {statusLabel}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-xl text-center shadow">
          <Building2 className="mx-auto mb-4 text-gray-300" size={40} />
          <p className="text-gray-500">Nenhuma empresa consultada ainda</p>
        </div>
      )}
    </div>
  );
}
