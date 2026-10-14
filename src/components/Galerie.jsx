// Galerie photo avec une image principale + miniatures cliquables.
// Exemple simple de state local : l'index de la photo affichée.
import { useState } from "react";
import { imageUrl } from "../api/client";

export default function Galerie({ images, nom }) {
  const [index, setIndex] = useState(0);

  if (!images?.length) return null;

  const precedente = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const suivante = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div className="galerie">
      <div className="galerie-main">
        <img src={imageUrl(images[index].url)} alt={`${nom} - photo ${index + 1}`} />
        <button className="galerie-nav left" onClick={precedente} aria-label="Photo précédente">‹</button>
        <button className="galerie-nav right" onClick={suivante} aria-label="Photo suivante">›</button>
        <span className="galerie-count">{index + 1} / {images.length}</span>
      </div>

      <div className="galerie-thumbs">
        {/* .map() transforme un tableau de données en tableau d'éléments JSX.
            "key" est obligatoire pour que React identifie chaque élément. */}
        {images.map((img, i) => (
          <button
            key={img.id}
            className={i === index ? "thumb active" : "thumb"}
            onClick={() => setIndex(i)}
          >
            <img src={imageUrl(img.url)} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
