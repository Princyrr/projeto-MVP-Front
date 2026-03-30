import Sidebar from "./Sidebar";

export default function Layout({
  children,
  currentPage,
  onNavigate,
  user,
  onLogout,
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
