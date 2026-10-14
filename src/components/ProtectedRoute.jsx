// Protège une page : redirige vers /connexion si on n'est pas connecté,
// ou vers l'accueil si la page est réservée à l'admin.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user) {
    // On mémorise la page demandée pour y revenir après la connexion
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }

  if (admin && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
