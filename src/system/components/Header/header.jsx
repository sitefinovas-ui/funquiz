import './header.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuth from '../../configurations/Context/useAuth';
import { usePopup } from '../../configurations/Context/PopupContext';
import pointService from '../../configurations/Services/pointService';
import { FaSearch, FaHome, FaGamepad, FaInfoCircle, FaEnvelope, FaTrophy, FaTimes, FaCog, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { GrInfo } from 'react-icons/gr';
import { MdSettings, MdPerson, MdLogout, MdStar, MdCardGiftcard, MdSportsEsports, MdLeaderboard, MdHistory, MdEmojiEvents, MdHeadsetMic } from 'react-icons/md';
import Logo from '../../../assets/Log.png';
import piece from '../../../assets/icons/piece.png';
import { useTranslation } from 'react-i18next';
import thematicService from '../../configurations/Services/thematicServices';

const Header = ({ openPopup }) => {
  const navigate    = useNavigate();
  const { t, i18n } = useTranslation();
  const location    = useLocation();
  const { activePopup } = usePopup();

  const isGame      = location.pathname === '/step';
  const isLogin     = location.pathname === '/login';
  const isSignUp    = location.pathname === '/sign-up';
  const isDash      = location.pathname.startsWith('/dashboard');
  const isSearchRoute = location.pathname === '/search';

  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const [profileOpen,  setProfileOpen]  = useState(false);
  const [mobMenuOpen,  setMobMenuOpen]  = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [desktopSearchVal, setDesktopSearchVal]   = useState('');
  const desktopSearchRef   = useRef(null);
  const desktopInputRef    = useRef(null);

  useEffect(() => {
    if (desktopSearchOpen) {
      desktopInputRef.current?.focus();
      return;
    }
  }, [desktopSearchOpen]);

  useEffect(() => {
    if (!desktopSearchOpen) return;
    const handler = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setDesktopSearchOpen(false);
        setDesktopSearchVal('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [desktopSearchOpen]);

  const [allThematics,   setAllThematics]   = useState(null);
  const [searchResults,  setSearchResults]  = useState([]);

  useEffect(() => {
    if (!desktopSearchOpen || allThematics !== null) return;
    thematicService.getAllThematics()
      .then(d => setAllThematics(Array.isArray(d) ? d : []))
      .catch(() => setAllThematics([]));
  }, [desktopSearchOpen]);

  useEffect(() => {
    const q = desktopSearchVal.trim().toLowerCase();
    if (!q || !allThematics) { setSearchResults([]); return; }
    setSearchResults(
      allThematics
        .filter(t =>
          t.thematic_title?.toLowerCase().includes(q) ||
          t.thematic_description?.toLowerCase().includes(q)
        )
        .slice(0, 7)
    );
  }, [desktopSearchVal, allThematics]);

  const handleDesktopSearch = (e) => {
    e?.preventDefault();
    const q = desktopSearchVal.trim();
    navigate(q ? `/search?query=${encodeURIComponent(q)}` : '/search');
    setDesktopSearchOpen(false);
    setDesktopSearchVal('');
    setSearchResults([]);
  };

  const handleResultClick = (thematic) => {
    openPopup('thematic', { highlightThematicId: thematic.thematic_id });
    setDesktopSearchOpen(false);
    setDesktopSearchVal('');
    setSearchResults([]);
  };

  const [points,  setPoints]  = useState(0);
  const [scrolled, setScrolled] = useState(false);

  /* active states */
  const isHomeActive    = !activePopup && location.pathname === '/';
  const isQuizActive    = activePopup === 'thematic';
  const isAboutActive   = !activePopup && location.pathname === '/about';
  const isContactActive = !activePopup && location.pathname === '/contact';

  const resolvePoints = (data, fallback) => {
    const value = data?.total_points ?? data?.total_points_games ?? data?.points ?? data?.total;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
    const fb = Number(fallback);
    return Number.isFinite(fb) ? fb : 0;
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  useEffect(() => {
    let ignore = false;
    const fetchPoints = async () => {
      if (user?.user_id) {
        try {
          const data = await pointService.getUserPoints(user.user_id);
          if (!ignore) setPoints(resolvePoints(data, user?.total_points));
        } catch {
          if (!ignore) setPoints(resolvePoints(null, user?.total_points));
        }
      } else {
        if (!ignore) setPoints(0);
      }
    };
    fetchPoints();
    return () => { ignore = true; };
  }, [user]);

  useEffect(() => {
    const handler = async () => {
      if (user?.user_id) {
        try {
          const data = await pointService.getUserPoints(user.user_id);
          setPoints(resolvePoints(data, user?.total_points));
        } catch {
          setPoints(resolvePoints(null, user?.total_points));
        }
      } else {
        setPoints(0);
      }
    };
    window.addEventListener('points:updated', handler);
    return () => window.removeEventListener('points:updated', handler);
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobMenuOpen(false); }, [location.pathname]);

  /* Search (used for mobile /search route) */
  const [search, setSearch]   = useState('');
  const searchInputRef        = useRef();
  const debounceRef           = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('query') || '');
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/search?query=${encodeURIComponent(q)}` : '/search', { replace: true });
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (isSearchRoute) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        navigate(val.trim() ? `/search?query=${encodeURIComponent(val.trim())}` : '/search', { replace: true });
      }, 300);
    }
  };

  const getAvatarSrc = () => {
    let apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl.endsWith('/api')) apiUrl = apiUrl.slice(0, -4);
    let avatarPath = user?.avatar || user?.avatar_url || '';
    if (avatarPath?.startsWith('/uploads/')) avatarPath = `${apiUrl}${avatarPath}`;
    return avatarPath || 'https://img.freepik.com/photos-premium/image-photorealiste-hyper-realiste-fond-blanc-ai-generee-par-freepik_643360-530895.jpg?semt=ais_hybrid&w=740&q=80';
  };

  return (
    <>
      {!isGame && !isDash && !isSignUp && !isLogin && (
        <div className="relative z-30">

          {/* ══ Desktop Header — Play Store style ══ */}
          <header className={`header-desktop hidden lg:flex items-stretch sticky top-0 left-0 right-0 z-30 h-[62px] ${scrolled ? 'scrolled' : ''}`}>
            <div className=" mx-auto px-6 w-full flex items-center justify-between">

              {/* LEFT — logo + nav tabs */}
              <div className="flex items-stretch h-full gap-1">

                {/* Logo */}
                <button
                  onClick={() => navigate('/')}
                  className="hdr-logo-btn mr-4"
                  style={{ background: 'none', border: 'none' }}
                >
                  <img src={Logo} className="hdr-logo-img" alt="FunQuiz" />
                  <span className="hdr-logo-text">
                    Fun<span>Quiz</span>
                  </span>
                </button>

                {/* Nav tabs */}
                <nav className="flex items-stretch h-full">
                  <ul className="flex items-stretch h-full list-none m-0 p-0 gap-0">
                    <li className="flex items-stretch">
                      <button
                        onClick={() => navigate('/')}
                        className={`btn-header-custom ${isHomeActive ? 'active' : ''}`}
                      >
                        {t('header.home')}
                      </button>
                    </li>
                    <li className="flex items-stretch">
                      <button
                        onClick={() => openPopup('thematic')}
                        className={`btn-header-custom ${isQuizActive ? 'active' : ''}`}
                      >
                        {t('header.quiz')}
                      </button>
                    </li>
                    <li className="flex items-stretch">
                      <button
                        onClick={() => navigate('/about')}
                        className={`btn-header-custom ${isAboutActive ? 'active' : ''}`}
                      >
                        À propos
                      </button>
                    </li>
                    <li className="flex items-stretch">
                      <button
                        onClick={() => navigate('/contact')}
                        className={`btn-header-custom ${isContactActive ? 'active' : ''}`}
                      >
                        {t('header.contact')}
                      </button>
                    </li>
                  </ul>
                </nav>

              </div>

              {/* RIGHT — search + actions */}
              <div className="flex items-center gap-1">

                {/* Animated search pill + dropdown */}
                <div ref={desktopSearchRef} className="hdr-search-wrap">
                  <div className={`hdr-search-pill${desktopSearchOpen ? ' open' : ''}`}>
                    <button
                      onClick={() => desktopSearchOpen ? handleDesktopSearch() : setDesktopSearchOpen(true)}
                      className="hdr-search-icon-btn"
                      aria-label="Rechercher"
                    >
                      <FaSearch size={16} />
                    </button>
                    <form onSubmit={handleDesktopSearch} style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                      <input
                        ref={desktopInputRef}
                        type="text"
                        value={desktopSearchVal}
                        onChange={e => setDesktopSearchVal(e.target.value)}
                        placeholder="Rechercher un quiz..."
                        className="hdr-search-pill-input"
                        onKeyDown={e => { if (e.key === 'Escape') { setDesktopSearchOpen(false); setDesktopSearchVal(''); setSearchResults([]); } }}
                      />
                    </form>
                    {desktopSearchVal && (
                      <button
                        type="button"
                        className="hdr-search-clear"
                        onClick={() => { setDesktopSearchVal(''); setSearchResults([]); desktopInputRef.current?.focus(); }}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Instant results dropdown */}
                  {desktopSearchOpen && desktopSearchVal.trim() && (
                    <div className="hdr-sd">
                      {searchResults.length === 0 ? (
                        <div className="hdr-sd-empty">
                          Aucun résultat pour <em>"{desktopSearchVal}"</em>
                        </div>
                      ) : (
                        searchResults.map(t => (
                          <button
                            key={t.thematic_id}
                            className="hdr-sd-item"
                            onMouseDown={e => { e.preventDefault(); handleResultClick(t); }}
                          >
                            <div className="hdr-sd-icon-wrap">
                              <img
                                src={t.icon_url}
                                alt=""
                                className="hdr-sd-icon"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            </div>
                            <div className="hdr-sd-body">
                              <span className="hdr-sd-title">{t.thematic_title}</span>
                              <span className="hdr-sd-sub">
                                {t.sub_thematics?.length || 0} quiz · FunQuiz
                              </span>
                            </div>
                            <span className="hdr-sd-arrow">›</span>
                          </button>
                        ))
                      )}
                      <button className="hdr-sd-all" onMouseDown={e => { e.preventDefault(); handleDesktopSearch(); }}>
                        <FaSearch size={11} />
                        Tous les résultats pour <em>"{desktopSearchVal}"</em>
                      </button>
                    </div>
                  )}
                </div>

                {/* Info / Terms */}
                <button
                  onClick={() => navigate('/terms')}
                  className="hdr-icon-btn"
                  aria-label="Informations"
                >
                  <GrInfo size={17} />
                </button>

                {/* Points */}
                {isAuthenticated && (
                  <div className="points-badge mx-1">
                    <img src={piece} width={15} className="object-contain" alt="points" />
                    <span>{points.toLocaleString('fr-FR')}</span>
                  </div>
                )}

                {/* Avatar or login */}
                {isAuthenticated ? (
                  <div className="relative ml-1" ref={profileRef}>
                    <button
                      onClick={() => setProfileOpen(v => !v)}
                      className="avatar-btn"
                      aria-label="Profil"
                    >
                      <img
                        src={getAvatarSrc()}
                        className="w-full h-full object-cover"
                        alt="profil"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://img.freepik.com/photos-premium/image-photorealiste-hyper-realiste-fond-blanc-ai-generee-par-freepik_643360-530895.jpg?semt=ais_hybrid&w=740&q=80';
                        }}
                      />
                    </button>

                    {/* Profile dropdown */}
                    {profileOpen && (
                      <div className="profile-dropdown">

                        {/* ── Identity ── */}
                        <div className="pd-identity">
                          <img
                            src={getAvatarSrc()}
                            className="pd-avatar"
                            alt="profil"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://img.freepik.com/photos-premium/image-photorealiste-hyper-realiste-fond-blanc-ai-generee-par-freepik_643360-530895.jpg?semt=ais_hybrid&w=740&q=80'; }}
                          />
                          <div className="pd-identity-text">
                            <strong>{`${user?.first_name || ''} ${user?.name || ''}`.trim() || 'Joueur'}</strong>
                            <span>{user?.email || ''}</span>
                          </div>
                        </div>

                        {/* ── Points bar ── */}
                        <div className="pd-points-bar" onClick={() => { setProfileOpen(false); navigate('/raking'); }}>
                          <img src={piece} width={14} alt="points" />
                          <span className="pd-points-val">{points.toLocaleString('fr-FR')}</span>
                          <span className="pd-points-label">points</span>
                          <span className="pd-points-cta">Voir classement →</span>
                        </div>

                        {/* ── Manage button ── */}
                        <button
                          className="pd-manage-btn"
                          onClick={() => { setProfileOpen(false); navigate('/profil'); }}
                        >
                          Gérer votre compte
                        </button>

                        {/* ── Mon compte ── */}
                        <div className="pd-divider" />
                        <p className="pd-section-label">Mon compte</p>
                        <div className="pd-menu">
                          {[
                            { icon: <MdPerson size={19} />,        label: 'Mon profil',  path: '/profil?tab=overview' },
                            { icon: <MdSportsEsports size={19} />, label: 'Mes Quiz',    path: '/profil?tab=quizzes' },
                            { icon: <MdEmojiEvents size={19} />,   label: 'Succès',      path: '/profil?tab=achievements' },
                            { icon: <MdHistory size={19} />,       label: 'Historique',  path: '/profil?tab=history' },
                            { icon: <MdStar size={19} />,          label: 'Mes points',  path: '/profil?tab=overview' },
                          ].map(item => (
                            <button
                              key={item.label}
                              className="pd-menu-item"
                              onClick={() => { setProfileOpen(false); navigate(item.path); }}
                            >
                              <span className="pd-menu-icon">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                        </div>

                        {/* ── Explorer ── */}
                        <div className="pd-divider" />
                        <p className="pd-section-label">Explorer</p>
                        <div className="pd-menu">
                          {[
                            { icon: <MdLeaderboard size={19} />,  label: 'Classement',          path: '/raking' },
                            { icon: <FaSearch size={15} />,        label: 'Rechercher',           path: '/search' },
                            { icon: <MdCardGiftcard size={19} />, label: 'Offres & récompenses', path: '/raking' },
                          ].map(item => (
                            <button
                              key={item.label}
                              className="pd-menu-item"
                              onClick={() => { setProfileOpen(false); navigate(item.path); }}
                            >
                              <span className="pd-menu-icon">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                        </div>

                        {/* ── Paramètres & autres ── */}
                        <div className="pd-divider" />
                        <div className="pd-menu">
                          <button
                            className="pd-menu-item"
                            onClick={() => { setProfileOpen(false); navigate('/profil?tab=settings'); }}
                          >
                            <span className="pd-menu-icon"><MdSettings size={19} /></span>
                            Paramètres
                          </button>
                          <button
                            className="pd-menu-item"
                            onClick={() => { setProfileOpen(false); navigate('/contact'); }}
                          >
                            <span className="pd-menu-icon"><MdHeadsetMic size={19} /></span>
                            Aide &amp; Contact
                          </button>
                          <button
                            className="pd-menu-item pd-logout"
                            onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }}
                          >
                            <span className="pd-menu-icon"><MdLogout size={19} /></span>
                            Se déconnecter
                          </button>
                        </div>

                        {/* ── Footer ── */}
                        <div className="pd-footer">
                          <button onClick={() => { setProfileOpen(false); navigate('/terms#privacy'); }}>Confidentialité</button>
                          <span>·</span>
                          <button onClick={() => { setProfileOpen(false); navigate('/terms#cgu'); }}>Conditions</button>
                          <span>·</span>
                          <button onClick={() => { setProfileOpen(false); navigate('/about'); }}>À propos</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-wall-custom ml-1"
                  >
                    {t('header.login')}
                  </button>
                )}

              </div>
            </div>
          </header>

          {/* ══ Mobile Top Bar ══ */}
          <div className="mob-topbar lg:hidden">
            <button onClick={() => navigate('/')} className="mob-logo-btn">
              <img src={Logo} className="mob-logo-img" alt="FunQuiz" />
              <span className="mob-brand">Fun<span>Quiz</span></span>
            </button>
            <div className="mob-topbar-right">
              {isAuthenticated && (
                <div className="mob-points-pill">
                  <img src={piece} width={13} alt="pts" />
                  <span>{points.toLocaleString('fr-FR')}</span>
                </div>
              )}
              <button
                className="mob-burger"
                onClick={() => setMobMenuOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <span /><span /><span />
              </button>
            </div>
          </div>

          {/* ══ Mobile Full-Screen Overlay Menu ══ */}
          {mobMenuOpen && (
            <div className="mob-overlay" onClick={() => setMobMenuOpen(false)}>
              <div className="mob-panel" onClick={e => e.stopPropagation()}>

                {/* Panel header */}
                <div className="mob-panel-head">
                  <div className="mob-panel-logo">
                    <img src={Logo} width={32} alt="FunQuiz" />
                    <span className="mob-panel-brand">Fun<span>Quiz</span></span>
                  </div>
                  <button className="mob-close-btn" onClick={() => setMobMenuOpen(false)}>
                    <FaTimes size={18} />
                  </button>
                </div>

                {/* User info (if logged in) */}
                {isAuthenticated && (
                  <div className="mob-user-card" onClick={() => navigate('/profil')}>
                    <img src={getAvatarSrc()} alt="avatar" className="mob-user-avatar"
                      onError={e => { e.target.onerror = null; e.target.src = 'https://img.freepik.com/photos-premium/image-photorealiste-hyper-realiste-fond-blanc-ai-generee-par-freepik_643360-530895.jpg?semt=ais_hybrid&w=740&q=80'; }} />
                    <div className="mob-user-info">
                      <strong>{`${user?.first_name || ''} ${user?.name || ''}`.trim() || 'Joueur'}</strong>
                      <span>{user?.email || ''}</span>
                    </div>
                    <div className="mob-user-pts">
                      <img src={piece} width={14} alt="pts" />
                      <span>{points.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                )}

                {/* Nav items */}
                <nav className="mob-nav">
                  {[
                    { icon: <FaHome />,        label: 'Accueil',     action: () => navigate('/'),         active: !activePopup && location.pathname === '/', delay: 0 },
                    { icon: <FaGamepad />,      label: t('header.quiz'), action: () => openPopup('thematic'), active: activePopup === 'thematic',           delay: 60 },
                    { icon: <FaSearch />,       label: 'Recherche',   action: () => navigate('/search'),   active: location.pathname === '/search',          delay: 120 },
                    { icon: <FaTrophy />,       label: 'Classement',  action: () => navigate('/raking'),   active: location.pathname === '/raking',          delay: 180 },
                    { icon: <FaInfoCircle />,   label: 'À propos',    action: () => navigate('/about'),    active: location.pathname === '/about',           delay: 240 },
                    { icon: <FaEnvelope />,     label: t('header.contact'), action: () => navigate('/contact'), active: location.pathname === '/contact',    delay: 300 },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className={`mob-nav-item${item.active ? ' active' : ''}`}
                      style={{ animationDelay: `${item.delay}ms` }}
                      onClick={() => { setMobMenuOpen(false); item.action(); }}
                    >
                      <span className="mob-nav-icon">{item.icon}</span>
                      <span className="mob-nav-label">{item.label}</span>
                      <span className="mob-nav-arrow">›</span>
                    </button>
                  ))}
                </nav>

                {/* Footer actions */}
                <div className="mob-panel-footer">
                  {isAuthenticated ? (
                    <>
                      <button className="mob-footer-btn" onClick={() => { setMobMenuOpen(false); navigate('/profil?tab=settings'); }}>
                        <FaCog size={16} /> Paramètres
                      </button>
                      <button className="mob-footer-btn danger" onClick={() => { setMobMenuOpen(false); logout(); navigate('/login'); }}>
                        <FaSignOutAlt size={16} /> Déconnexion
                      </button>
                    </>
                  ) : (
                    <button className="mob-footer-btn cta" onClick={() => { setMobMenuOpen(false); navigate('/login'); }}>
                      <FaSignInAlt size={16} /> Se connecter
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ══ Mobile search bar on /search route ══ */}
      {isSearchRoute && (
        <div
          className="max-w-7xl mx-auto px-4 fixed top-0 right-0 left-0 pb-3 lg:hidden pt-4 z-40"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}
        >
          <form className="search-bar flex items-center relative" onSubmit={handleSearch} role="search">
            <input
              type="text"
              className="search-input w-full px-4 py-2.5 rounded-full text-sm"
              placeholder={t('header.searchPlaceholder')}
              value={search}
              onChange={handleSearchChange}
              ref={searchInputRef}
            />
            <button type="submit" className="search-btn absolute right-3.5">
              <FaSearch size={13} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
