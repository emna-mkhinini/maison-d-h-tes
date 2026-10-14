// ------------------------------------------------------------
// Toutes les communications avec le serveur Node passent par ici.
// fetch() envoie une requête HTTP et renvoie une Promise.
// ------------------------------------------------------------

// Construit l'URL d'une photo stockée sur le serveur
export const imageUrl = (chemin) => `/uploads/maisons/${chemin}`;

async function request(url, { method = "GET", body } = {}) {
  const headers = {};

  // FormData = formulaire avec des fichiers (photos). Dans ce cas on laisse
  // le navigateur mettre lui-même le bon Content-Type (multipart/form-data).
  // Sinon on envoie du JSON.
  const estFormData = body instanceof FormData;
  if (body && !estFormData) headers["Content-Type"] = "application/json";

  // Si l'utilisateur est connecté, on ajoute son token JWT
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${url}`, {
    method,
    headers,
    body: body ? (estFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  // res.ok = statut entre 200 et 299. Sinon on lance une erreur
  // avec le message envoyé par le serveur.
  if (!res.ok) throw new Error(data.message || "Erreur serveur");
  return data;
}

// Raccourcis lisibles utilisés dans les composants
export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: "POST", body }),
  put: (url, body) => request(url, { method: "PUT", body }),
  patch: (url, body) => request(url, { method: "PATCH", body }),
  delete: (url) => request(url, { method: "DELETE" }),
};
