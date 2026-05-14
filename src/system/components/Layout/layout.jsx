import { Outlet, useLocation } from 'react-router-dom';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';
import { useAuth } from '../../configurations/Context/AuthProvider.jsx';

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
  const { user } = useAuth();
  const location = useLocation();

  // Liste des routes où Header/Footer ne doivent pas s'afficher
  const noHeaderFooterRoutes = ['/login', '/sign-up', '/reset', '/dashboard'];

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
      // 1. Charger les préférences de l'utilisateur si connectére
      let prefs = null;
      if (user?.preferences) {
        prefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
      } else {
        const saved = localStorage.getItem('profile.prefs.v1');
        if (saved) prefs = JSON.parse(saved);
      }

      const savedBg = localStorage.getItem('public.site.bg');
      const savedAccent = localStorage.getItem('public.site.accent');
      const savedText = localStorage.getItem('public.site.text');
      const savedTextMuted = localStorage.getItem('public.site.textMuted');
      const savedLink = localStorage.getItem('public.site.link');
      const savedSurface = localStorage.getItem('public.site.surface');
      const savedBorder = localStorage.getItem('public.site.border');
      const savedPanel = localStorage.getItem('public.site.panel');

      const getAccentStrong = (accent) => {
        if (!accent) return '';
        if (accent === '#3b82f6') return '#2563eb';
        if (accent === '#06d47b') return '#05b868';
        if (accent === '#ff9900') return '#c17700';
        if (accent === '#9b34d3') return '#7e2ab5';
        if (accent === 'blue') return '#2563eb';
        if (accent === 'purple') return '#7e2ab5';
        if (accent === 'green') return '#05b868';
        if (accent === 'orange') return '#c17700';
        if (!accent.startsWith('#') || accent.length !== 7) return '';
        const r = Math.max(0, Math.min(255, Math.round(parseInt(accent.slice(1, 3), 16) * 0.82)));
        const g = Math.max(0, Math.min(255, Math.round(parseInt(accent.slice(3, 5), 16) * 0.82)));
        const b = Math.max(0, Math.min(255, Math.round(parseInt(accent.slice(5, 7), 16) * 0.82)));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      };

      // Appliquer le thème (clair/sombre)
      if (prefs?.theme) {
        if (prefs.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (prefs.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }

      // Appliquer l'accent
      if (prefs?.accent) {
        const accentColors = {
          blue: '#3b82f6',
          purple: '#9b34d3',
          green: '#06d47b',
          orange: '#ff9900'
        };
        const color = accentColors[prefs.accent] || prefs.accent;
        document.documentElement.style.setProperty('--site-accent', color);
        document.documentElement.style.setProperty('--site-accent-default', color);
        const strong = getAccentStrong(color);
        if (strong) document.documentElement.style.setProperty('--site-accent-default-strong', strong);
      } else if (savedAccent) {
          document.documentElement.style.setProperty('--site-accent', savedAccent);
          document.documentElement.style.setProperty('--site-accent-default', savedAccent);
          const strong = getAccentStrong(savedAccent);
          if (strong) document.documentElement.style.setProperty('--site-accent-default-strong', strong);
      }

      if (savedBg) {
          document.documentElement.style.setProperty('--site-bg', savedBg);
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
      if (savedSurface) {
          document.documentElement.style.setProperty('--site-surface', savedSurface);
      }
      if (savedBorder) {
          document.documentElement.style.setProperty('--site-border', savedBorder);
      }
      if (savedPanel) {
          document.documentElement.style.setProperty('--site-panel', savedPanel);
      }

      if (!savedSurface || !savedBorder || !savedPanel) {
          const isLight = savedBg === '#f8fafc' || savedBg === '#ffffff' || savedText === '#0b1220';
          if (isLight) {
              if (!savedSurface) document.documentElement.style.setProperty('--site-surface', '#ffffff');
              if (!savedBorder) document.documentElement.style.setProperty('--site-border', 'rgba(0, 0, 0, 0.10)');
              if (!savedPanel) document.documentElement.style.setProperty('--site-panel', 'rgba(255, 255, 255, 0.85)');
          } else {
              if (!savedSurface) document.documentElement.style.setProperty('--site-surface', 'rgba(255, 255, 255, 0.06)');
              if (!savedBorder) document.documentElement.style.setProperty('--site-border', 'rgba(255, 255, 255, 0.12)');
              if (!savedPanel) document.documentElement.style.setProperty('--site-panel', 'rgba(0, 0, 0, 0.22)');
          }
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
