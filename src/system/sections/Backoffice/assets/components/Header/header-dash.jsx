import { useState } from "react";
import "./header-dash.css";
import { Link } from "react-router-dom";
import LogoFunQuiz from "../../../../../../assets/Log.png";

import { FiChevronsRight, FiChevronsLeft } from "react-icons/fi";
import {  FaTachometerAlt, // Dashboard / Vue d'ensemble
    FaUsers,         // Gestion utilisateurs
    FaCog,           // Réglages système
    FaComments,      // Commentaires / Feedback
    FaClipboardList, // Thématiques / Termes
    FaEnvelope,      // Messages utilisateurs
    FaCookieBite,    // Gestion des cookies
    FaDesktop,       // Réglages front
    FaQuestionCircle, // Quiz / Questions
    FaStar,           // Scores / Classements
    FaTrophy,         // Challenges / Tournois
    FaUserShield,    // Contrôle utilisateurs / rôles
  FaBell            } from "react-icons/fa";


const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

const menuItems = [
   // Dashboard
  { id: "dashboard", icon: FaTachometerAlt, label: "Vue d'ensemble", link: "/dashboard/" },

  // Gestion utilisateurs
  { id: "quiz", icon: FaUserShield, label: "Contrôle utilisateurs", link: "/dashboard/quiz", badge: "8" },
  { id: "users", icon: FaUsers, label: "Gestion des utilisateurs", link: "/dashboard/users" },

  // Gestion contenus / messages
  { id: "comments", icon: FaComments, label: "Commentaires", link: "/dashboard/comments" },
  { id: "themes", icon: FaClipboardList, label: "Thématiques", link: "/dashboard/themes" },
  { id: "messages", icon: FaEnvelope, label: "Messages utilisateurs", link: "/dashboard/messages" },

  // Quiz et performances
  { id: "questions", icon: FaQuestionCircle, label: "Questions / Quiz", link: "/dashboard/questions" },
  { id: "scores", icon: FaStar, label: "Scores & Classements", link: "/dashboard/scores" },
  { id: "challenges", icon: FaTrophy, label: "Challenges / Tournois", link: "/dashboard/challenges" },
  { id: "notifications", icon: FaBell, label: "Notifications", link: "/dashboard/notifications" },

  // Réglages système
  { id: "terms", icon: FaClipboardList, label: "Termes & Conditions", link: "/dashboard/terms" },
  { id: "cookies", icon: FaCookieBite, label: "Gestion des cookies", link: "/dashboard/cookies" },
  { id: "frontSettings", icon: FaDesktop, label: "Réglages vues front", link: "/dashboard/front-settings" },
  { id: "settings", icon: FaCog, label: "Réglage du système", link: "/dashboard/settings" },
];

  const handleItemClick = (itemId) => setActiveItem(itemId);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`sidebar-pro d-flex flex-column position-sticky vh-100 ${
        isCollapsed ? "collapsed" : "expanded"
      }`}
      style={{
        width: isCollapsed ? "72px" : "320px",
        transition: "width 0.25s ease-in-out",
        zIndex: 1050,
        backgroundColor: "#1a1d29",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header */}
      <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-4">
        <div className="d-flex align-items-center">
          <div className="logo-container d-flex align-items-center justify-content-center">
        <img src={LogoFunQuiz} width="50" height="50" alt="FunQuiz Logo" />
          </div>

          {!isCollapsed && (
            <div className="ms-3">
              <h5 className="text-white mb-0 fw-semibold">FunQuiz Pro</h5>
              <small className="text-muted-custom">Admin Console</small>
            </div>
          )}
        </div>

        <button 
            className="btn p-0 border-0" 
            onClick={toggleSidebar} 
            style={{ fontSize: "18px", lineHeight: 1 }}
            >
            {isCollapsed ? (
                <FiChevronsRight 
                size={34} 
                style={{
                    color: '#ffffff',
                    backgroundColor: '#343a40',
                    borderRadius: '50%',
                    padding: '8px'
                }}
                />
            ) : (
                <FiChevronsLeft 
                size={24} 
                style={{ color: '#ffffff' }}
                />
            )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 overflow-scroll  px-3 pb-4">
        <div className="nav-section">
          {!isCollapsed && (
            <div className="nav-section-title text-muted-custom mt-4 small fw-medium mb-3 px-3">
              navigation principale
            </div>
          )}

          <ul className="nav flex-column nav-pro "   >
            {menuItems.map((item) => {
                const IconComponent = item.icon; 
                return (
                    <li key={item.id} className="nav-item mb-1">
                        <Link
                            to={item.link}
                            className={`nav-link nav-link-pro d-flex align-items-center px-3 py-3 rounded-2 ${
                                activeItem === item.id ? "active" : ""
                            }`}
                            onClick={() => {
                                handleItemClick(item.id);
                            }}
                            title={isCollapsed ? item.label : ""}
                        >
                            <IconComponent 
                                className="nav-icon" 
                                size={18}
                                style={{ color: activeItem === item.id ? '#ffffff' : '#6b7280' }}
                            />
                            {!isCollapsed && (
                                <>
                                    <span className="nav-text ms-3 flex-grow-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="badge bg-primary rounded-pill">{item.badge}</span>
                                    )}
                                </>
                            )}
                        </Link>
                    </li>
                );
            })}
          </ul>
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="nav-section mt-5">
            <div className="nav-section-title text-muted-custom small fw-medium mb-3 px-3">
              QUICK ACTIONS
            </div>
            <div className="px-3">
              <button className="btn btn-primary w-100 mb-2 py-2 fw-medium">
                <i className="bi bi-plus-lg me-2"></i>
                New Quiz
              </button>
              <button className="btn btn-outline-light w-100 py-2 fw-medium text-muted-custom border-secondary">
                <i className="bi bi-download me-2"></i>
                Export Data
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="sidebar-footer border-top border-secondary px-3 py-3">
        <div className="d-flex align-items-center">
          <div className="position-relative">
            <div className="avatar-wrapper d-flex align-items-center justify-content-center">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                alt="User Avatar"
                className="rounded-circle"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
            </div>
            <div
              className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-dark"
              style={{ width: "10px", height: "10px" }}
            ></div>
          </div>

          {!isCollapsed && (
            <>
              <div className="ms-3 flex-grow-1">
                <div className="text-white small fw-medium mb-0">Frederick Miller</div>
                <div className="text-muted-custom" style={{ fontSize: "0.75rem" }}>
                  System Administrator
                </div>
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-link p-0 text-muted-custom border-0"
                  data-bs-toggle="dropdown"
                  style={{ fontSize: "16px" }}
                >
                  <i className="bi bi-three-dots"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-dark shadow-lg border-0 rounded-3">
                  <li>
                    <a className="dropdown-item py-2" href="#">
                      <i className="bi bi-person me-2"></i>Profile Settings
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item py-2" href="#">
                      <i className="bi bi-shield-lock me-2"></i>Privacy
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a className="dropdown-item py-2 text-danger" href="#">
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {isCollapsed && (
          <div className="text-center mt-3">
            <button
              className="btn btn-outline-light btn-sm rounded-circle"
              style={{ width: "32px", height: "32px" }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: "14px" }}></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
