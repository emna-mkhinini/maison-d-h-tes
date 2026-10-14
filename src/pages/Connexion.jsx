import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Connexion() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");
    try {
      await login(email, motDePasse);
      // Retour à la page demandée avant la connexion (ou l'accueil)
      navigate(location.state?.from || "/");
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <section className="container section auth">
      <form className="form card-form" onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        {erreur && <p className="alert erreur">{erreur}</p>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mot de passe
          <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
        </label>
        <button className="btn btn-primary">Se connecter</button>
        <p className="muted">
          Pas de compte ? <Link to="/inscription">Inscris-toi</Link>
        </p>
       
      </form>
    </section>
  );
}
