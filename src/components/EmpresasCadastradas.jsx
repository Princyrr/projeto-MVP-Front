import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import dashboardGif from "../assets/dashboard3.gif";

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
      case "Não abordada":
        return "bg-gray-600 text-gray-100";
      case "Em pesquisa":
        return "bg-purple-100 text-purple-600";
      case "Contato iniciado":
        return "bg-blue-100 text-blue-600";
      case "Em negociação":
        return "bg-orange-100 text-orange-600";
      case "Convertida":
        return "bg-green-100 text-green-600";
      case "Sem interesse":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-50 text-gray-500";
    }
  };

  const filteredEmpresas = useMemo(() => {
    return empresas
      .filter((empresa) => {
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
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [empresas, search, filters]);

  return (
    <div className="max-w-7xl mx-auto mt-10 px-6 pt-12 md:pt-10">
      {/* HEADER */}
      <div className="relative mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden flex items-center justify-between">
          {/* EFEITO  */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-40"></div>

          {/* TEXTO */}
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gerencie e acompanhe suas empresas
            </p>
          </div>
        </div>
        <img
          src={dashboardGif}
          alt="Dashboard"
          className="hidden md:block absolute right-2 -top-16 w-[340px] h-auto "
        />
      </div>

      <div className="mb-6 flex items-center gap-3">
        {/* INPUT */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empresa ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* BOTÃO */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 h-11 rounded-lg bg-white border hover:bg-gray-50 transition text-sm shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* FILTROS */}
      {showFilters && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            <input
              placeholder="Município"
              value={filters.municipio}
              onChange={(e) =>
                setFilters({ ...filters, municipio: e.target.value })
              }
              className="h-10 px-3 rounded-lg border text-sm"
            />

            <input
              placeholder="UF"
              value={filters.uf}
              onChange={(e) => setFilters({ ...filters, uf: e.target.value })}
              className="h-10 px-3 rounded-lg border text-sm"
            />

            <input
              placeholder="CNAE"
              value={filters.cnae}
              onChange={(e) => setFilters({ ...filters, cnae: e.target.value })}
              className="h-10 px-3 rounded-lg border text-sm"
            />

            <select
              value={filters.status_prospeccao}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status_prospeccao: e.target.value,
                })
              }
              className="h-10 px-3 rounded-lg border text-sm"
            >
              <option value="">Status</option>
              <option>Não abordada</option>
              <option>Em pesquisa</option>
              <option>Contato iniciado</option>
              <option>Em negociação</option>
              <option>Convertida</option>
              <option>Sem interesse</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* LISTA EM CARDS */}
      {!filteredEmpresas.length ? (
        <div className="py-16 text-center text-gray-400">
          Nenhuma empresa encontrada
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmpresas.map((empresa) => (
            <div
              key={empresa._id || empresa.cnpj}
              onClick={() => onSelectCompany(empresa)}
              className="bg-white border rounded-2xl p-5 cursor-pointer 
              hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                  {empresa.razao_social || empresa.nome_fantasia}
                </h3>

                <span
                  className={`text-[10px] px-2 py-1 rounded-md ${getStatusColor(
                    empresa.status_prospeccao,
                  )}`}
                >
                  {empresa.status_prospeccao || "Sem status"}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-2">{empresa.cnpj}</p>

              <p className="text-xs text-gray-400">
                {empresa.municipio} - {empresa.uf}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
