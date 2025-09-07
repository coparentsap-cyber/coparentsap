import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // ✅ Si pas connecté → redirige vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Sinon, affiche la page
  return children;
}
