import { useState, useEffect } from "react";
import {
  FileText,
  Briefcase,
  DollarSign,
  Hash,
  CheckCircle,
} from "lucide-react";
import { API_URL } from "../config";

export default function Enriquecimento({ company, isRegistered, currentUser }) {
  const [historico, setHistorico] = useState([]);
  const [form, setForm] = useState({
    site: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    numero_empregados_estimado: "",
    faturamento_estimado: "",
    segmento_comercial: "",
    potencial_comercial: "",
    observacoes: "",
  });

  useEffect(() => {
    const fetchEnriquecimento = async () => {
      if (!company?.cnpj) return;
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `${API_URL}/api/enriquecimento/${company.cnpj}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();

        setForm({
          site: data.site ?? "",
          linkedin: data.linkedin ?? "",
          instagram: data.instagram ?? "",
          facebook: data.facebook ?? "",
          numero_empregados_estimado:
            data.numero_empregados_estimado > 0
              ? data.numero_empregados_estimado
              : "",
          faturamento_estimado:
            data.faturamento_estimado > 0 ? data.faturamento_estimado : "",
          segmento_comercial: data.segmento_comercial ?? "",
          potencial_comercial: data.potencial_comercial ?? "",
          observacoes: data.observacoes ?? "",
        });
        setHistorico(data.historico_atualizacao || []);
      } catch (err) {
        console.error("Erro ao buscar enriquecimento:", err);
      }
    };

    fetchEnriquecimento();
  }, [company?.cnpj]);

  const handleSave = async () => {
    if (!company?.cnpj) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/enriquecimento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cnpj: company.cnpj,
          ...form,
          potencial_comercial: form.potencial_comercial || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar enriquecimento");
      }

      const data = await res.json();
      setHistorico(data.historico_atualizacao || []);
      console.log("Enriquecimento salvo:", data);

      alert("Dados de enriquecimento salvos com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar enriquecimento:", err);
      alert("Erro ao salvar os dados de enriquecimento.");
    }
  };
  const handleDeleteHistorico = async (index) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja apagar este item do histórico?",
    );

    if (!confirmDelete) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${API_URL}/api/enriquecimento/remover-historico`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cnpj: company.cnpj,
            index,
          }),
        },
      );

      const data = await res.json();
      setHistorico(data.historico_atualizacao || []);
    } catch (err) {
      console.error("Erro ao remover:", err);
    }
  };
  const InfoCardEditable = ({
    icon: Icon,
    title,
    field,
    type = "text",
    fullWidth = false,
    formatCurrencyOnBlur = false,
  }) => {
    const [inputValue, setInputValue] = useState(form[field] ?? "");

    useEffect(() => {
      if (field === "faturamento_estimado") {
        if (form[field]) {
          const formatted = new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(form[field]);

          setInputValue(formatted);
        } else {
          setInputValue("");
        }
      } else {
        setInputValue(form[field] ?? "");
      }
    }, [form[field]]);

    const handleChange = (e) => {
      let val = e.target.value;

      if (field === "faturamento_estimado") {
        const numbers = val.replace(/\D/g, "");

        const formatted = new Intl.NumberFormat("pt-BR").format(numbers);

        setInputValue(formatted);
        return;
      }

      if (type === "number") {
        val = val.replace(/\D/g, "");
      }

      setInputValue(val);
    };

    const handleBlur = () => {
      if (field === "faturamento_estimado" && inputValue) {
        const numericValue = Number(inputValue.replace(/\./g, ""));

        if (!numericValue) {
          setForm((prev) => ({ ...prev, [field]: "" }));
          setInputValue("");
          return;
        }

        setForm((prev) => ({ ...prev, [field]: numericValue }));

        const formatted = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(numericValue);

        setInputValue(formatted);
      } else {
        setForm((prev) => ({ ...prev, [field]: inputValue }));
      }
    };

    return (
      <div
        className={`bg-gray-50 rounded-lg p-4 w-full ${fullWidth ? "md:col-span-2" : ""}`}
      >
        <div className="flex items-start space-x-3">
          <Icon className="w-5 h-5 text-azulclaro mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              {title}
            </p>

            <input
              type={type}
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 md:px-2 md:py-1 text-sm md:text-sm"
            />
          </div>
        </div>
      </div>
    );
  };

  if (!isRegistered) {
    return (
      <div className="bg-yellow-50 p-4 mb-6 rounded-lg">
        <p className="text-sm text-yellow-700">
          Adicione no Sistema a empresa para adicionar Enriquecimento
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 px-3 sm:px-0">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <Briefcase className="w-6 h-6 text-emerald-600" />
        <span>Enriquecimento de Dados</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl p-3 sm:p-4">
        <InfoCardEditable icon={FileText} title="Site" field="site" />
        <InfoCardEditable icon={Briefcase} title="LinkedIn" field="linkedin" />
        <InfoCardEditable
          icon={Briefcase}
          title="Instagram"
          field="instagram"
        />
        <InfoCardEditable icon={Briefcase} title="Facebook" field="facebook" />

        <InfoCardEditable
          icon={Hash}
          title="Número de empregados"
          field="numero_empregados_estimado"
          type="number"
        />

        <InfoCardEditable
          icon={DollarSign}
          title="Faturamento estimado"
          field="faturamento_estimado"
        />

        <InfoCardEditable
          icon={Briefcase}
          title="Segmento comercial"
          field="segmento_comercial"
        />

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-azulclaro mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Potencial comercial
              </p>

              <select
                value={form.potencial_comercial}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    potencial_comercial: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
              >
                <option value="">Selecione</option>
                <option value="baixo">Baixo</option>
                <option value="médio">Médio</option>
                <option value="alto">Alto</option>
              </select>
            </div>
          </div>
        </div>

        <InfoCardEditable
          icon={FileText}
          title="Observações"
          field="observacoes"
          fullWidth
        />
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="bg-azulclaro hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold mr-4 "
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
