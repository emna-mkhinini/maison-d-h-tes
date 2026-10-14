export default function Loader({ texte = "Chargement..." }) {
  return (
    <div className="loader">
      <span className="spinner" />
      {texte}
    </div>
  );
}
