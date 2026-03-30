import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import SearchCompany from "./components/SearchCompany";
import CompanyDetails from "./components/CompanyDetails";
import Dashboard from "./components/Dashboard";
import EmpresasCadastradas from "./components/EmpresasCadastradas";
import Login from "./components/Login";
import bannerGif from "./assets/bannergif1.gif";
import { API_URL } from "./config";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );

  const [currentPage, setCurrentPage] = useState("home");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [registeredCompanies, setRegisteredCompanies] = useState([]);

  //  LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    fetch(`${API_URL}/companies`)
      .then((res) => res.json())
      .then((data) => setRegisteredCompanies(data));
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    if (page === "search") setError(null);
  };

  // 🔍 buscar empresa
  const handleSearch = async (cnpj) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.empresas.observatoriopb.com.br/api/empresas/cnpj/${cnpj}`,
      );

      if (!response.ok) {
        throw new Error("Empresa não encontrada");
      }

      const data = await response.json();
      setCompany(data);
      setCurrentPage("details");
    } catch (err) {
      setError(err.message);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (company) => {
    try {
      const response = await fetch(`${API_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          ...company,
          criado_por: user.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Empresa já cadastrada");
      }

      const data = await response.json();

      setRegisteredCompanies((prev) => [...prev, data]);
      setCurrentPage("registered");
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleAdvancedSearch = async (filters) => {
    setLoading(true);
    setError(null);

    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== null),
      );

      const query = new URLSearchParams(cleanFilters).toString();

      const response = await fetch(`${API_URL}/companies/search?${query}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar empresas");
      }

      const data = await response.json();

      setRegisteredCompanies(data);
      setCurrentPage("registered");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ atualizar empresa
  const handleUpdateCompany = async (updatedCompany) => {
    try {
      const response = await fetch(
        `${API_URL}/companies/${updatedCompany._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            status_prospeccao: updatedCompany.status_prospeccao,
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
            },
          }),
        },
      );

      if (!response.ok) throw new Error("Erro ao atualizar empresa");

      const data = await response.json();

      setRegisteredCompanies((prev) =>
        prev.map((emp) => (emp._id === data._id ? data : emp)),
      );

      setCompany(data);
      return data;
    } catch (err) {
      console.log(err.message);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Sistema de Consulta de Empresas
              </h1>
              <p className="text-xl text-gray-600">
                Consulte informações detalhadas de empresas por CNPJ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="bg-white rounded-xl p-8 text-center shadow-xl border-t-4 border-azulclaro">
                <h3 className="text-xl font-bold">Busca Rápida</h3>
                <p className="text-gray-600">
                  Encontre empresas rapidamente usando CNPJ
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center shadow-xl border-t-4 border-azulclaro">
                <h3 className="text-xl font-bold">Dados Completos</h3>
                <p className="text-gray-600">
                  Informações detalhadas da empresa
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 text-center shadow-xl border-t-4 border-azulclaro">
                <h3 className="text-xl font-bold">Dashboard</h3>
                <p className="text-gray-600">Estatísticas organizadas</p>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <img
                src={bannerGif}
                alt="Banner"
                className="w-full max-w-6xl rounded-lg"
              />
            </div>
          </div>
        );

      case "search":
        return (
          <SearchCompany
            onSearch={handleSearch}
            onAdvancedSearch={handleAdvancedSearch}
            loading={loading}
          />
        );
      case "details":
        return (
          <CompanyDetails
            company={company}
            onAddCompany={handleAddCompany}
            onUpdateCompany={handleUpdateCompany}
            empresas={registeredCompanies}
            currentUser={user}
          />
        );
      case "dashboard":
        return (
          <Dashboard
            company={company}
            registeredCompanies={registeredCompanies}
          />
        );
      case "registered":
        return (
          <EmpresasCadastradas
            empresas={registeredCompanies}
            onSelectCompany={(empresa) => {
              setCompany(empresa);
              setCurrentPage("details");
            }}
          />
        );
      default:
        return <SearchCompany onSearch={handleSearch} loading={loading} />;
    }
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
