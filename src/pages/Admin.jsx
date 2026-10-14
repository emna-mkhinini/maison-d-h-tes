// Tableau de bord admin : gérer les réservations et les maisons.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, imageUrl } from "../api/client";
import { STATUTS } from "./MesReservations";
import Loader from "../components/Loader";

export default function Admin() {
  // L'onglet actif est gardé dans l'URL (?onglet=maisons) pour pouvoir y revenir
  const [searchParams, setSearchParams] = useSearchParams();
  const onglet = searchParams.get("onglet") || "reservations";
  const setOnglet = (o) => setSearchParams({ onglet: o });

  return (
    <section className="container section">
      <h1>Administration</h1>
      <div className="tabs">
        <button className={onglet === "reservations" ? "active" : ""} onClick={() => setOnglet("reservations")}>
          Réservations
        </button>
        <button className={onglet === "maisons" ? "active" : ""} onClick={() => setOnglet("maisons")}>
          Maisons
        </button>
      </div>
      {onglet === "reservations" ? <AdminReservations /> : <AdminMaisons />}
    </section>
  );
}

// ---------- Onglet 1 : réservations ----------
function AdminReservations() {
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/reservations").then(setListe).catch((err) => setErreur(err.message));
  }, []);

  async function changerStatut(id, statut) {
    try {
      await api.patch(`/reservations/${id}/statut`, { statut });
      setListe((l) => l.map((r) => (r.id === id ? { ...r, statut } : r)));
    } catch (err) {
      setErreur(err.message);
    }
  }

  if (!liste && !erreur) return <Loader />;

  return (
    <>
      {erreur && <p className="alert erreur">{erreur}</p>}
      {liste?.length === 0 && <p className="empty">Aucune réservation.</p>}
      {liste?.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Client</th><th>Maison</th><th>Dates</th><th>Pers.</th><th>Total</th><th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {liste.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.client}<br /><small className="muted">{r.email}</small></td>
                  <td>{r.maison}</td>
                  <td>{r.date_arrivee} → {r.date_depart}</td>
                  <td>{r.nb_personnes}</td>
                  <td>{Number(r.prix_total)} TND</td>
                  <td>
                    <select value={r.statut} onChange={(e) => changerStatut(r.id, e.target.value)} className={`statut ${r.statut}`}>
                      {Object.entries(STATUTS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ---------- Onglet 2 : maisons (ajouter, modifier, supprimer) ----------
function AdminMaisons() {
  const [maisons, setMaisons] = useState(null);
  const [info, setInfo] = useState("");

  useEffect(() => {
    // tri=recent : les dernières maisons ajoutées en premier
    api.get("/maisons?tri=recent").then(setMaisons).catch((err) => setInfo(err.message));
  }, []);

  async function supprimer(m) {
    if (!window.confirm(`Supprimer définitivement ${m.nom} (et ses photos) ?`)) return;
    try {
      await api.delete(`/maisons/${m.id}`);
      setMaisons((l) => l.filter((x) => x.id !== m.id));
      setInfo(`${m.nom} supprimée`);
    } catch (err) {
      setInfo(err.message);
    }
  }

  if (!maisons) return <Loader />;

  return (
    <>
      <div className="admin-toolbar">
        <p className="muted">{maisons.length} maison(s)</p>
        <Link to="/admin/maisons/nouvelle" className="btn btn-primary">+ Ajouter une maison</Link>
      </div>
      {info && <p className="alert ok">{info}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th></th><th>Maison</th><th>Ville</th><th>Région</th><th>Prix / nuit</th><th>Pers.</th><th></th></tr>
          </thead>
          <tbody>
            {maisons.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.image_principale
                    ? <img className="table-thumb" src={imageUrl(m.image_principale)} alt="" />
                    : <div className="table-thumb" />}
                </td>
                <td><Link to={`/maisons/${m.slug}`}>{m.nom}</Link></td>
                <td>{m.ville}</td>
                <td>{m.region}</td>
                <td>{Number(m.prix_nuit)} TND</td>
                <td>{m.capacite}</td>
                <td className="actions">
                  <Link to={`/admin/maisons/${m.slug}/modifier`} className="btn btn-ghost btn-sm">Modifier</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => supprimer(m)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
