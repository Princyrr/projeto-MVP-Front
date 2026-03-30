import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import banner1 from "../assets/banner1.png";
import banner2 from "../assets/banner2.png";

export default function SearchCompany({ onSearch, loading }) {
  const [cnpj, setCnpj] = useState("");
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSecond(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5",
      );
    }
    return numbers.slice(0, 14);
  };

  const handleInputChange = (e) => setCnpj(formatCNPJ(e.target.value));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (cleanCNPJ.length === 14) onSearch(cleanCNPJ);
  };

  return (
    <div>
      <div
        className="relative mx-auto  mt-8"
        style={{ width: "900px", height: "450px" }}
      >
        <img
          src={banner1}
          alt="Banner 1"
          className="w-full h-full object-contain"
        />

        {showSecond && (
          <img
            src={banner2}
            alt="Banner 2"
            className="absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-500 opacity-100"
          />
        )}
      </div>

      {/* 🔹 FORMULARIO */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Buscar Empresa por CNPJ
            </h2>
            <p className="text-gray-600">
              Digite o CNPJ da empresa para consultar suas informações
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="cnpj"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                CNPJ
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cnpj"
                  value={cnpj}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  maxLength="18"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cnpj.replace(/\D/g, "").length !== 14}
              className="w-full bg-azulescuro text-white py-3 rounded-lg font-semibold hover:bg-azulclaro disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Buscar Empresa</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Digite apenas os números do CNPJ ou use a
              formatação completa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
