import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaFileContract, FaUserShield, FaCookieBite,
  FaEnvelope, FaQuestionCircle, FaChevronDown,
} from 'react-icons/fa';

import cguServices           from '../../configurations/Services/cguServices.js';
import privacyPolicyServices from '../../configurations/Services/privacyPolicyServices.js';
import cookiesPolicyServices from '../../configurations/Services/cookiesPolicyServices.js';
import contactServices       from '../../configurations/Services/contactServices.js';
import faqServices           from '../../configurations/Services/faqService.js';
import wallTerms             from '../../../assets/wall_terms.png';
import './terms.css';

function Terms() {
  const [sections,       setSections]       = useState([]);
  const [activeSection,  setActiveSection]  = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [isMobile,       setIsMobile]       = useState(false);
  const [expandedItems,  setExpandedItems]  = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const icons = {
    cgu:     <FaFileContract />,
    privacy: <FaUserShield />,
    cookies: <FaCookieBite />,
    contact: <FaEnvelope />,
    faq:     <FaQuestionCircle />,
  };

  useEffect(() => {
    document.title = 'FUNQUIZ | Termes & Conditions';
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el      = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total    = el.scrollHeight - el.clientHeight;
      setScrollProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cgu, privacy, cookies, contact, faq] = await Promise.all([
          cguServices.getAll(),
          privacyPolicyServices.getAll(),
          cookiesPolicyServices.getAll(),
          contactServices.getAll(),
          faqServices.getAllFaq(),
        ]);

        const normalize = (resp) => (Array.isArray(resp) ? resp : []);

        const sortCguItems = (items) => {
          const norm    = (s) => String(s || '').toLowerCase();
          const orderOf = (title, idx) => {
            const t = norm(title);
            if (t.includes('préambule') || t.includes('preambule')) return 0;
            const m = t.match(/article\s*(\d+)/);
            if (m) { const n = parseInt(m[1], 10); return isNaN(n) ? 1000 + idx : n; }
            return 1000 + idx;
          };
          return items.map((it, idx) => ({ it, idx }))
            .sort((a, b) => orderOf(a.it?.title, a.idx) - orderOf(b.it?.title, b.idx))
            .map((x) => x.it);
        };

        const cguItemsSorted = sortCguItems(normalize(cgu));
        const privacyItems   = normalize(privacy);
        const cookiesItems   = normalize(cookies);
        const contactItems   = normalize(contact);
        const faqItems       = normalize(faq)
          .filter((f) => Number(f.is_active) === 1 || f.is_active === true || f.is_active === '1');

        const data = [
          {
            id: 'cgu', head: "Conditions Générales d'Utilisation",
            p: "Conditions et règles régissant l'utilisation de notre service.",
            icon: icons.cgu,
            items: cguItemsSorted.map((it) => ({
              id: it?.id ? `cgu-${it.id}` : undefined,
              title:   it?.title   || 'Sans titre',
              content: it?.content || 'Contenu indisponible.',
            })),
          },
          {
            id: 'privacy', head: 'Politique de Confidentialité',
            p: 'Comment nous collectons, utilisons et protégeons vos données personnelles.',
            icon: icons.privacy,
            items: privacyItems.map((it) => ({
              id: it?.id ? `privacy-${it.id}` : undefined,
              title:   it?.title   || 'Sans titre',
              content: it?.content || 'Contenu indisponible.',
            })),
          },
          {
            id: 'cookies', head: 'Politique des Cookies',
            p: 'Informations sur les cookies utilisés sur notre plateforme.',
            icon: icons.cookies,
            items: cookiesItems.map((it) => ({
              id: it?.id ? `cookies-${it.id}` : undefined,
              title:   it?.title   || 'Sans titre',
              content: it?.content || 'Contenu indisponible.',
            })),
          },
          {
            id: 'contact', head: 'Contact',
            p: 'Retrouvez tous les moyens de nous contacter.',
            icon: icons.contact,
            items: contactItems.map((it) => ({
              id: it?.id ? `contact-${it.id}` : undefined,
              title: it?.service || '',
              content: [
                it?.email   ? `${it.email}`    : null,
                it?.content ? ` ${it.content}` : null,
              ].filter(Boolean).join('\n') || 'Informations de contact indisponibles.',
            })),
          },
          {
            id: 'faq', head: 'Foire aux Questions',
            p: 'Réponses aux questions les plus fréquemment posées.',
            icon: icons.faq,
            items: faqItems.map((f) => ({
              id: (f?.faq_id ?? f?.id) ? `faq-${f.faq_id ?? f.id}` : undefined,
              title:   f?.question || 'Sans question',
              content: f?.answer   || 'Réponse indisponible.',
            })),
          },
        ];

        setSections(data);
        setActiveSection(data[0]);
      } catch {
        setError('Erreur lors du chargement des contenus.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const mql     = window.matchMedia('(max-width: 900px)');
    const handler = (e) => setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!sections || sections.length === 0) return;
    const hash         = (location.hash || '').replace('#', '').trim();
    const searchParams = new URLSearchParams(location.search || '');
    const qp           = (searchParams.get('section') || searchParams.get('tab') || '').trim();
    let key = '';
    if (hash) key = hash.split('-')[0];
    else if (qp) key = qp;
    if (!key) { setActiveSection((prev) => prev || sections[0] || null); return; }
    const found = sections.find((s) => s.id === key);
    setActiveSection(found || null);
  }, [location.hash, location.search, sections]);

  useEffect(() => {
    const hash = (location.hash || '').replace('#', '').trim();
    if (isMobile && hash && hash.includes('-')) {
      setExpandedItems((prev) => ({ ...prev, [hash]: true }));
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isMobile, location.hash]);

  const goTo = (section) => {
    navigate(`/terms#${section.id}`);
    setActiveSection(section);
    setExpandedItems({});
  };

  const toggleItem = (id) => {
    if (!id) return;
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="tm-page">

      {/* ── SCROLL PROGRESS ── */}
      <div className="tm-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ── HERO ── */}
      <header className="tm-hero" style={{ backgroundImage: `url(${wallTerms})` }}>
        <div className="tm-hero-overlay" />
        <div className="tm-hero-content">
          <p className="tm-hero-eyebrow">Documents légaux · FUNQUIZ</p>
          <h1 className="tm-hero-title">
            Termes &amp; <span>Conditions</span>
          </h1>
          <p className="tm-hero-sub">
            Retrouvez l&rsquo;ensemble de nos documents légaux : conditions d&rsquo;utilisation,
            politique de confidentialité, gestion des cookies et plus encore.
          </p>
          {/* Quick jump pills */}
          {sections.length > 0 && (
            <div className="tm-hero-pills">
              {sections.map((s) => (
                <button key={s.id} className="tm-hero-pill" onClick={() => goTo(s)}>
                  <span className="tm-hero-pill-icon">{s.icon}</span>
                  {s.head}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE TAB STRIP ── */}
      <div className="tm-tabstrip" role="tablist">
        {sections.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={activeSection?.id === s.id}
            className={`tm-tab ${activeSection?.id === s.id ? 'active' : ''}`}
            onClick={() => goTo(s)}
          >
            <span className="tm-tab-icon">{s.icon}</span>
            <span className="tm-tab-label">{s.head}</span>
            {s.items?.length > 0 && (
              <span className="tm-tab-count">{s.items.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="tm-layout">

        {/* Sidebar */}
        <aside className="tm-sidebar">
          <p className="tm-sidebar-label">Documents</p>
          <nav>
            {sections.map((s) => (
              <button
                key={s.id}
                className={`tm-sidebar-btn ${activeSection?.id === s.id ? 'active' : ''}`}
                onClick={() => goTo(s)}
              >
                <span className="tm-sidebar-icon">{s.icon}</span>
                <span className="tm-sidebar-text">{s.head}</span>
                {s.items?.length > 0 && (
                  <span className="tm-sidebar-count">{s.items.length}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="tm-main">

          {/* Loading skeleton */}
          {loading && (
            <div className="tm-skeleton">
              <div className="tm-skel-head" />
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="tm-skel-card">
                  <div className="tm-skel-line short" />
                  <div className="tm-skel-line" />
                  <div className="tm-skel-line mid" />
                  <div className="tm-skel-block" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && <div className="tm-error">{error}</div>}

          {/* Content */}
          {!loading && activeSection && (
            <div className="tm-section-wrap" key={activeSection.id}>

              {/* Section header */}
              <div className="tm-section-head">
                <div className="tm-section-icon">{activeSection.icon}</div>
                <div className="tm-section-info">
                  <h1 className="tm-section-title">{activeSection.head}</h1>
                  <p className="tm-section-desc">{activeSection.p}</p>
                </div>
                {activeSection.items?.length > 0 && (
                  <div className="tm-section-badge">
                    {activeSection.items.length} article{activeSection.items.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Items list */}
              <div className="tm-items">
                {activeSection.items?.length > 0
                  ? activeSection.items.map((it, idx) => {
                      const itemId = it.id || `${activeSection.id}-${idx}`;
                      const isOpen = !isMobile || !!expandedItems[itemId];
                      return (
                        <div
                          key={itemId}
                          id={itemId}
                          className={`tm-item ${isMobile ? 'accordion' : ''} ${isOpen ? 'open' : ''}`}
                          style={{ animationDelay: `${idx * 0.04}s` }}
                        >
                          <button
                            className="tm-item-head"
                            onClick={() => isMobile && toggleItem(itemId)}
                            aria-expanded={isOpen}
                          >
                            <span className="tm-item-num">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="tm-item-title">{it.title}</span>
                            {isMobile && (
                              <FaChevronDown
                                className={`tm-item-arrow ${isOpen ? 'open' : ''}`}
                              />
                            )}
                          </button>
                          <div
                            className={`tm-item-body ${isOpen ? 'show' : 'hide'}`}
                            style={{ whiteSpace: 'pre-line' }}
                          >
                            {it.content}
                          </div>
                        </div>
                      );
                    })
                  : (
                    <div className="tm-empty">
                      <span className="tm-empty-icon">📄</span>
                      <p>Aucun contenu disponible pour cette section.</p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Terms;
