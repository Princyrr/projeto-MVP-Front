import { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Activity,
  Brain,
  Building2,
  Users,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import dashboardGif from "../assets/dashboard.png";
import { API_URL } from "../config";
import PotencialModal from "./PotencialModal";

export default function Dashboard({
  company,
  registeredCompanies,
  onSelectCompany,
}) {
  const token = localStorage.getItem("token");

  const authFetch = (url) => {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };
  const [openPotencialModal, setOpenPotencialModal] = useState(false);
  const [enriquecimentos, setEnriquecimentos] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [potencialStats, setPotencialStats] = useState(null);
  const [insightsStats, setInsightsStats] = useState(null);

  useEffect(() => {
    authFetch(`${API_URL}/api/contacts`)
      .then((res) => res.json())
      .then(setContacts);
  }, []);

  useEffect(() => {
    authFetch(`${API_URL}/api/enriquecimento/stats/potencial`)
      .then((res) => res.json())
      .then(setPotencialStats);
  }, []);

  useEffect(() => {
    authFetch(`${API_URL}/api/insights/stats`)
      .then((res) => res.json())
      .then(setInsightsStats)
      .catch(() => setInsightsStats(null));
  }, []);

  useEffect(() => {
    authFetch(`${API_URL}/api/enriquecimento`)
      .then((res) => res.json())
      .then(setEnriquecimentos);
  }, []);

  const formatDateTime = (date) => new Date(date).toLocaleString("pt-BR");

  const totalEmpresas = registeredCompanies?.length || 0;
  const totalContatos = contacts.length;
  const empresasComContato = new Set(contacts.map((c) => c.cnpj)).size;
  const empresasSemContato = totalEmpresas - empresasComContato;

  const statusCount = registeredCompanies?.reduce((acc, empresa) => {
    const status = empresa.status_prospeccao || "Não definido";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCount || {}).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const COLORS = [
    "#4F46E5",
    "#06B6D4",
    "#22C55E",
    "#84CC16",
    "#F59E0B",
    "#F97316",
    "#EF4444",
  ];

  const ultimosContatos = [...contacts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const getEmpresaNome = (cnpj) => {
    const empresa = registeredCompanies?.find((e) => e.cnpj === cnpj);
    return empresa?.nome_fantasia || empresa?.razao_social || cnpj;
  };

  const insightConfig = {
    oportunidade: {
      label: "Oportunidades",
      color: "bg-green-500",
      icon: TrendingUp,
    },
    dor: {
      label: "Dores",
      color: "bg-red-500",
      icon: AlertTriangle,
    },
    risco: {
      label: "Riscos",
      color: "bg-yellow-500",
      icon: Activity,
    },
    maturidade: {
      label: "Maturidade",
      color: "bg-purple-500",
      icon: Brain,
    },
  };

  const total =
    (insightsStats?.oportunidade || 0) +
    (insightsStats?.dor || 0) +
    (insightsStats?.risco || 0) +
    (insightsStats?.maturidade || 0);

  const destaque = insightsStats
    ? Object.entries(insightConfig).reduce((a, b) =>
        (insightsStats[a[0]] || 0) > (insightsStats[b[0]] || 0) ? a : b,
      )
    : null;

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-azulclaro  shadow-[0_8px_25px_rgba(59,130,246,0.25)] transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="text-white w-5 h-5" />
        </div>
      </div>
    </div>
  );

  const empresasComPotencial = registeredCompanies.map((empresa) => {
    const enriquecimento = enriquecimentos.find((e) => e.cnpj === empresa.cnpj);

    return {
      ...empresa,
      potencial_comercial: enriquecimento?.potencial_comercial || null,
    };
  });
  return (
    <div className="bg-gray-50 min-h-screen px-8 py-10 pt-20 md:pt-10">
      <div className="relative mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Dashboard
              <span className="text-sm bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md">
                visão geral
              </span>
            </h1>

            <p className="text-gray-500 mt-2 max-w-md">
              Acompanhe métricas e oportunidades de forma clara e rápida.
            </p>
          </div>
        </div>

        <img
          src={dashboardGif}
          alt="Dashboard"
          className="hidden md:block absolute -top-10 right-6 w-[330px] h-auto drop-shadow-xl"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={Building2}
          title="Empresas"
          value={totalEmpresas}
          color="bg-indigo-500"
        />
        <StatCard
          icon={Users}
          title="Com contato"
          value={empresasComContato}
          color="bg-green-500"
        />

        <StatCard
          icon={Activity}
          title="Sem contato"
          value={empresasSemContato}
          color="bg-red-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Status atual"
          value={company?.status_prospeccao || "N/A"}
          color="bg-purple-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] transition">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            🟢 🔵 🟠 Status da Prospecção
          </h2>

          {pieData.length > 0 ? (
            <div className="grid md:grid-cols-2 items-center">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={100}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {pieData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>

        <div
          onClick={() => setOpenPotencialModal(true)}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] transition cursor-pointer "
        >
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            🚀 Potencial Comercial
          </h2>

          {potencialStats ? (
            <div className="space-y-5">
              {["alto", "medio", "baixo"].map((tipo) => {
                const value = potencialStats[tipo] || 0;
                const percent = totalEmpresas
                  ? (value / totalEmpresas) * 100
                  : 0;

                const colorMap = {
                  alto: "bg-green-500",
                  medio: "bg-yellow-500",
                  baixo: "bg-red-500",
                };

                const labelMap = {
                  alto: "Alto",
                  medio: "Médio",
                  baixo: "Baixo",
                };

                return (
                  <div key={tipo}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {labelMap[tipo]}
                        </span>

                        <div
                          className={`w-2 h-2 rounded-full ${colorMap[tipo]}`}
                        />
                      </div>

                      <span className="text-sm text-gray-500">
                        {value} empresas
                      </span>
                    </div>

                    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`${colorMap[tipo]} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />

                      <div
                        className="absolute top-0 left-0 h-2 rounded-full opacity-30 blur-sm"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: "currentColor",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">Sem dados</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] transition mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
          📊 Insights Estratégicos
        </h2>

        {insightsStats ? (
          <div className="grid md:grid-cols-4 gap-5">
            {Object.entries(insightConfig).map(([key, item]) => {
              const value = insightsStats[key] || 0;
              const percent = total ? (value / total) * 100 : 0;
              const Icon = item.icon;

              const isHighlight = destaque && destaque[0] === key;

              return (
                <div
                  key={key}
                  className={`relative p-5 rounded-2xl border transition 
          ${
            isHighlight
              ? "bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] scale-[1.02]"
              : "bg-gray-50 hover:bg-white hover:shadow-md"
          }`}
                >
                  {isHighlight && (
                    <span className="absolute top-2 right-2 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
                      destaque
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="text-white w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>

                  <p className="text-3xl font-bold text-gray-900">{value}</p>

                  <p className="text-xs text-gray-400 mb-3">
                    {percent.toFixed(1)}% do total
                  </p>

                  <div className="w-full bg-gray-200 h-1.5 rounded-full">
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">Sem insights ainda</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] transition">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            📞 Últimos contatos
          </h2>

          {ultimosContatos.map((c) => (
            <div
              key={c._id}
              className="flex justify-between items-center py-3 border-b last:border-none hover:bg-gray-50 px-2 rounded-lg transition"
            >
              <div>
                <p className="font-medium">{c.nome}</p>
                <p className="text-sm text-gray-500">
                  {getEmpresaNome(c.cnpj)}
                </p>
              </div>

              <span className="text-xs text-gray-400">
                {formatDateTime(c.createdAt)}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] transition">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
            🏭 Última empresa
          </h2>

          {company ? (
            <>
              <p className="font-medium">{company.razao_social}</p>
              <p className="text-sm text-gray-500">{company.municipio}</p>
            </>
          ) : (
            <p className="text-gray-400">Nenhuma empresa ainda</p>
          )}
        </div>
      </div>
      <PotencialModal
        open={openPotencialModal}
        onClose={() => setOpenPotencialModal(false)}
        empresas={empresasComPotencial}
        onSelectCompany={(empresa) => {
          onSelectCompany(empresa);
          setOpenPotencialModal(false);
        }}
      />
    </div>
  );
}
