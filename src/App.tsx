<<<<<<< HEAD
function App() {
  return (
    <div>
      <h1>Co-Parents</h1>
      <p>Site en ligne 🚀 — Build & rendu React OK ✅</p>
    </div>
  )
}

export default App
=======
import { Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"

// ✅ Pages principales
import Accueil from "./pages/Accueil"
import RendezVous from "./pages/RendezVous"
import Messages from "./pages/Messages"
import Photos from "./pages/Photos"
import Evenements from "./pages/Evenements"
import Invitations from "./pages/Invitations"
import Paiement from "./pages/Paiement"
import Settings from "./pages/Settings"

// ✅ Chat
import Chat from "./pages/Chat"
import Conversations from "./pages/Conversations"

// ✅ Auth
import Login from "./pages/Login"
import Register from "./pages/Register"

export default function App() {
  return (
    <Routes>
      {/* ✅ Toutes les pages protégées passent par Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/rendezvous" element={<RendezVous />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/evenements" element={<Evenements />} />
        <Route path="/invitations" element={<Invitations />} />
        <Route path="/paiement" element={<Paiement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/conversations" element={<Conversations />} />
      </Route>

      {/* ✅ Pages publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}
// test husky
>>>>>>> b56f4d0 (chore: setup husky + lint-staged (non blocking))
