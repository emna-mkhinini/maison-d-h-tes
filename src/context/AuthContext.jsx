// ------------------------------------------------------------
// Context = un "état global" partagé par tous les composants.
// Ici : l'utilisateur connecté. Sans Context, il faudrait passer
// "user" de parent en enfant à travers toute l'application (prop drilling).
// ------------------------------------------------------------
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app : si un token existe, on récupère l'utilisateur
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(setUser)
      .catch(() => localStorage.removeItem("token")) // token expiré
      .finally(() => setLoading(false));
  }, []); // [] = exécuté une seule fois, au montage

  async function login(email, mot_de_passe) {
    const data = await api.post("/auth/login", { email, mot_de_passe });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  async function register(nom, email, mot_de_passe) {
    const data = await api.post("/auth/register", { nom, email, mot_de_passe });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé : dans un composant on écrit  const { user } = useAuth();
export const useAuth = () => useContext(AuthContext);
