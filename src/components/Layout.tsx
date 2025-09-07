import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { user } = useAuth();

  // ✅ Redirection auto si pas connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-light">
      {/* ✅ Header mobile */}
      <MobileHeader />

      <div className="flex flex-1">
        {/* ✅ Sidebar desktop */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>

        {/* ✅ Contenu principal */}
        <div className="flex-1 flex flex-col lg:ml-60">
          <main className="flex-1 p-4">
            <Outlet />
          </main>

          {/* ✅ Navigation mobile en bas */}
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
