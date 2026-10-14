import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Inscription() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: "", email: "", mot_de_passe: "", confirmation: "" });
  const [erreur, setErreur] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur("");

    // Validation côté client (rapide pour l'utilisateur)...
    if (form.mot_de_passe !== form.confirmation) {
      return setErreur("Les mots de passe ne correspondent pas");
    }
    // ...mais le serveur revalide toujours (on ne fait jamais confiance au client)
    try {
      await register(form.nom, form.email, form.mot_de_passe);
      navigate("/maisons");
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <section className="container section auth">
      <form className="form card-form" onSubmit={handleSubmit}>
        <h1>Créer un compte</h1>
        {erreur && <p className="alert erreur">{erreur}</p>}
        <label>
          Nom complet
          <input name="nom" value={form.nom} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Mot de passe (6 caractères min.)
          <input type="password" name="mot_de_passe" minLength={6} value={form.mot_de_passe} onChange={handleChange} required />
        </label>
        <label>
          Confirmer le mot de passe
          <input type="password" name="confirmation" value={form.confirmation} onChange={handleChange} required />
        </label>
        <button className="btn btn-primary">S'inscrire</button>
        <p className="muted">
          Déjà inscrit ? <Link to="/connexion">Connecte-toi</Link>
        </p>
      </form>
    </section>
  );
}
