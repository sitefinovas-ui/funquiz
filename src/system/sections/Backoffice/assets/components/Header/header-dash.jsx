import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../configurations/Context/AuthProvider';
import './header-dash.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import LogoFunQuiz from '../../../../../../assets/Log.png';
import { LuChevronUp } from 'react-icons/lu';
import { FiChevronDown, FiChevronsRight, FiChevronsLeft } from 'react-icons/fi';
import {
  FaTachometerAlt,
  FaUsers,
  FaCog,
  FaComments,
  FaEnvelope,
  FaQuestionCircle,
  FaEnvelopeOpen,
  FaStar,
  FaHome,
} from 'react-icons/fa';

const Sidebar = ({ isCollapsed, onToggleCollapse, onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = !!user;

  const menuItems = [
    { id: 'dashboard', icon: FaTachometerAlt, label: "Vue d'ensemble", link: '/dashboard/' },
    { id: 'users', icon: FaUsers, label: 'Gestion des utilisateurs', link: '/dashboard/users' },
    { id: 'comments', icon: FaComments, label: 'Commentaires', link: '/dashboard/comment' },
    { id: 'messages', icon: FaEnvelope, label: 'Messages utilisateurs', link: '/dashboard/message' },
    { id: 'newsletter', icon: FaEnvelopeOpen, label: 'Newsletter', link: '/dashboard/newsletter' },
    { id: 'quiz', icon: FaQuestionCircle, label: 'Quiz', link: '/dashboard/quiz' },
    { id: 'legal', icon: FaStar, label: 'Légal', link: '/dashboard/legal' },
    { id: 'settings', icon: FaCog, label: 'Réglage du système', link: '/dashboard/settings' },
  ];

  useEffect(() => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className={`sidebar-pro d-flex flex-column ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Header */}
      <div className="sidebar-header d-flex align-items-center justify-content-between px-3 py-4">
        <button
          type="button"
          className="sidebar-mobile-close"
          aria-label="Fermer le menu"
          onClick={() => onCloseMobile && onCloseMobile()}
        >
          ×
        </button>
        {!isCollapsed ? (
          <>
            <div className="d-flex align-items-center">
              <div className="logo-container d-flex align-items-center justify-content-center">
                <img src={LogoFunQuiz} width="45" height="45" alt="FunQuiz Logo" />
              </div>
              <div className="ms-3">
                <h5 className="text-white mb-0 fw-semibold" style={{ fontSize: '1.1rem' }}>
                  FunQuiz Pro
                </h5>
                <small className="text-muted-custom">Admin Console</small>
              </div>
            </div>
            <button
              type="button"
              className="sidebar-collapse-btn position-relative z-10"
              aria-label="Réduire la sidebar"
              title="Réduire la sidebar"
              onClick={onToggleCollapse}
            >
              <FiChevronsLeft size={24} />
            </button>
          </>
        ) : (
          <div className="w-100 position-relative d-flex flex-column align-items-center">
            <img src={LogoFunQuiz} width="40" height="40" alt="FunQuiz Logo" className="mb-2" />
            <button
              type="button"
              className="sidebar-expand-btn position-absolute z-10"
              aria-label="Agrandir la sidebar"
              title="Agrandir la sidebar"
              onClick={onToggleCollapse}
            >
              <FiChevronsRight size={28} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 overflow-auto px-2 pb-2" style={{ scrollbarWidth: 'thin' }}>
        <div className="nav-section">
          {!isCollapsed && (
            <div className="nav-section-title text-muted-custom mt-3 small fw-medium mb-2 px-3">
              Navigation
            </div>
          )}

          <ul className="nav flex-column nav-pro">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className="nav-item mb-1">
                    <NavLink
                      to={item.link}
                      end={item.link === '/dashboard/' || item.link === '/dashboard'}
                      className={({ isActive }) =>
                        `nav-link nav-link-pro d-flex align-items-center justify-content-${
                          isCollapsed ? 'center' : 'start'
                        } w-100 px-3 py-2 position-relative ${isActive ? 'active' : ''}`
                      }
                      title={isCollapsed ? item.label : ''}
                    >
                    <IconComponent
                      className="nav-icon"
                      size={20}
                      style={{
                        color: 'inherit',
                        minWidth: '20px',
                      }}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="nav-text ms-3 flex-grow-1" style={{ fontSize: '0.9rem' }}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="badge bg-primary rounded-pill">{item.badge}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="nav-section mt-4">
            <div className="nav-section-title text-muted-custom small fw-medium mb-2 px-3">
              Actions rapide
            </div>
            <div className="px-2">
              <button
                className="sidebar-action primary mb-2"
                onClick={() => navigate('/dashboard/logs')}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Rapport console
              </button>
              <button
                onClick={() => navigate('/')}
                className="sidebar-action ghost"
              >
                <FaHome className="me-2" />
                Accueil
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="sidebar-footer border-top border-secondary px-3 py-3">
        {!isCollapsed ? (
          <div className="d-flex align-items-center">
            <div className="position-relative">
              <img
                src={
                  user?.avatar_url || (isAuthenticated ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}` : '')
                }
                alt="User Avatar"
                className="rounded-circle"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
              />
              <div
                className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-dark"
                style={{ width: '10px', height: '10px' }}
              ></div>
            </div>

            <div className="ms-3 flex-grow-1">
              <div className="text-white small fw-medium mb-0" style={{ fontSize: '0.85rem' }}>
                {user?.name} {user?.first_name}
              </div>
              <div className="text-muted-custom" style={{ fontSize: '0.7rem' }}>
                {user?.role === 'admin' && 'System Administrator'}
                {user?.role === 'moderator' && 'Moderator'}
                {user?.role === 'user' && 'Utilisateur'}
              </div>
            </div>

            <div className="dropdown position-relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-link p-0 text-muted-custom border-0"
                aria-expanded={isOpen}
              >
                {isOpen ? <LuChevronUp /> : <FiChevronDown />}
              </button>
              <ul
                className={`dropdown-menu dropdown-menu-dark position-absolute  end-0 shadow-lg border-0 rounded-3 ${
                  isOpen ? 'show' : ''
                }`}
                style={{ zIndex: 1100 }}
              >
                <li>
                  <a className="dropdown-item py-2" href="/profil" onClick={() => setIsOpen(false)}>
                    <i className="bi bi-person me-2"></i>Profil
                  </a>
                </li>
                <li>
                  <a className="dropdown-item py-2" href="/terms" onClick={() => setIsOpen(false)}>
                    <i className="bi bi-shield-lock me-2"></i>Confidentialité
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item py-2 text-danger"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsOpen(false);
                      logout();
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center position-relative">
            <div className="position-relative mb-2">
              <img
                src={
                  user?.avatar_url || (isAuthenticated ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}` : '')
                }
                alt="User Avatar"
                className="rounded-circle"
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              />
              <div
                className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-dark"
                style={{ width: '8px', height: '8px' }}
              ></div>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-link p-0 text-muted-custom border-0"
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul
              className={`dropdown-menu dropdown-menu-dark position-absolute top-100 end-0 shadow-lg border-0 rounded-3 ${
                isOpen ? 'show' : ''
              }`}
              style={{ zIndex: 1100 }}
            >
              <li>
                <a className="dropdown-item py-2" href="/profil" onClick={() => setIsOpen(false)}>
                  Profil
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a
                  className="dropdown-item py-2 text-danger"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    logout();
                  }}
                >
                  Déconnexion
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
