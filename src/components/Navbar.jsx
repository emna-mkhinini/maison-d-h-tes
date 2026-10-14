import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          Diar <span>&</span> Tunisie
        </Link>

        <nav className="nav-links">
          {/* NavLink ajoute la classe "active" sur le lien de la page courante */}
          <NavLink to="/maisons">Maisons</NavLink>

          {/* Rendu conditionnel : on affiche des liens différents selon l'état */}
          {user ? (
            <>
              <NavLink to="/mes-reservations">Mes réservations</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
              <span className="nav-user">Ahla, {user.nom.split(" ")[0]}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/connexion">Connexion</NavLink>
              <Link to="/inscription" className="btn btn-primary">
                S'inscrire
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
