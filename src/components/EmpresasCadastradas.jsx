import { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function EmpresasCadastradas({ empresas, onSelectCompany }) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    municipio: "",
    uf: "",
    cnae: "",
    status_prospeccao: "",
  });

  const handleClearFilters = () => {
    setFilters({
      municipio: "",
      uf: "",
      cnae: "",
      status_prospeccao: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Convertida":
        return "bg-green-100 text-green-700";
      case "Em negociação":
        return "bg-yellow-100 text-yellow-700";
      case "Contato iniciado":
        return "bg-blue-100 text-blue-700";
      case "Sem interesse":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredEmpresas = empresas.filter((empresa) => {
    const nome =
      empresa.razao_social?.toLowerCase() ||
      empresa.nome_fantasia?.toLowerCase() ||
      "";

    const cnpj = empresa.cnpj?.toLowerCase() || "";

    const matchSearch =
      nome.includes(search.toLowerCase()) ||
      cnpj.includes(search.toLowerCase());

    const matchFilters =
      (!filters.municipio ||
        empresa.municipio
          ?.toLowerCase()
          .includes(filters.municipio.toLowerCase())) &&
      (!filters.uf ||
        empresa.uf?.toLowerCase().includes(filters.uf.toLowerCase())) &&
      (!filters.cnae ||
        empresa.cnae?.toLowerCase().includes(filters.cnae.toLowerCase())) &&
      (!filters.status_prospeccao ||
        empresa.status_prospeccao === filters.status_prospeccao);

    return matchSearch && matchFilters;
  });

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Empresas Cadastradas
          </h2>
          <p className="text-gray-500 text-sm">
            Gerencie e visualize as empresas que já foram cadastradas.
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/*  BUSCA */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-azulclaro shadow-sm"
        />
      </div>

      {/*  FILTROS */}
      {showFilters && (
        <div className="bg-white border shadow-sm rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">
            Filtros avançados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Município"
              value={filters.municipio}
              onChange={(e) =>
                setFilters({ ...filters, municipio: e.target.value })
              }
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-azulclaro"
            />

            <input
              placeholder="UF"
              value={filters.uf}
              onChange={(e) => setFilters({ ...filters, uf: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-azulclaro"
            />

            <input
              placeholder="CNAE"
              value={filters.cnae}
              onChange={(e) => setFilters({ ...filters, cnae: e.target.value })}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-azulclaro"
            />

            <select
              value={filters.status_prospeccao}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status_prospeccao: e.target.value,
                })
              }
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-azulclaro"
            >
              <option value="">Status da Prospecção</option>
              <option>Não abordada</option>
              <option>Em pesquisa</option>
              <option>Contato iniciado</option>
              <option>Em negociação</option>
              <option>Convertida</option>
              <option>Sem interesse</option>
            </select>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-red-500 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* 🔹 LISTA */}
      {!filteredEmpresas.length ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma empresa encontrada
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEmpresas.map((empresa) => (
            <div
              key={empresa._id || empresa.cnpj}
              onClick={() => onSelectCompany(empresa)}
              className="p-5 bg-white rounded-2xl shadow-sm border hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">
                    {empresa.razao_social || empresa.nome_fantasia}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{empresa.cnpj}</p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                    empresa.status_prospeccao,
                  )}`}
                >
                  {empresa.status_prospeccao || "Sem status"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
