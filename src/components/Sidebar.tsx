import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Accueil", icon: "🏠" },
    { to: "/rendezvous", label: "Rendez-vous", icon: "📅" },
    { to: "/messages", label: "Messages", icon: "💬" },
    { to: "/photos", label: "Photos", icon: "🖼️" },
    { to: "/evenements", label: "Événements", icon: "📌" },
    { to: "/invitations", label: "Invitations", icon: "✉️" },
    { to: "/paiement", label: "Paiement", icon: "💳" },
    { to: "/settings", label: "Paramètres", icon: "⚙️" },
  ];

  return (
    <aside
      className={`${
        isOpen ? "block" : "hidden"
      } lg:block w-60 bg-gray-50 border-r p-4 fixed lg:static h-full z-50`}
    >
      <h2 className="text-xl font-bold mb-6">Co-Parents</h2>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
              pathname === link.to
                ? "text-blue-600 font-bold bg-blue-50"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
