import { useState, useEffect } from "react";
import { FileText, Tag } from "lucide-react";
import { API_URL } from "../config";

export default function Insights({ cnpj, isRegistered }) {
  const [insights, setInsights] = useState([]);
  const [form, setForm] = useState({
    descricao: "",
    categoria: "",
    outraCategoria: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    descricao: "",
    categoria: "",
    outraCategoria: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));
  currentUser?.role === "admin";

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    if (!isRegistered || !cnpj) return;

    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/insights/${cnpj}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.warn("API respondeu com erro:", res.status);

          if (isMounted) {
            setInsights([]);
          }
          return;
        }

        const data = await res.json();

        if (isMounted) {
          setInsights(data || []);
        }
      } catch (err) {
        console.warn("Erro silencioso:", err.message);

        if (isMounted) {
          setInsights([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [cnpj, isRegistered]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.descricao) {
      setError("Descrição é obrigatória");
      return;
    }

    if (!currentUser) {
      setError("Usuário não encontrado.");
      return;
    }

    if (form.categoria === "outros" && !form.outraCategoria) {
      setError("Digite a categoria em 'Outros'");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/insights/${cnpj}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descricao: form.descricao,
          categoria: form.categoria,
          categoriaCustom:
            form.categoria === "outros" ? form.outraCategoria : null,
          body: JSON.stringify({
            descricao: form.descricao,
            categoria: form.categoria,
            categoriaCustom:
              form.categoria === "outros" ? form.outraCategoria : null,
          }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar insight");
      }

      const newInsight = await res.json();
      setInsights([newInsight, ...insights]);

      setForm({ descricao: "", categoria: "", outraCategoria: "" });
      setError("");
    } catch (err) {
      setError(err.message || "Erro ao adicionar insight.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este item?",
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/api/insights/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInsights(insights.filter((i) => i._id !== id));
    } catch {
      setError("Erro ao deletar insight.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editForm.descricao) {
      setError("Descrição é obrigatória");
      return;
    }
    if (editForm.categoria === "outros" && !editForm.outraCategoria) {
      setError("Digite a categoria em 'Outros'");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/insights/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descricao: editForm.descricao,
          categoria: editForm.categoria,
          categoriaCustom:
            editForm.categoria === "outros" ? editForm.outraCategoria : null,
          body: JSON.stringify({
            descricao: form.descricao,
            categoria: form.categoria,
            categoriaCustom:
              form.categoria === "outros" ? form.outraCategoria : null,
          }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao atualizar insight");
      }

      const updated = await res.json();
      setInsights(insights.map((i) => (i._id === id ? updated : i)));
      setEditingId(null);
      setError("");
    } catch (err) {
      setError(err.message || "Erro ao atualizar insight.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyle = (categoria) => {
    switch (categoria) {
      case "oportunidade":
        return "bg-green-50 border-l-4 border-green-400";
      case "dor":
        return "bg-red-50 border-l-4 border-red-400";
      case "risco":
        return "bg-yellow-50 border-l-4 border-yellow-400";
      case "maturidade":
        return "bg-purple-50 border-l-4 border-purple-400";
      default:
        return "bg-gray-50 border-l-4 border-gray-300";
    }
  };

  const InfoCardEditable = ({ icon: Icon, title, field, type = "text" }) => {
    const [inputValue, setInputValue] = useState(form[field] || "");

    useEffect(() => {
      setInputValue(form[field] || "");
    }, [form[field]]);

    const handleBlur = () => {
      setForm((prev) => ({ ...prev, [field]: inputValue }));
    };

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
      <div className="bg-yellow-50 p-4 rounded-lg mt-6">
        <p className="text-sm text-yellow-700">
          Adicione no Sistema a empresa para adicionar Informações
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 mb-10">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6 text-emerald-600" />
        Observações
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
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full border rounded-lg px-2 py-1 text-sm"
            >
              <option value="">Selecione...</option>
              <option value="oportunidade">Oportunidade</option>
              <option value="dor">Dor do Cliente</option>
              <option value="risco">Risco</option>
              <option value="maturidade">Maturidade</option>
              <option value="outros">Outros</option>
            </select>
            {form.categoria === "outros" && (
              <input
                type="text"
                placeholder="Digite a categoria"
                value={form.outraCategoria}
                onChange={(e) =>
                  setForm({ ...form, outraCategoria: e.target.value })
                }
                className="w-full border rounded-lg px-2 py-1 text-sm mt-2"
              />
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <InfoCardEditable
            icon={FileText}
            title="Descrição"
            field="descricao"
            type="textarea"
          />
        </div>

        <div className="md:col-span-2 flex justify-end mt-3">
          <button className="bg-azulclaro hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
            {loading ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </form>

      <div className="space-y-3 mb-20">
        {insights.map((i) => (
          <div
            key={i._id}
            className={`border rounded-lg p-4 shadow-sm ${getCategoryStyle(
              i.categoria,
            )}`}
          >
            <div className="flex justify-between mb-2">
              <span
                className={`text-xs font-semibold uppercase ${
                  i.categoria === "oportunidade"
                    ? "text-green-600"
                    : i.categoria === "dor"
                      ? "text-red-600"
                      : i.categoria === "risco"
                        ? "text-yellow-600"
                        : "text-purple-600"
                }`}
              >
                {i.categoria === "outros"
                  ? i.categoriaCustom || "Outros"
                  : i.categoria}
              </span>
              <span className="text-xs text-gray-400">
                {formatDateTime(i.criado_em)}
              </span>
            </div>

            {editingId === i._id ? (
              <div className="space-y-2">
                <textarea
                  value={editForm.descricao}
                  onChange={(e) =>
                    setEditForm({ ...editForm, descricao: e.target.value })
                  }
                  className="w-full border rounded p-2"
                />
                <select
                  value={editForm.categoria}
                  onChange={(e) =>
                    setEditForm({ ...editForm, categoria: e.target.value })
                  }
                  className="border rounded p-2"
                >
                  <option value="">Selecione...</option>
                  <option value="oportunidade">Oportunidade</option>
                  <option value="dor">Dor do Cliente</option>
                  <option value="risco">Risco</option>
                  <option value="maturidade">Maturidade</option>
                  <option value="outros">Outros</option>
                </select>
                {editForm.categoria === "outros" && (
                  <input
                    type="text"
                    placeholder="Digite a categoria"
                    value={editForm.outraCategoria}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        outraCategoria: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg px-2 py-1 text-sm mt-2"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(i._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-xs "
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-800 mb-1">{i.descricao}</p>
                <p className="text-xs text-gray-500 mb-2">
                  👤 Adicionado por {i.createdBy?.firstName}{" "}
                  {i.createdBy?.lastName}
                </p>

                <div className="flex gap-3">
                  {currentUser?.role === "admin" && (
                    <button
                      onClick={() => {
                        const confirmEdit = window.confirm(
                          "Deseja realmente editar este item?",
                        );
                        if (!confirmEdit) return;

                        setEditingId(i._id);
                        setEditForm({
                          descricao: i.descricao,
                          categoria: i.categoria,
                          outraCategoria: "",
                        });
                      }}
                      className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                  )}
                  {currentUser?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(i._id)}
                      className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Deletar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
