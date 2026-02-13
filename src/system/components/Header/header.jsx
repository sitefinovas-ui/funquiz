import './header.css';
import { useLocation, useNavigate, Link} from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuth from '../../configurations/Context/useAuth';
import { usePopup } from '../../configurations/Context/PopupContext';
import pointService from '../../configurations/Services/pointService';
import { SiHomeassistant, SiNintendogamecube } from 'react-icons/si';
import { FaSearch } from 'react-icons/fa';
import { GrInfo } from 'react-icons/gr';
import { IoMdMail } from 'react-icons/io';
import { MdAccountCircle } from 'react-icons/md';

import Logo from '../../../assets/Log.png';
import piece from '../../../assets/icons/piece.png';
import { useTranslation } from 'react-i18next';

const Header = ({ openPopup }) => {
  const navigate = useNavigate();   
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { activePopup } = usePopup();
  const isGame = location.pathname === '/step';
  const isLogin = location.pathname === '/login';
  const isSignUp = location.pathname === '/sign-up';
  const isDash = location.pathname.startsWith('/dashboard');
  const isSearchRoute = location.pathname === '/search';
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Points dynamiques depuis le service pointService
  const [points, setPoints] = useState(0);
  const resolvePoints = (data, fallback) => {
    const value =
      data?.total_points ??
      data?.total_points_games ??
      data?.points ??
      data?.total;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
    const fallbackParsed = Number(fallback);
    return Number.isFinite(fallbackParsed) ? fallbackParsed : 0;
  };

  // Persistance de la langue au chargement (sans état local inutile)
  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    let ignore = false;
    const fetchPoints = async () => {
      if (user && user.user_id) {
        try {
          const data = await pointService.getUserPoints(user.user_id);
          const pts = resolvePoints(data, user?.total_points);
          if (!ignore) setPoints(pts);
        } catch {
          const fallbackPts = resolvePoints(null, user?.total_points);
          if (!ignore) setPoints(fallbackPts);
        }
      } else {
        if (!ignore) setPoints(0);
      }
    };
    fetchPoints();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Gestion du champ recherche
  const [search, setSearch] = useState('');
  const searchInputRef = useRef();

  // Synchronise l'input avec l'URL (?query=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query') || '';
    setSearch(q);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/search?query=${encodeURIComponent(q)}`);
    } else {
      navigate('/search');
    }
  };

  // ➕ Rafraîchissement des points lors de l’événement global
  useEffect(() => {
    const handler = async () => {
      if (user && user.user_id) {
        try {
          const data = await pointService.getUserPoints(user.user_id);
          const pts = resolvePoints(data, user?.total_points);
          setPoints(pts);
        } catch {
          const fallbackPts = resolvePoints(null, user?.total_points);
          setPoints(fallbackPts);
        }
      } else {
        setPoints(0);
      }
    };
    window.addEventListener('points:updated', handler);
    return () => window.removeEventListener('points:updated', handler);
  }, [user]);

  return (
    <>
      {!isGame && !isDash && !isSignUp && !isLogin && (
        <div className="position-relative z-3">
          {/* === Header Desktop === */}
          <header style={{ backgroundColor: 'var(--site-bg)' }} className="header-desktop d-none d-lg-block position-sticky top-0 left-0 right-0 z-3">
            <div
              
              className=" container  d-flex align-items-center justify-content-between "
            >
              {/* Navigation */}
              <div className="d-flex align-items-center gap-5">
                <nav className="nav-header">
                  <ul className="d-flex align-items-center gap-5 list-unstyled m-0">
                    <li>
                      <button
                        onClick={() => navigate('/')}
                        className=" btn-header-custom d-flex gap-2  align-items-center text-white text-decoration-none"
                      >
                        <SiHomeassistant className='p-0 m-0'/> {t('header.home')}
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => openPopup('thematic')}
                        className=" btn-header-custom text-white text-decoration-none"
                      >
                        <SiNintendogamecube /> {t('header.quiz')}
                      </button>
                    </li>
                  </ul>
                </nav>

                <form
                  className="search-bar d-flex align-items-center position-relative"
                  onSubmit={handleSearch}
                  role="search"
                  aria-label="Recherche"
                >
                  <input
                    type="text"
                    className="search-input w-100 px-4 py-3 rounded-pill"
                    placeholder={t('header.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    ref={searchInputRef}
                    aria-label={t('header.searchAria')}
                  />
                  <button
                    type="submit"
                    className="search-btn position-absolute"
                    aria-label={t('header.searchBtnAria')}
                  >
                    <FaSearch />
                  </button>
                </form>
              </div>

              {/* Logo */}
              <div
                style={{ width: '100px' }}
                onClick={() => navigate('/')}
                className="logo d-flex align-items-center justify-content-center"
              >
                <img src={Logo} className="w-100 h-100" alt="" />
                <h1 className="fw-bold text-light">{t('header.logo')}</h1>
              </div>

              {/* Actions */}
              <div className="d-flex gap-3 align-items-center justify-content-center">
                <button
                  onClick={() => navigate('/terms')}
                  className="info-btn"
                  aria-label={t('header.termsAria')}
                >
                  <GrInfo size={26} className="icon p-0 m-0 text-white" />
                </button>

                {isAuthenticated && (
                  <button
                    className="btn d-flex align-items-center bg-secondary text-light bg-opacity-25 rounded-pill"
                    tabIndex={-1}
                    aria-label={`Vous avez ${points} points`}
                    disabled
                  >
                    <img src={piece} width={30} className="object-fit-cover" alt="points" />
                    <span className="p-1">{points.toLocaleString('fr-FR')}</span>
                  </button>
                )}

                

                {isAuthenticated ? (
                  <button
                    style={{ width: '70px', height: '70px' }}
                    onClick={() => navigate('/profil')}
                    className="rounded-5 overflow-hidden border border-white"
                    aria-label={t('header.profile')}
                  >
                    {(() => {
                      let apiUrl = import.meta.env.VITE_API_URL || '';
                      if (apiUrl.endsWith('/api')) apiUrl = apiUrl.slice(0, -4);
                      let avatarPath = user.avatar || user.avatar_url || '';
                      if (avatarPath && avatarPath.startsWith('/uploads/')) {
                        avatarPath = `${apiUrl}${avatarPath}`;
                      }
                      const fallback =
                        'https://img.freepik.com/photos-premium/image-photorealiste-hyper-realiste-fond-blanc-ai-generee-par-freepik_643360-530895.jpg?semt=ais_hybrid&w=740&q=80';
                      return (
                        <img
                          src={avatarPath && avatarPath !== '' ? avatarPath : fallback}
                          className="object-fit-cover w-100"
                          alt="profil"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallback;
                          }}
                        />
                      );
                    })()}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-5 py-2 px-3 btn-wall-custom border-0 text-white"
                    aria-label={t('header.login')}
                  >
                    {t('header.login')}
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* === Footer Mobile (Magic Nav) === */}
          <div className="mobile-bottom-nav-container d-lg-none">
            <div className="mobile-bottom-nav">
              <ul className="nav-list">
                {/* 0: Quiz */}
                <li 
                  className={`nav-item ${activePopup === 'thematic' ? 'active' : ''}`} 
                  onClick={() => openPopup('thematic')}
                >
                  <button className="nav-link-custom" aria-label={t('header.quiz')}>
                    <span className="icon"><SiNintendogamecube /></span>
                    <span className="text">{t('header.quiz')}</span>
                  </button>
                </li>

                {/* 1: Search */}
                <li 
                  className={`nav-item ${!activePopup && location.pathname === '/search' ? 'active' : ''}`} 
                  onClick={() => navigate('/search')}
                >
                  <button className="nav-link-custom" aria-label="Rechercher">
                    <span className="icon"><FaSearch /></span>
                    <span className="text">Recherche</span>
                  </button>
                </li>

                {/* 2: Home (Logo) */}
                <li 
                  className={`nav-item ${!activePopup && location.pathname === '/' ? 'active' : ''}`} 
                  onClick={() => navigate('/')}
                >
                  <button className="nav-link-custom" aria-label="Accueil">
                    <span className="icon logo-icon">
                      <img src={Logo} alt="Logo" />
                    </span>
                    <span className="text">Accueil</span>
                  </button>
                </li>

                {/* 3: Contact */}
                <li 
                  className={`nav-item ${!activePopup && location.pathname === '/contact' ? 'active' : ''}`} 
                  onClick={() => navigate('/contact')}
                >
                  <button className="nav-link-custom" aria-label={t('header.contact')}>
                    <span className="icon"><IoMdMail /></span>
                    <span className="text">{t('header.contact')}</span>
                  </button>
                </li>

                {/* 4: Profile/Login */}
                <li 
                  className={`nav-item ${!activePopup && (location.pathname === '/profil' || location.pathname === '/login') ? 'active' : ''}`} 
                  onClick={() => navigate(isAuthenticated ? '/profil' : '/login')}
                >
                  <button className="nav-link-custom" aria-label={isAuthenticated ? t('header.profile') : t('header.login')}>
                    <span className="icon"><MdAccountCircle /></span>
                    <span className="text">{isAuthenticated ? 'Profil' : 'Login'}</span>
                  </button>
                </li>

                {/* The Magic Indicator */}
                <div className="indicator"></div>
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Search bar */}
      {isSearchRoute && (
        <div className="container header-desktop position-fixed top-0 end-0 pb-3 d-block d-lg-none pt-4">
          <form
                    className="search-bar d-flex align-items-center position-relative"
                    onSubmit={handleSearch}
                    role="search"
                    aria-label="Recherche"
                  >
                    <input
                      type="text"
                      className="search-input w-100 px-4 py-3 rounded-pill"
                      placeholder={t('header.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      ref={searchInputRef}
                      aria-label={t('header.searchAria')}
                    />
                    <button
                      type="submit"
                      className="search-btn position-absolute"
                      aria-label={t('header.searchBtnAria')}
                    >
                      <FaSearch />
                    </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
