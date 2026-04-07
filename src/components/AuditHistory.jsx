import { useEffect, useState } from "react";
import { Clock, User } from "lucide-react";
import { API_URL } from "../config";

export default function AuditHistory({ cnpj }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!cnpj) return;

    fetch(`${API_URL}/api/audit/${cnpj}`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err));
  }, [cnpj]);

  if (!logs.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhum histórico encontrado.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Histórico de Alterações
      </h2>

      <div className="relative border-l-2 border-gray-200 pl-6 space-y-6">
        {logs.map((log) => (
          <div key={log._id} className="relative">
            <div className="absolute -left-[11px] top-2 w-5 h-5 bg-azulclaro rounded-full border-2 border-white shadow"></div>

            <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-azulclaro uppercase">
                  {log.campo}
                </span>

                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={14} />
                  {new Date(log.alterado_em).toLocaleString("pt-BR")}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between">
                <span className="text-red-500 line-through">
                  {log.valor_anterior || "—"}
                </span>

                <span className="mx-2 text-gray-400">→</span>

                <span className="text-green-600 font-medium">
                  {log.valor_novo}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                <User size={14} />
                {log.alterado_por?.firstName} {log.alterado_por?.lastName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
