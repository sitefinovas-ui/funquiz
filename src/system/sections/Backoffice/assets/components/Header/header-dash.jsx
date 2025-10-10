import { useState } from 'react';
import { useAuth } from '../../../../../configurations/Context/AuthProvider';
import './header-dash.css';
import { Link, useNavigate } from 'react-router-dom';
import LogoFunQuiz from '../../../../../../assets/Log.png';
import { LuChevronUp } from 'react-icons/lu';
import { FiChevronDown } from 'react-icons/fi';

import { FiChevronsRight, FiChevronsLeft } from 'react-icons/fi';
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

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', icon: FaTachometerAlt, label: "Vue d'ensemble", link: '/dashboard/' },
    { id: 'users', icon: FaUsers, label: 'Gestion des utilisateurs', link: '/dashboard/users' },
    { id: 'comments', icon: FaComments, label: 'Commentaires', link: '/dashboard/comment' },
    {
      id: 'messages',
      icon: FaEnvelope,
      label: 'Messages utilisateurs',
      link: '/dashboard/message',
    },
    { id: 'newsletter', icon: FaEnvelopeOpen, label: 'Newsletter', link: '/dashboard/newsletter' },
    { id: 'quiz', icon: FaQuestionCircle, label: 'Quiz', link: '/dashboard/quiz' },
    { id: 'legal', icon: FaStar, label: 'Légal', link: '/dashboard/legal' },
    { id: 'settings', icon: FaCog, label: 'Réglage du système', link: '/dashboard/settings' },
  ];

  const handleItemClick = (itemId) => setActiveItem(itemId);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`sidebar-pro d-flex flex-column position-sticky top-0 vh-100 ${isCollapsed ? 'collapsed' : 'expanded'}`}
      style={{
        width: isCollapsed ? '80px' : '280px',
        transition: 'width 0.3s ease-in-out',
        zIndex: 1050,
        backgroundColor: 'var(--bg-sidebar-dash)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <div
        className="sidebar-header d-flex align-items-center justify-content-between px-3 py-4"
        style={{ minHeight: '80px' }}
      >
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
              className="btn p-0 border-0"
              onClick={toggleSidebar}
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              <FiChevronsLeft size={24} style={{ color: '#ffffff' }} />
            </button>
          </>
        ) : (
          <div className="w-100 position-relative d-flex flex-column align-items-center">
            <img src={LogoFunQuiz} width="40" height="40" alt="FunQuiz Logo" className="mb-2" />
            <button
              className="btn position-absolute p-0 border-0"
              onClick={toggleSidebar}
              style={{ fontSize: '20px', lineHeight: 1, right: '-40px', top: '60%' }}
            >
              <FiChevronsRight
                size={28}
                style={{
                  color: '#ffffff',
                  backgroundColor: 'var(--bg-sidebar-dash)',
                  borderRadius: '50%',
                  padding: '6px',
                }}
              />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 overflow-auto px-2 pb-2" style={{ scrollbarWidth: 'thin' }}>
        <div className="nav-section">
          {!isCollapsed && (
            <div
              className="nav-section-title text-muted-custom mt-3 small fw-medium mb-2 px-3"
              style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Navigation
            </div>
          )}

          <ul className="nav flex-column nav-pro">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className="nav-item mb-1">
                  <Link
                    to={item.link}
                    className={`nav-link nav-link-pro d-flex align-items-center justify-content-${isCollapsed ? 'center' : 'start'} px-3 py-3 rounded-2 position-relative ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : ''}
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <IconComponent
                      className="nav-icon"
                      size={20}
                      style={{
                        color: activeItem === item.id ? '#ffffff' : 'var(--site-text-muted)',
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="nav-section mt-4">
            <div
              className="nav-section-title text-muted-custom small fw-medium mb-2 px-3"
              style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Actions rapide
            </div>
            <div className="px-2">
              <button
                className="btn w-100 mb-2 py-2 fw-medium"
                style={{ fontSize: '0.85rem', backgroundColor: 'var(--brand-accent)', borderColor: 'var(--brand-accent)', color: '#fff' }}
                onClick={() => navigate('/dashboard/logs')}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Rapport console
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline-light w-100 py-2 fw-medium text-muted-custom border-secondary d-flex gap-2 align-items-center justify-content-center"
                style={{ fontSize: '0.85rem' }}
              >
                <FaHome className="me-2"></FaHome>
                Accueil
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div
        className="sidebar-footer border-top border-secondary px-3 py-3"
        style={{ minHeight: '80px' }}
      >
        {!isCollapsed ? (
          <div className="d-flex align-items-center">
            <div className="position-relative">
              <img
                src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + user.name}
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
                {user.name} {user.first_name}
              </div>
              <div className="text-muted-custom" style={{ fontSize: '0.7rem' }}>
                {user.role === 'admin' && 'System Administrator'}
                {user.role === 'moderator' && 'Moderator'}
                {user.role === 'user' && 'Utilisateur'}
              </div>
            </div>

            <div className="dropdown">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-link p-0 text-muted-custom border-0"
                data-bs-toggle="dropdown"
                style={{ fontSize: '16px' }}
              >
                {isOpen ? <LuChevronUp /> : <FiChevronDown />}
              </button>
              <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg border-0 rounded-3">
                <li>
                  <a className="dropdown-item py-2" href="/profil">
                    <i className="bi bi-person me-2"></i>Profil
                  </a>
                </li>
                <li>
                  <a className="dropdown-item py-2" href="/terms">
                    <i className="bi bi-shield-lock me-2"></i>Confidentialité
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a className="dropdown-item py-2 text-danger" href="#" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center">
            <div className="position-relative mb-2">
              <img
                src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + user.name}
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
              className="btn btn-link p-0 text-muted-custom border-0"
              data-bs-toggle="dropdown"
              style={{ fontSize: '16px' }}
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-dark shadow-lg border-0 rounded-3">
              <li>
                <a className="dropdown-item py-2" href="#">
                  Profil
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <a className="dropdown-item py-2 text-danger" href="#" onClick={logout}>
                  Déconnexion
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>

      <style>{`
        .sidebar-pro .nav-link-pro {
          color: var(--site-text-muted);
        }
        .sidebar-pro .nav-link-pro:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .sidebar-pro .nav-link-pro.active {
          background-color: var(--brand-accent);
          color: #ffffff;
        }
        .sidebar-pro .nav-link-pro.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: var(--brand-accent);
          border-radius: 0 3px 3px 0;
        }
        .sidebar-pro::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-pro::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .text-muted-custom {
          color: var(--site-text-muted);
        }
        .dropdown-menu-dark {
          background-color: var(--bg-sidebar-dash);
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
