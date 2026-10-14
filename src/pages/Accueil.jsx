import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, imageUrl } from "../api/client";
import Loader from "../components/Loader";

export default function Accueil() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const navigate = useNavigate();

  // useEffect : on charge les régions depuis l'API quand la page s'affiche
  useEffect(() => {
    api
      .get("/regions")
      .then(setRegions)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/maisons?q=${encodeURIComponent(recherche)}`);
  }

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${imageUrl("dar-said/1.jpg")})` }}>
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="eyebrow">Maisons d'hôtes en Tunisie</p>
          <h1>De la médina au désert, dormez dans une vraie dar.</h1>
          <form className="search" onSubmit={handleSearch}>
            <input
              placeholder="Une ville, une maison… (Tozeur, Sidi Bou Saïd)"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            <button className="btn btn-primary">Rechercher</button>
          </form>
        </div>
      </section>

      <section className="container section">
        <h2>Explorer par région</h2>
        {loading && <Loader />}
        {erreur && <p className="alert erreur">{erreur}</p>}

        <div className="regions-grid">
          {regions.map((r) => (
            <Link key={r.id} to={`/maisons?region=${r.slug}`} className="region-card">
              {r.image && <img src={imageUrl(r.image)} alt={r.nom} loading="lazy" />}
              <div className="region-info">
                <h3>{r.nom}</h3>
                <p>{r.description}</p>
                <span className="pill">{r.nb_maisons} maison{r.nb_maisons > 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
