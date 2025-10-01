// LayoutDash.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../Header/header-dash.jsx"; // ton composant sidebar
import HeadDash from "../Head/headDash.jsx";

import "./LayoutDash.css"; // si tu as du CSS

const LayoutDash = () => {
  return (
    <div className="layout-dash d-flex flex-column min-vh-100">
      {/* Footer */}
      <HeadDash />
      
      <div className="d-flex flex-grow-1">
        {/* Sidebar fixe */}
        <aside className="">
          <Sidebar />
        </aside>

        {/* Contenu principal — prend le reste */}
        <main className="main-content flex-grow-1 d-flex">
          {/* wrapper qui permet à Outlet d'utiliser tout l'espace */}
          <div className="content-wrapper flex-grow-1 p-3">
            <Outlet />
          </div>
        </main>
      </div>

      
    </div>
  );
};

export default LayoutDash;
