import { Outlet, useLocation } from 'react-router-dom';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';

import Header from '../Header/header.jsx';
import Footer from '../Footer/footer.jsx';
import Wel from '../Infos/Info.jsx';
import Cookie from '../Cookie/cookie.jsx';
import ListThematic from '../list-thematic/listThematic.jsx';
import DeleteUser from '../DeleteUser/delete-user.jsx';
import Opinion from '../Opinion/opinion.jsx';
import Import from '../ImportUser/import-user.jsx';
import Result from '../Result/result.jsx';
import { useEffect } from 'react';
// Ajout import du popup
import AddNumber from '../AddNumber/add-number.jsx';

export default function Layout() {
  const { activePopup, setActivePopup, closePopup, popupPayload } = usePopup();
  const location = useLocation();

  // Liste des routes où Header/Footer ne doivent pas s'afficher
  const noHeaderFooterRoutes = ['/login', '/sign-up', '/reset'];

  // Vérifie si la route actuelle commence par l'une des routes à cacher
  const shouldHideHeaderFooter = noHeaderFooterRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  // Popups dynamiques
  const popupComponents = {
    thematic: <ListThematic closePopup={closePopup} highlightThematicId={popupPayload?.highlightThematicId} />,
    deleteUser: <DeleteUser closePopup={closePopup} />,
    opinion: <Opinion closePopup={closePopup} />,
    result: <Result closePopup={closePopup} />,
    importUser: <Import closePopup={closePopup} />,
    // Ajout: popup d’ajout de numéro
    addNumber: <AddNumber closePopup={closePopup} />,
  };

  useEffect(() => {
      const savedBg = localStorage.getItem('public.site.bg');
      const savedAccent = localStorage.getItem('public.site.accent');
      const savedText = localStorage.getItem('public.site.text');
      const savedTextMuted = localStorage.getItem('public.site.textMuted');
      const savedLink = localStorage.getItem('public.site.link');

      if (savedBg) {
          document.documentElement.style.setProperty('--site-bg', savedBg);
      }
      if (savedAccent) {
          document.documentElement.style.setProperty('--site-accent', savedAccent);
      }
      if (savedText) {
          document.documentElement.style.setProperty('--site-text', savedText);
      }
      if (savedTextMuted) {
          document.documentElement.style.setProperty('--site-text-muted', savedTextMuted);
      }
      if (savedLink) {
          document.documentElement.style.setProperty('--site-link', savedLink);
      }
  }, []);
  return (
    <div className="bg-custom-app">

      {/* Header */}
      {!shouldHideHeaderFooter && <Header openPopup={setActivePopup} />}

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Informations et Footer */}
      {!shouldHideHeaderFooter && <Wel />}
      {!shouldHideHeaderFooter && <Cookie />}
      {!shouldHideHeaderFooter && <Footer openPopup={setActivePopup} />}

      {/* Popups dynamiques */}
      {activePopup && popupComponents[activePopup]}

      {/* Boutons rapides thème (public) */}
      {/* Visible sur toutes les pages publiques, pas chargé dans le backoffice */}
    </div>
  );
}
