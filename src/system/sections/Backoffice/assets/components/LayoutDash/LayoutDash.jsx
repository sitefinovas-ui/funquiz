// LayoutDash.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../Header/header-dash.jsx';
import HeadDash from '../Head/headDash.jsx';
import './LayoutDash.css';
import { usePopup } from '../../../../../configurations/Context/PopupContext.jsx';
import ImportUsers from '../../../../../components/ImportUser/import-user.jsx';
import { useEffect } from 'react';

const LayoutDash = () => {
  const { activePopup, closePopup } = usePopup();

  useEffect(() => {
    const savedBg = localStorage.getItem('public.site.bg');
    const savedAccent = localStorage.getItem('public.site.accent');
    const savedSidebar = localStorage.getItem('theme.sidebar');

    if (savedBg) document.documentElement.style.setProperty('--site-bg', savedBg);
    if (savedAccent) {
      document.documentElement.style.setProperty('--site-accent', savedAccent);
      document.documentElement.style.setProperty('--brand-accent', savedAccent);
      document.documentElement.style.setProperty('--brand-accent-strong', savedAccent);
    }
    if (savedSidebar) document.documentElement.style.setProperty('--bg-sidebar-dash', savedSidebar);
  }, []);

  // Popups dynamiques du backoffice
  const popupComponents = {
    importUser: <ImportUsers closePopup={closePopup} />,
  };
  return (
    <div className="layout-dash position-relative d-flex flex-column min-vh-100">
      {/* Footer */}

      <div className="d-flex flex-grow-1">
        {/* Sidebar fixe */}
        <aside className="">
          <Sidebar />
        </aside>

        {/* Contenu principal — prend le reste */}
        <main className="main-content flex-grow-1 d-flex">
          {/* wrapper qui permet à Outlet d'utiliser tout l'espace */}
          <div className="content-wrapper flex-grow-1 p-3">
            <HeadDash />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Popups dynamiques */}
      {activePopup && popupComponents[activePopup]}
    </div>
  );
};

export default LayoutDash;
