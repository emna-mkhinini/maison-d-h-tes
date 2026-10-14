// Composant réutilisable : reçoit une maison via les "props"
// et l'affiche sous forme de carte.
import { Link } from "react-router-dom";
import { imageUrl } from "../api/client";

export default function MaisonCard({ maison }) {
  return (
    <Link to={`/maisons/${maison.slug}`} className="card">
      <div className="card-img">
        <img src={imageUrl(maison.image_principale)} alt={maison.nom} loading="lazy" />
        <span className="badge">{maison.region}</span>
      </div>
      <div className="card-body">
        <h3>{maison.nom}</h3>
        <p className="muted">📍 {maison.ville} · 👥 {maison.capacite} pers.</p>
        <p className="price">
          {Number(maison.prix_nuit)} TND <span>/ nuit</span>
        </p>
      </div>
    </Link>
  );
}
