export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          <strong>Diar & Tunisie </strong> — Maisons d'hôtes en Tunisie
        </p>
        <p className="muted">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
