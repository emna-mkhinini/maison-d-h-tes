import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Accueil from "./pages/Accueil";
import Maisons from "./pages/Maisons";
import MaisonDetail from "./pages/MaisonDetail";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import MesReservations from "./pages/MesReservations";
import Admin from "./pages/Admin";
import AdminMaisonForm from "./pages/AdminMaisonForm";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/maisons" element={<Maisons />} />
          <Route path="/maisons/:slug" element={<MaisonDetail />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />

          <Route
            path="/mes-reservations"
            element={<ProtectedRoute><MesReservations /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute admin><Admin /></ProtectedRoute>}
          />
          {/* Le même composant sert à ajouter ET à modifier */}
          <Route
            path="/admin/maisons/nouvelle"
            element={<ProtectedRoute admin><AdminMaisonForm /></ProtectedRoute>}
          />
          <Route
            path="/admin/maisons/:slug/modifier"
            element={<ProtectedRoute admin><AdminMaisonForm /></ProtectedRoute>}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}