// LayoutDash.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../Header/header-dash.jsx';
import HeadDash from '../Head/headDash.jsx';
import './LayoutDash.css';
import { usePopup } from '../../../../../configurations/Context/PopupContext.jsx';
import ImportUsers from '../../../../../components/ImportUser/import-user.jsx';
import { useEffect, useState } from 'react';

const LayoutDash = () => {
  const { activePopup, closePopup } = usePopup();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedBg = localStorage.getItem('public.site.bg');
    const savedAccent = localStorage.getItem('public.site.accent');
    const savedSidebar = localStorage.getItem('theme.sidebar');
    const getAccentStrong = (accent) => {
      if (!accent) return '';
      if (accent === '#3b82f6') return '#2563eb';
      if (accent === '#06d47b') return '#05b868';
      if (accent === '#ff9900') return '#c17700';
      if (accent === '#9b34d3') return '#7e2ab5';
      return accent;
    };

    if (savedBg) document.documentElement.style.setProperty('--site-bg', savedBg);
    if (savedAccent) {
      document.documentElement.style.setProperty('--site-accent', savedAccent);
      document.documentElement.style.setProperty('--brand-accent', savedAccent);
      document.documentElement.style.setProperty('--brand-accent-strong', getAccentStrong(savedAccent));
    }
    if (savedSidebar) document.documentElement.style.setProperty('--bg-sidebar-dash', savedSidebar);
  }, []);

  // Popups dynamiques du backoffice
  const popupComponents = {
    importUser: <ImportUsers closePopup={closePopup} />,
  };
  const layoutMode = localStorage.getItem('bo.layout') === 'compact' ? 'compact' : 'wide';

  return (
    <div className={`bo-root layout-${layoutMode}`}>
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="bo-backdrop"
          aria-label="Fermer le menu"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`bo-shell ${isCollapsed ? 'is-collapsed' : ''}`}>
        <aside className={`bo-sidebar ${isMobileSidebarOpen ? 'is-open' : ''}`}>
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((v) => !v)}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </aside>

        <main className="bo-main">
          <div className="bo-topbar">
            <HeadDash onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
          </div>
          <div className="bo-content">
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
