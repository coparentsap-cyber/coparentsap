import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import SideMenu from "./components/Layout/SideMenu";
import BottomNav from "./components/Layout/BottomNav";
import Header from "./components/Layout/Header";

import LandingPage from "./components/Landing/LandingPage";
import MessagesView from "./components/Messages/MessagesView";
import PlanningView from "./components/Planning/PlanningView";
import PhotosView from "./components/Photos/PhotosView";
import DocumentsView from "./components/Documents/DocumentsView";
import SettingsView from "./components/Settings/SettingsView";
import SubscriptionView from "./components/Subscription/SubscriptionView";
import NotificationsView from "./components/Notifications/NotificationsView";
import JournalView from "./components/Journal/JournalView";
import RDVView from "./components/RDV/RDVView";
import EnfantsView from "./components/Enfants/EnfantsView";
import DepensesView from "./components/Depenses/DepensesView";
import ContactView from "./components/Contact/ContactView";
import HelpView from "./components/Help/HelpView";
import PollsView from "./components/Polls/PollsView";
import ProfileView from "./components/Profile/ProfileView";

import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <SideMenu isOpen={true} onClose={() => {}} onNavigate={() => {}} />
        </div>

        {/* Menu burger (Mobile) */}
        <Header onOpenMenu={() => setIsMenuOpen(true)} />
        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={() => setIsMenuOpen(false)}
        />

        {/* Contenu principal */}
        <main className="flex-1 p-4 mt-12 lg:mt-0 lg:ml-60">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/messages" element={<MessagesView />} />
            <Route path="/planning" element={<PlanningView />} />
            <Route path="/photos" element={<PhotosView />} />
            <Route path="/documents" element={<DocumentsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/abonnement" element={<SubscriptionView />} />
            <Route path="/notifications" element={<NotificationsView />} />
            <Route path="/journal" element={<JournalView />} />
            <Route path="/rdv" element={<RDVView />} />
            <Route path="/enfants" element={<EnfantsView />} />
            <Route path="/depenses" element={<DepensesView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/help" element={<HelpView />} />
            <Route path="/polls" element={<PollsView />} />
            <Route path="/profil" element={<ProfileView />} />
          </Routes>
        </main>

        {/* Bottom navigation (Mobile uniquement) */}
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
