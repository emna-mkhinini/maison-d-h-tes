// Liste des maisons + filtres.
// Les filtres sont stockés dans l'URL (?region=...&q=...) avec useSearchParams :
// on peut partager le lien ou utiliser le bouton "retour" du navigateur.
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import MaisonCard from "../components/MaisonCard";
import Loader from "../components/Loader";

export default function Maisons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [maisons, setMaisons] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const region = searchParams.get("region") || "";
  const q = searchParams.get("q") || "";
  const tri = searchParams.get("tri") || "";

  // Régions pour la liste déroulante (chargées une seule fois)
  useEffect(() => {
    api.get("/regions").then(setRegions).catch(() => {});
  }, []);

  // Recharge les maisons À CHAQUE changement de filtre
  // (les variables dans le tableau de dépendances déclenchent l'effet)
  useEffect(() => {
    setLoading(true);
    setErreur("");
    const query = new URLSearchParams({ region, q, tri }).toString();
    api
      .get(`/maisons?${query}`)
      .then(setMaisons)
      .catch((err) => setErreur(err.message))
      .finally(() => setLoading(false));
  }, [region, q, tri]);

  // Met à jour un filtre dans l'URL
  function setFiltre(nom, valeur) {
    const params = new URLSearchParams(searchParams);
    if (valeur) params.set(nom, valeur);
    else params.delete(nom);
    setSearchParams(params);
  }

  return (
    <section className="container section">
      <h1>Nos maisons d'hôtes</h1>

      <div className="filters">
        <input
          type="search"
          placeholder="Rechercher une maison ou une ville"
          value={q}
          onChange={(e) => setFiltre("q", e.target.value)}
        />
        <select value={region} onChange={(e) => setFiltre("region", e.target.value)}>
          <option value="">Toutes les régions</option>
          {regions.map((r) => (
            <option key={r.id} value={r.slug}>{r.nom}</option>
          ))}
        </select>
        <select value={tri} onChange={(e) => setFiltre("tri", e.target.value)}>
          <option value="">Trier par région</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix décroissant</option>
          <option value="nom">Nom (A → Z)</option>
        </select>
      </div>

      {erreur && <p className="alert erreur">{erreur}</p>}
      {loading ? (
        <Loader />
      ) : (
        <>
          <p className="muted">{maisons.length} maison(s) trouvée(s)</p>
          {maisons.length === 0 ? (
            <p className="empty">Aucune maison ne correspond à ta recherche.</p>
          ) : (
            <div className="grid">
              {maisons.map((m) => (
                <MaisonCard key={m.id} maison={m} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
