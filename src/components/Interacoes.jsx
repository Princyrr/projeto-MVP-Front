import { useState, useEffect } from "react";
import { Phone, FileText, CheckCircle, Tag } from "lucide-react";
import { API_URL } from "../config";

export default function Interacoes({ cnpj, isRegistered }) {
  const token = localStorage.getItem("token");
  const [interacoes, setInteracoes] = useState([]);
  const [form, setForm] = useState({
    tipo: "ligacao",
    resumo: "",
    resultado: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  currentUser?.role === "admin";

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  useEffect(() => {
    if (!isRegistered) return;

    fetch(`${API_URL}/api/interacoes/${cnpj}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setInteracoes(data));
  }, [cnpj, isRegistered]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("Usuário não encontrado.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        user: {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
        },
      };

      if (editingId) {
        const res = await fetch(`${API_URL}/api/interacoes/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const updated = await res.json();
        setInteracoes(
          interacoes.map((i) => (i._id === editingId ? updated : i)),
        );
        setEditingId(null);
      } else {
        const res = await fetch(`${API_URL}/api/interacoes/${cnpj}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const newInteracao = await res.json();
        setInteracoes([newInteracao, ...interacoes]);
      }

      setForm({ tipo: "ligacao", resumo: "", resultado: "" });
      setError("");
    } catch {
      setError("Erro ao salvar interação.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar esta interação?",
    );
    if (!confirmDelete) return;

    await fetch(`${API_URL}/api/interacoes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setInteracoes(interacoes.filter((i) => i._id !== id));
  };

  const handleEdit = (i) => {
    setForm({
      tipo: i.tipo || "ligacao",
      resumo: i.resumo || "",
      resultado: i.resultado || "",
    });
    setEditingId(i._id);
  };

  const InfoCardEditable = ({ icon: Icon, title, field, type = "text" }) => {
    const [inputValue, setInputValue] = useState(form[field] || "");

    useEffect(() => setInputValue(form[field] || ""), [form[field]]);

    const handleBlur = () =>
      setForm((prev) => ({ ...prev, [field]: inputValue }));

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 text-azulclaro mt-1" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase mb-1">{title}</p>
            {type === "textarea" ? (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                className="w-full border rounded-lg px-2 py-1 text-sm"
              />
            ) : (
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                className="w-full border rounded-lg px-2 py-1 text-sm"
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isRegistered) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg mt-6 mb-10">
        <p className="text-sm text-yellow-700">
          Adicione no Sistema a empresa para adicionar Interações
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Phone className="w-6 h-6 text-emerald-600" />
        Interações
      </h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl p-4"
      >
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-azulclaro" />
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full border rounded-lg px-2 py-1 text-sm"
            >
              <option value="ligacao">Ligação</option>
              <option value="email">Email</option>
              <option value="reuniao">Reunião</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="visita">Visita</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2">
          <InfoCardEditable
            icon={FileText}
            title="Resumo"
            field="resumo"
            type="textarea"
          />
        </div>

        <div className="md:col-span-2">
          <InfoCardEditable
            icon={CheckCircle}
            title="Resultado"
            field="resultado"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-azulclaro hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold mt-3"
            disabled={loading}
          >
            {editingId ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </form>

      <div className="space-y-4 mb-20">
        {interacoes.map((i) => (
          <div
            key={i._id || Math.random().toString(36).substr(2, 9)}
            className="bg-blue-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-gray-600">
                Interação por: {i.tipo}
              </span>

              <span className="text-xs text-gray-400">
                {formatDateTime(i.data)}
              </span>
            </div>

            <p className="text-sm text-gray-800 mb-1">{i.resumo}</p>

            {i.resultado && (
              <p className="text-xs text-blue-500 mb-2">
                Resultado: {i.resultado}
              </p>
            )}

            <p className="text-xs text-gray-500 mb-2">
              👤 Adicionado por {i.user?.firstName || currentUser?.firstName}{" "}
              {i.user?.lastName || currentUser?.lastName}
            </p>

            <div className="flex gap-2">
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => {
                    const confirmEdit = window.confirm(
                      "Deseja realmente editar esta interação?",
                    );
                    if (!confirmEdit) return;

                    handleEdit(i);
                  }}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition"
                >
                  Editar
                </button>
              )}
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => handleDelete(i._id)}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition"
                >
                  Deletar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
