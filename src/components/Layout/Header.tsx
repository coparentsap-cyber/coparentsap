import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  onOpenMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between px-4 py-2 z-50">
      <h1 className="text-lg font-bold text-gray-800">Co-Parents</h1>
      <button
        onClick={onOpenMenu}
        className="p-2 rounded-lg hover:bg-gray-100"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
    </header>
  );
};

export default Header;
