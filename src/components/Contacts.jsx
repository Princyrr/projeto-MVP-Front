import { useState, useEffect } from "react";
import { User, Briefcase, Phone, Mail } from "lucide-react";
import { API_URL } from "../config";

export default function Contacts({ cnpj, isRegistered }) {
  const [contacts, setContacts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    cargo: "",
    telefone: "",
    email: "",
  });

  const formatDateTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  useEffect(() => {
    if (!isRegistered) return;

    fetch(`${API_URL}/api/companies/${cnpj}/contacts`)
      .then((res) => res.json())
      .then((data) => setContacts(data));
  }, [cnpj, isRegistered]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (editingId) {
      const res = await fetch(`${API_URL}/api/contacts/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId: user._id,
        }),
      });

      const updated = await res.json();
      setContacts(contacts.map((c) => (c._id === editingId ? updated : c)));
      setEditingId(null);
    } else {
      const res = await fetch(`${API_URL}/api/companies/${cnpj}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          createdBy: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        }),
      });

      const newContact = await res.json();
      setContacts([...contacts, newContact]);
    }

    setForm({
      nome: "",
      cargo: "",
      telefone: "",
      email: "",
    });
  };

  const handleDelete = async (id) => {
    const user = JSON.parse(localStorage.getItem("user"));

    await fetch(`${API_URL}/api/contacts/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id }),
    });

    setContacts(contacts.filter((c) => c._id !== id));
  };

  const handleEdit = (contact) => {
    setForm({
      nome: contact.nome || "",
      cargo: contact.cargo || "",
      telefone: contact.telefone || "",
      email: contact.email || "",
    });

    setEditingId(contact._id);
  };

  const InfoCardEditable = ({ icon: Icon, title, field }) => {
    const [inputValue, setInputValue] = useState(form[field] || "");

    useEffect(() => {
      setInputValue(form[field] || "");
    }, [form[field]]);

    const handleBlur = () => {
      setForm((prev) => ({ ...prev, [field]: inputValue }));
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon className="w-5 h-5 text-azulclaro mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              {title}
            </p>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
    );
  };

  if (!isRegistered) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-700">
          Adicione no Sistema a empresa para adicionar o Contato
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-emerald-600" />
        Contatos
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white  p-4 "
      >
        <InfoCardEditable icon={User} title="Nome" field="nome" />
        <InfoCardEditable icon={Briefcase} title="Cargo" field="cargo" />
        <InfoCardEditable icon={Phone} title="Telefone" field="telefone" />
        <InfoCardEditable icon={Mail} title="Email" field="email" />

        <div className="col-span-1 md:col-span-2 flex justify-end">
          <button className="bg-azulclaro hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
            {editingId ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </form>

      {/* 🔥 LISTA */}
      <ul className="space-y-3 mb-20">
        {contacts.map((c) => (
          <li
            key={c._id}
            className="bg-blue-50 border rounded-lg p-4 shadow-sm"
          >
            <p className="text-xs text-gray-400 mt-2">
              {formatDateTime(c.updatedAt || c.createdAt)}
            </p>
            <p className="font-semibold text-gray-900">{c.nome}</p>
            <p className="text-sm text-gray-600">Cargo: {c.cargo}</p>

            <div className="text-sm mt-2 space-y-1">
              <p>📞 {c.telefone}</p>
              <p>✉️ {c.email}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Adicionado por {c.createdBy?.firstName} {c.createdBy?.lastName}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(c)}
                className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(c._id)}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Deletar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
