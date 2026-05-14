import { Outlet } from "react-router-dom";
import Sidebar from "../Header/header-dash.jsx";
import HeadDash from "../Head/headDash.jsx";
import { usePopup } from "../../../../../configurations/Context/PopupContext.jsx";
import ImportUsers from "../../../../../components/ImportUser/import-user.jsx";
import { useEffect, useState } from "react";

const LayoutDash = () => {
  const { activePopup, closePopup } = usePopup();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const savedBg = localStorage.getItem("public.site.bg");
    const savedAccent = localStorage.getItem("public.site.accent");

    if (savedBg) document.documentElement.style.setProperty("--site-bg", savedBg);
    if (savedAccent) {
      document.documentElement.style.setProperty("--site-accent", savedAccent);
    }
  }, []);

  const popupComponents = {
    importUser: <ImportUsers closePopup={closePopup} />,
  };

  const sidebarCollapsed = isMobileSidebarOpen ? false : isCollapsed;

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden font-sans">
      {/* MOBILE BACKDROP */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-[70] h-full transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${sidebarCollapsed ? "w-20" : "w-72"}
        `}
      >
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setIsCollapsed((v) => !v)}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </aside>

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* TOPBAR */}
        <header className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-6 z-40 sticky top-0">
          <HeadDash onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>

      {/* POPUPS */}
      {activePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closePopup}
          />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="p-6">
              {popupComponents[activePopup]}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutDash;