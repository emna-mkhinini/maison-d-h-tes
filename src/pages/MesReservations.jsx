import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, imageUrl } from "../api/client";
import Loader from "../components/Loader";

export const STATUTS = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
};

export default function MesReservations() {
  const [reservations, setReservations] = useState(null);
  const [erreur, setErreur] = useState("");

  function charger() {
    api.get("/reservations/mes").then(setReservations).catch((err) => setErreur(err.message));
  }

  useEffect(charger, []);

  async function annuler(id) {
    if (!window.confirm("Annuler cette réservation ?")) return;
    try {
      await api.patch(`/reservations/${id}/annuler`);
      // Mise à jour "immuable" du state : on crée un nouveau tableau
      setReservations((liste) =>
        liste.map((r) => (r.id === id ? { ...r, statut: "annulee" } : r))
      );
    } catch (err) {
      setErreur(err.message);
    }
  }

  if (!reservations && !erreur) return <Loader />;

  return (
    <section className="container section">
      <h1>Mes réservations</h1>
      {erreur && <p className="alert erreur">{erreur}</p>}

      {reservations?.length === 0 && (
        <p className="empty">
          Aucune réservation pour l'instant. <Link to="/maisons">Découvrir les maisons →</Link>
        </p>
      )}

      <div className="resa-list">
        {reservations?.map((r) => (
          <article key={r.id} className="resa-item">
            <img src={imageUrl(r.image_principale)} alt={r.maison} />
            <div className="resa-info">
              <h3><Link to={`/maisons/${r.slug}`}>{r.maison}</Link></h3>
              <p className="muted">📍 {r.ville} · {r.nb_personnes} pers.</p>
              <p>Du <strong>{r.date_arrivee}</strong> au <strong>{r.date_depart}</strong></p>
              <p className="price">{Number(r.prix_total)} TND</p>
            </div>
            <div className="resa-actions">
              <span className={`statut ${r.statut}`}>{STATUTS[r.statut]}</span>
              {r.statut !== "annulee" && (
                <button className="btn btn-ghost" onClick={() => annuler(r.id)}>Annuler</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
