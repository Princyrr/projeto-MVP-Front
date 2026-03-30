import { Search, Home, BarChart3, Building2, LogOut } from "lucide-react";
import Logo from "../assets/logoazul.png";
import Gif from "../assets/gif1.gif";

export default function Sidebar({ currentPage, onNavigate, user, onLogout }) {
  const menuItems = [
    { id: "home", icon: Home, label: "Início" },
    { id: "search", icon: Search, label: "Buscar Empresa" },
    { id: "dashboard", icon: BarChart3, label: "Dashboard" },
    { id: "registered", icon: Building2, label: "Empresas" },
  ];

  return (
    <div className="w-64 h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-r border-slate-800 shadow-xl">
      {/* LOGO */}
      <div className="p-6 flex flex-col items-center border-b border-slate-800/60">
        <img src={Logo} alt="Logo" className="w-40 mb-2" />
      </div>

      <div className="px-4 mt-5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-azulclaro flex items-center justify-center font-semibold text-white">
            {user?.firstName ? user.firstName.charAt(0) : "?"}
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              {user?.firstName || "Usuário"}
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 mt-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    relative w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300
                    group
                    ${
                      isActive
                        ? "bg-white/10 text-white shadow-md"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-azulclaro"></span>
                  )}

                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? "text-azulclaro" : "group-hover:scale-110"
                    }`}
                  />

                  <span className="text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 mb-4">
        <div className="rounded-2xl p-4 bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center">
          <img src={Gif} alt="gif" className="w-16 opacity-90" />
        </div>
      </div>

      {/* LOGOUT */}
      <div className="px-4 mb-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 transition group"
        >
          <LogOut size={16} className="group-hover:text-red-400" />
          <span className="text-sm group-hover:text-red-400">Sair</span>
        </button>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-800/60 text-center">
        <p className="text-xs font-semibold text-slate-400">Observatório PB</p>
        <p className="text-[10px] text-slate-500 mt-1">Campina Grande</p>
      </div>
    </div>
  );
}
