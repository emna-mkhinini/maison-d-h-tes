import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Galerie from "../components/Galerie";
import ReservationForm from "../components/ReservationForm";
import Loader from "../components/Loader";

export default function MaisonDetail() {
  // useParams lit la partie dynamique de l'URL : /maisons/:slug
  const { slug } = useParams();
  const [maison, setMaison] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    setMaison(null);
    api.get(`/maisons/${slug}`).then(setMaison).catch((err) => setErreur(err.message));
  }, [slug]);

  if (erreur)
    return (
      <section className="container section">
        <p className="alert erreur">{erreur}</p>
        <Link to="/maisons">← Retour aux maisons</Link>
      </section>
    );
  if (!maison) return <Loader />;

  return (
    <section className="container section">
      <Link to={`/maisons?region=${maison.region_slug}`} className="back">
        ← {maison.region}
      </Link>
      <h1>{maison.nom}</h1>
      <p className="muted">📍 {maison.ville} · 👥 jusqu'à {maison.capacite} personnes · 📷 {maison.images.length} photos</p>

      <div className="detail-layout">
        <div>
          <Galerie images={maison.images} nom={maison.nom} />
          <h2>À propos</h2>
          <p className="description">{maison.description}</p>
        </div>
        {/* On passe la maison au formulaire via une prop */}
        <ReservationForm maison={maison} />
      </div>
    </section>
  );
}
