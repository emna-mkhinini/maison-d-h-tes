// Formulaire "contrôlé" : chaque champ est lié à une variable de state.
// React est la seule source de vérité pour la valeur des inputs.
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const aujourdhui = () => new Date().toISOString().slice(0, 10);

export default function ReservationForm({ maison }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ date_arrivee: "", date_depart: "", nb_personnes: 2 });
  const [message, setMessage] = useState(null); // { type: "ok" | "erreur", texte }
  const [envoi, setEnvoi] = useState(false);

  // Une seule fonction pour tous les champs grâce à l'attribut "name"
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Valeur "dérivée" : calculée à partir du state, pas besoin d'un autre useState
  const nuits =
    form.date_arrivee && form.date_depart
      ? Math.round((new Date(form.date_depart) - new Date(form.date_arrivee)) / 86400000)
      : 0;
  const total = nuits > 0 ? nuits * Number(maison.prix_nuit) : 0;

  async function handleSubmit(e) {
    e.preventDefault(); // empêche le rechargement de la page
    setMessage(null);
    setEnvoi(true);
    try {
      const res = await api.post("/reservations", {
        maison_id: maison.id,
        ...form,
        nb_personnes: Number(form.nb_personnes),
      });
      setMessage({ type: "ok", texte: `Demande envoyée ! ${res.nuits} nuit(s) · ${res.prix_total} TND` });
      setForm({ date_arrivee: "", date_depart: "", nb_personnes: 2 });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <aside className="resa-box">
      <p className="price big">
        {Number(maison.prix_nuit)} TND <span>/ nuit</span>
      </p>

      {!user ? (
        <p>
          <Link to="/connexion" state={{ from: `/maisons/${maison.slug}` }}>Connecte-toi</Link> pour réserver.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <label>
            Arrivée
            <input type="date" name="date_arrivee" min={aujourdhui()} value={form.date_arrivee} onChange={handleChange} required />
          </label>
          <label>
            Départ
            <input type="date" name="date_depart" min={form.date_arrivee || aujourdhui()} value={form.date_depart} onChange={handleChange} required />
          </label>
          <label>
            Personnes (max {maison.capacite})
            <input type="number" name="nb_personnes" min="1" max={maison.capacite} value={form.nb_personnes} onChange={handleChange} required />
          </label>

          {nuits > 0 && (
            <p className="total">
              {nuits} nuit(s) × {Number(maison.prix_nuit)} TND = <strong>{total} TND</strong>
            </p>
          )}

          <button className="btn btn-primary" disabled={envoi}>
            {envoi ? "Envoi..." : "Réserver"}
          </button>
        </form>
      )}

      {message && <p className={`alert ${message.type}`}>{message.texte}</p>}
    </aside>
  );
}
