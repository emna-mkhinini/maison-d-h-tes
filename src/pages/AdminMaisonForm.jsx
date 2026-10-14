// ------------------------------------------------------------
// Formulaire admin : AJOUTER ou MODIFIER une maison.
// Le même composant sert pour les deux routes :
//   /admin/maisons/nouvelle          -> mode "ajout"
//   /admin/maisons/:slug/modifier    -> mode "modification"
// On sait dans quel mode on est grâce à la présence de :slug.
// ------------------------------------------------------------
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, imageUrl } from "../api/client";
import Loader from "../components/Loader";

const VIDE = { nom: "", ville: "", region_id: "", prix_nuit: "", capacite: 2, description: "" };

export default function AdminMaisonForm() {
  const { slug } = useParams();
  const modeModif = Boolean(slug);
  const navigate = useNavigate();

  const [form, setForm] = useState(VIDE);
  const [regions, setRegions] = useState([]);
  const [maison, setMaison] = useState(null);       // la maison chargée (mode modif)
  const [nouvellesPhotos, setNouvellesPhotos] = useState([]); // fichiers choisis (File[])
  const [loading, setLoading] = useState(modeModif);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);

  // Charger les régions (pour la liste déroulante)
  useEffect(() => {
    api.get("/regions").then(setRegions).catch(() => {});
  }, []);

  // En mode modification : charger la maison et pré-remplir le formulaire
  useEffect(() => {
    if (!modeModif) return;
    api
      .get(`/maisons/${slug}`)
      .then((m) => {
        setMaison(m);
        setForm({
          nom: m.nom,
          ville: m.ville,
          region_id: m.region_id,
          prix_nuit: Number(m.prix_nuit),
          capacite: m.capacite,
          description: m.description || "",
        });
      })
      .catch((err) => setMessage({ type: "erreur", texte: err.message }))
      .finally(() => setLoading(false));
  }, [slug, modeModif]);

  // Aperçus des photos choisies. URL.createObjectURL crée une adresse
  // temporaire pour afficher un fichier local avant de l'envoyer.
  const [apercus, setApercus] = useState([]);
  useEffect(() => {
    const urls = nouvellesPhotos.map((f) => URL.createObjectURL(f));
    setApercus(urls);
    // "cleanup" : libère la mémoire quand les photos changent ou que la page se ferme
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [nouvellesPhotos]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function handleFiles(e) {
    // e.target.files est une FileList -> on la transforme en tableau
    setNouvellesPhotos([...nouvellesPhotos, ...Array.from(e.target.files)]);
    e.target.value = ""; // permet de re-choisir le même fichier
  }

  const retirerPhoto = (index) =>
    setNouvellesPhotos(nouvellesPhotos.filter((_, i) => i !== index));

  // ---------- Envoi du formulaire ----------
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setEnvoi(true);

    try {
      if (!modeModif) {
        // AJOUT : on envoie les champs + les photos ensemble dans un FormData
        if (nouvellesPhotos.length === 0) throw new Error("Ajoute au moins une photo");
        const data = new FormData();
        Object.entries(form).forEach(([cle, valeur]) => data.append(cle, valeur));
        nouvellesPhotos.forEach((f) => data.append("images", f));

        const res = await api.post("/maisons", data);
        navigate(`/maisons/${res.slug}`); // on va voir la maison créée
      } else {
        // MODIFICATION : 1) les infos en JSON
        await api.put(`/maisons/${maison.id}`, form);
        setMaison((m) => ({ ...m, nom: form.nom })); // met à jour le titre de la page

        // 2) les nouvelles photos (s'il y en a)
        if (nouvellesPhotos.length > 0) {
          const data = new FormData();
          nouvellesPhotos.forEach((f) => data.append("images", f));
          const images = await api.post(`/maisons/${maison.id}/images`, data);
          setMaison((m) => ({ ...m, images, image_principale: m.image_principale || images[0]?.url }));
          setNouvellesPhotos([]);
        }
        setMessage({ type: "ok", texte: "Modifications enregistrées ✔" });
      }
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    } finally {
      setEnvoi(false);
    }
  }

  // ---------- Actions sur les photos existantes (mode modif) ----------
  async function supprimerImage(img) {
    if (!window.confirm("Supprimer cette photo ?")) return;
    try {
      await api.delete(`/maisons/${maison.id}/images/${img.id}`);
      const reste = maison.images.filter((i) => i.id !== img.id);
      setMaison({
        ...maison,
        images: reste,
        image_principale:
          maison.image_principale === img.url ? reste[0]?.url || null : maison.image_principale,
      });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    }
  }

  async function choisirPrincipale(img) {
    try {
      await api.patch(`/maisons/${maison.id}/principale`, { url: img.url });
      setMaison({ ...maison, image_principale: img.url });
    } catch (err) {
      setMessage({ type: "erreur", texte: err.message });
    }
  }

  if (loading) return <Loader />;

  return (
    <section className="container section">
      <Link to="/admin?onglet=maisons" className="back">← Retour à l'administration</Link>
      <h1>{modeModif ? `Modifier « ${maison?.nom} »` : "Ajouter une maison"}</h1>

      <form className="form admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Nom de la maison *
            <input name="nom" value={form.nom} onChange={handleChange} required />
          </label>
          <label>
            Ville *
            <input name="ville" value={form.ville} onChange={handleChange} required />
          </label>
          <label>
            Région *
            <select name="region_id" value={form.region_id} onChange={handleChange} required>
              <option value="">— Choisir —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.nom}</option>
              ))}
            </select>
          </label>
          <label>
            Prix par nuit (TND) *
            <input type="number" name="prix_nuit" min="1" step="0.01" value={form.prix_nuit} onChange={handleChange} required />
          </label>
          <label>
            Capacité (personnes) *
            <input type="number" name="capacite" min="1" value={form.capacite} onChange={handleChange} required />
          </label>
        </div>

        <label>
          Description
          <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
        </label>

        {/* Photos déjà enregistrées (mode modification) */}
        {modeModif && (
          <div>
            <h3>Photos actuelles ({maison.images.length})</h3>
            {maison.images.length === 0 && <p className="muted">Aucune photo.</p>}
            <div className="photos-grid">
              {maison.images.map((img) => (
                <div key={img.id} className={`photo ${img.url === maison.image_principale ? "principale" : ""}`}>
                  <img src={imageUrl(img.url)} alt="" />
                  {img.url === maison.image_principale ? (
                    <span className="photo-tag">★ Couverture</span>
                  ) : (
                    <button type="button" className="photo-btn" onClick={() => choisirPrincipale(img)}>
                      ★ Couverture
                    </button>
                  )}
                  <button type="button" className="photo-del" onClick={() => supprimerImage(img)} aria-label="Supprimer">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nouvelles photos à envoyer */}
        <div>
          <h3>{modeModif ? "Ajouter des photos" : "Photos *"}</h3>
          <label className="file-drop">
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} />
            📷 Choisir des photos (JPG, PNG, WEBP — 5 Mo max)
          </label>
          {apercus.length > 0 && (
            <div className="photos-grid">
              {apercus.map((src, i) => (
                <div key={src} className="photo">
                  <img src={src} alt="" />
                  {!modeModif && i === 0 && <span className="photo-tag">★ Couverture</span>}
                  <button type="button" className="photo-del" onClick={() => retirerPhoto(i)} aria-label="Retirer">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && <p className={`alert ${message.type}`}>{message.texte}</p>}

        <div className="form-actions">
          <button className="btn btn-primary" disabled={envoi}>
            {envoi ? "Enregistrement..." : modeModif ? "Enregistrer les modifications" : "Ajouter la maison"}
          </button>
          {modeModif && (
            <Link to={`/maisons/${maison.slug}`} className="btn btn-ghost">Voir la page</Link>
          )}
        </div>
      </form>
    </section>
  );
}
