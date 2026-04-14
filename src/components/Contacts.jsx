import { useState, useEffect } from "react";
import { User, Briefcase, Phone, Mail } from "lucide-react";
import { API_URL } from "../config";

function InfoCardEditable({ icon: Icon, title, field, form, setForm }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-azulclaro mt-1" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase mb-1">{title}</p>
          <input
            value={form[field] ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [field]: e.target.value }))
            }
            className="w-full border rounded-lg px-2 py-1 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default function Contacts({ cnpj, isRegistered }) {
  const [historico, setHistorico] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    cargo: "",
    telefone: "",
    email: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });

  useEffect(() => {
    if (!isRegistered || !cnpj) return;
    fetchContacts();
  }, [cnpj, isRegistered]);

  const fetchContacts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/companies/${cnpj}/contacts`);

      if (!res.ok) {
        console.warn("Erro na API:", res.status);
        setHistorico([]);
        return;
      }

      const data = await res.json();
      setHistorico(data || []);
    } catch (err) {
      console.warn("Erro silencioso:", err.message);
      setHistorico([]);
    } finally {
      setLoading(false);
    }
  };

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
        createdBy: {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
        },
      };

      let res;

      if (editingId) {
        res = await fetch(`${API_URL}/api/contacts/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/api/companies/${cnpj}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (editingId) {
        setHistorico((prev) =>
          prev.map((c) => (c._id === editingId ? data : c)),
        );
        setEditingId(null);
      } else {
        setHistorico([data, ...historico]);
      }

      setForm({
        nome: "",
        cargo: "",
        telefone: "",
        email: "",
      });

      setError("");
    } catch {
      setError("Erro ao salvar contato.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar este contato?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/contacts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao deletar");
      }

      setHistorico(historico.filter((c) => c._id !== id));
    } catch {
      setError("Erro ao deletar contato.");
    }
  };

  const handleEdit = (c) => {
    const confirmEdit = window.confirm("Deseja realmente editar este contato?");
    if (!confirmEdit) return;

    setEditingId(c._id);
    setForm({
      nome: c.nome || "",
      cargo: c.cargo || "",
      telefone: c.telefone || "",
      email: c.email || "",
    });
  };

  if (!isRegistered) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg mt-6">
        <p className="text-sm text-yellow-700">
          Adicione no Sistema a empresa para adicionar contato
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-10">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-emerald-600" />
        Contatos
      </h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl p-4"
      >
        <InfoCardEditable
          icon={User}
          title="Nome"
          field="nome"
          form={form}
          setForm={setForm}
        />
        <InfoCardEditable
          icon={Briefcase}
          title="Cargo"
          field="cargo"
          form={form}
          setForm={setForm}
        />
        <InfoCardEditable
          icon={Phone}
          title="Telefone"
          field="telefone"
          form={form}
          setForm={setForm}
        />
        <InfoCardEditable
          icon={Mail}
          title="Email"
          field="email"
          form={form}
          setForm={setForm}
        />

        <div className="md:col-span-2 flex justify-end mt-3">
          <button className="bg-azulclaro hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
            {loading ? "Salvando..." : editingId ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </form>

      {/* LISTA */}
      <div className="space-y-3 mt-6 mb-20">
        {historico.map((c) => (
          <div
            key={c._id}
            className="bg-blue-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-gray-600">
                Contato da empresa
              </span>

              <span className="text-xs text-gray-400">
                {formatDateTime(c.createdAt || c.criado_em)}
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-800">{c.nome}</p>
            <p className="text-xs text-gray-600">Cargo: {c.cargo}</p>
            <p className="text-xs text-gray-600">📞 {c.telefone}</p>
            <p className="text-xs text-gray-600">✉️ {c.email}</p>

            <p className="text-xs text-gray-500 mt-2">
              👤 {c.createdBy?.firstName} {c.createdBy?.lastName}
            </p>

            <div className="flex gap-2 mt-2">
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => handleEdit(c)}
                  className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
              )}
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
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
