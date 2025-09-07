import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "./SideMenu";
import BottomNav from "./BottomNav";
import Header from "./Header";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-light dark:bg-gray-900">
      {/* ✅ Header mobile */}
      <Header onOpenMenu={() => setIsMenuOpen(true)} />

      <div className="flex flex-1">
        {/* ✅ Sidebar desktop */}
        <div className="hidden lg:block w-60 border-r bg-white dark:bg-gray-800">
          <SideMenu isOpen={true} onClose={() => {}} onNavigate={() => {}} />
        </div>

        {/* ✅ Menu burger mobile */}
        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={() => setIsMenuOpen(false)}
        />

        {/* ✅ Contenu principal */}
        <main className="flex-1 p-4 mt-12 lg:mt-0 lg:ml-60">
          <Outlet />
        </main>
      </div>

      {/* ✅ Navigation mobile en bas */}
      <BottomNav />
    </div>
  );
}
