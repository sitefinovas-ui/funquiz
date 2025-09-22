import Header from "../Header/header.jsx";
import Footer from "../Footer/footer.jsx";
import ListThematic from "../list-thematic/listThematic.jsx";
import { Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [activePopup, setActivePopup] = useState(null);

  const closePopup = () => setActivePopup(null);

  // Objet pour mapper l'id à son composant
  const popupComponents = {
    thematic: <ListThematic closePopup={closePopup} />,
  };

  return (
    <div className="bg-custom-app">
      <Header openPopup={setActivePopup} />
      <main>
        <Outlet />
      </main>
      <Footer />

      {/* Rendu dynamique du pop-up actif */}
      {activePopup && popupComponents[activePopup]}
    </div>
  );
}
