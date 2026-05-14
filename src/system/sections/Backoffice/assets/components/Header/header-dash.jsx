import { useEffect, useState } from 'react';
import { useAuth } from '../../../../../configurations/Context/AuthProvider';
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
  }, [location.pathname]);

  return (
    <div className={`h-full flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-slate-800">
        <button
          type="button"
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => onCloseMobile && onCloseMobile()}
        >
          <span className="text-2xl">×</span>
        </button>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <img src={LogoFunQuiz} width="32" height="32" alt="Logo" className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm tracking-tight">FunQuiz Pro</span>
                <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">Admin Console</span>
              </div>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              onClick={onToggleCollapse}
            >
              <FiChevronsLeft size={20} />
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <img src={LogoFunQuiz} width="32" height="32" alt="Logo" />
            <button
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              onClick={onToggleCollapse}
            >
              <FiChevronsRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {!isCollapsed && (
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Menu Principal
          </div>
        )}

        <div className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.link || (item.link === '/dashboard/' && location.pathname === '/dashboard');
            
            return (
              <NavLink
                key={item.id}
                to={item.link}
                end={item.link === '/dashboard/' || item.link === '/dashboard'}
                className={({ isActive }) => `
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <IconComponent size={20} className={isActive ? 'text-white' : 'group-hover:text-white'} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Actions rapides
            </div>
            <div className="space-y-1">
              <button
                onClick={() => navigate('/dashboard/logs')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium"
              >
                <div className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded group-hover:bg-slate-700">
                  <span className="text-xs">R</span>
                </div>
                Rapport console
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium"
              >
                <FaHome size={20} />
                Accueil
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="relative shrink-0">
            <img
              src={user?.avatar_url || (isAuthenticated ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}` : '')}
              alt="Avatar"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name} {user?.first_name}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate">
                {user?.role === 'admin' ? 'Administrateur' : user?.role || 'Utilisateur'}
              </p>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors ${isCollapsed ? 'mt-2' : ''}`}
            >
              <FiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className={`absolute bottom-full mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 w-48 z-50 ${isCollapsed ? 'left-0' : 'right-0'}`}>
                <button
                  onClick={() => { setIsOpen(false); navigate('/profil'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <FaUsers size={14} /> Profil
                </button>
                <button
                  onClick={() => { setIsOpen(false); navigate('/terms'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <FaStar size={14} /> Confidentialité
                </button>
                <div className="my-1 border-t border-slate-700"></div>
                <button
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
