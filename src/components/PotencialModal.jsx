import { X, Building2, MapPin } from "lucide-react";

export default function PotencialModal({
  open,
  onClose,
  empresas = [],
  onSelectCompany,
}) {
  if (!open) return null;

  const normalize = (text) =>
    text
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const grupos = {
    alto: empresas.filter((e) => normalize(e.potencial_comercial) === "alto"),
    medio: empresas.filter((e) => normalize(e.potencial_comercial) === "medio"),
    baixo: empresas.filter((e) => normalize(e.potencial_comercial) === "baixo"),
  };

  const config = {
    alto: {
      label: "Alto",
      color: "bg-green-500",
      soft: "bg-green-50",
      border: "border-green-100",
    },
    medio: {
      label: "Médio",
      color: "bg-yellow-500",
      soft: "bg-yellow-50",
      border: "border-yellow-100",
    },
    baixo: {
      label: "Baixo",
      color: "bg-red-500",
      soft: "bg-red-50",
      border: "border-red-100",
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[96%] max-w-6xl rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* HEADER  */}
        <div className="flex justify-between items-center px-8 py-5 border-b bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🚀 Potencial Comercial
            </h2>
            <p className="text-sm text-gray-400">
              Visualize e navegue pelas empresas por nível de potencial
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6 max-h-[75vh] overflow-hidden">
          {Object.entries(grupos).map(([tipo, lista]) => {
            const c = config[tipo];

            return (
              <div
                key={tipo}
                className={`rounded-2xl border ${c.border} ${c.soft} flex flex-col`}
              >
                {/* HEADER Coluna*/}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${c.color}`} />
                    <span className="text-sm font-semibold text-gray-700">
                      {c.label}
                    </span>
                  </div>

                  <span className="text-xs text-gray-400">{lista.length}</span>
                </div>

                {/* LISTA */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {lista.length === 0 ? (
                    <div className="text-center text-xs text-gray-400 py-6">
                      Nenhuma empresa
                    </div>
                  ) : (
                    lista.map((empresa) => (
                      <div
                        key={empresa.cnpj}
                        onClick={() => {
                          onSelectCompany?.(empresa);
                          onClose();
                        }}
                        className="group p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition cursor-pointer"
                      >
                        {/* NOME */}
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                          {empresa.nome_fantasia ||
                            empresa.razao_social ||
                            "Sem nome"}
                        </p>

                        {/* CNPJ */}
                        <p className="text-[11px] text-gray-400 mt-1">
                          {empresa.cnpj}
                        </p>

                        {/* LOCAL */}
                        {empresa.municipio && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            {empresa.municipio} - {empresa.uf}
                          </div>
                        )}

                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition text-[11px] text-indigo-500">
                          Ver detalhes →
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
