import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaFileContract,
  FaUserShield,
  FaCookieBite,
  FaEnvelope,
  FaQuestionCircle,
} from 'react-icons/fa';

import cguServices from '../../configurations/Services/cguServices.js';
import privacyPolicyServices from '../../configurations/Services/privacyPolicyServices.js';
import cookiesPolicyServices from '../../configurations/Services/cookiesPolicyServices.js';
import contactServices from '../../configurations/Services/contactServices.js';
import faqServices from '../../configurations/Services/faqService.js';
import './terms.css';

function Terms() {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const icons = {
    cgu: <FaFileContract />,
    privacy: <FaUserShield />,
    cookies: <FaCookieBite />,
    contact: <FaEnvelope />,
    faq: <FaQuestionCircle />,
  };

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

        const cguItems = normalize(cgu);
        // Tri CGU: Préambule (ou Preambule) en premier puis Article 1..n
        const sortCguItems = (items) => {
          const norm = (s) => String(s || '').toLowerCase();
          const orderOf = (title, idx) => {
            const t = norm(title);
            if (t.includes('préambule') || t.includes('preambule')) return 0;
            const m = t.match(/article\s*(\d+)/);
            if (m) {
              const n = parseInt(m[1], 10);
              return isNaN(n) ? 1000 + idx : n;
            }
            return 1000 + idx; // éléments non reconnus à la fin
          };
          return items
            .map((it, idx) => ({ it, idx }))
            .sort((a, b) => orderOf(a.it?.title, a.idx) - orderOf(b.it?.title, b.idx))
            .map((x) => x.it);
        };
        const cguItemsSorted = sortCguItems(cguItems);
        const privacyItems = normalize(privacy);
        const cookiesItems = normalize(cookies);
        const contactItems = normalize(contact);
        const faqItems = normalize(faq)
          .filter((f) => Number(f.is_active) === 1 || f.is_active === true || f.is_active === '1');

        const data = [
          {
            id: 'cgu',
            head: 'Conditions Générales d’Utilisation',
            p:'Découvrez nos conditions et politiques afin d’assurer une utilisation claire et sécurisée de notre service.',
            title: cguItems[0]?.title ,
            icon: icons.cgu,
            items: cguItemsSorted.map((it) => ({
              id: it?.id ? `cgu-${it.id}` : undefined,
              title: it?.title || 'Sans titre',
              content: it?.content || 'Contenu indisponible.',
            })),
          },
          {
            id: 'privacy',
            head: 'Politique de Confidentialité',
            p:'Découvrez nos conditions et politiques afin d’assurer une utilisation claire et sécurisée de notre service.',
            title: privacyItems[0]?.title || 'Politique de Confidentialité',
            icon: icons.privacy,
            items: privacyItems.map((it) => ({
              id: it?.id ? `privacy-${it.id}` : undefined,
              title: it?.title || 'Sans titre',
              content: it?.content || 'Contenu indisponible.',
            })),
          },
          {
            id: 'cookies',
            head: 'Politique des Cookies',
            p:'Découvrez nos politique de cookies afin d’assurer une utilisation claire et sécurisée de notre service.',
            title: cookiesItems[0]?.title || 'Politique des Cookies',
            icon: icons.cookies,
            items: cookiesItems.map((it) => ({
              id: it?.id ? `cookies-${it.id}` : undefined,
              title: it?.title || 'Sans titre',
              content: it?.content || 'Contenu indisponible.',
            })),
          },
          {
            id: 'contact',
            head: 'Contact',
            p:'Retrouvez tous les moyens de nous contacter.',
            title: contactItems[0]?.title,
            icon: icons.contact,
            items: contactItems.map((it) => ({
              id: it?.id ? `contact-${it.id}` : undefined,
              title: it?.service || '',
              content: [
                it?.email ? `${it.email}` : null,
                it?.content ? ` ${it.content}` : null,
              ].filter(Boolean).join('\n') || 'Informations de contact indisponibles.',
            })),
          },
          {
            id: 'faq',
            head: 'Foire aux Questions',
            p:'Retrouvez toutes les réponses aux questions fréquentes.',
            title: 'Foire aux Questions',
            icon: icons.faq,
            items: faqItems.map((f) => ({
              id: (f?.faq_id ?? f?.id) ? `faq-${f.faq_id ?? f.id}` : undefined,
              title: f?.question || 'Sans question',
              content: f?.answer || 'Réponse indisponible.',
            })),
          },
        ];
        setSections(data);
        setActiveSection(data[0]);
      } catch (e) {
        setError('Erreur lors du chargement des contenus.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Détecter le viewport mobile pour activer l'accordéon et la navigation adaptée
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 900px)');
    const handler = (e) => setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Sélectionner la section depuis l'URL (hash ou query param)
  useEffect(() => {
    if (!sections || sections.length === 0) return;

    const hash = (location.hash || '').replace('#', '').trim();
    const searchParams = new URLSearchParams(location.search || '');
    const qp = (searchParams.get('section') || searchParams.get('tab') || '').trim();

    // Priorité au hash, sinon query param
    let key = '';
    if (hash) {
      key = hash.split('-')[0]; // gère faq-123 -> faq
    } else if (qp) {
      key = qp;
    }

    if (!key) {
      setActiveSection((prev) => prev || sections[0] || null);
      return;
    }

    const found = sections.find((s) => s.id === key);
    setActiveSection(found || null);
  }, [location.hash, location.search, sections]);

  // Ouvrir automatiquement l'item ciblé par l'ancre (ex: faq-123) en mobile
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

  const toggleItem = (id) => {
    if (!isMobile || !id) return;
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="terms-container">
      <div className="terms-header text-center">
        <h1 className="text-head">Termes et Conditions</h1>
        <p className="text-center text-mobile">
          Découvrez nos conditions et politiques afin d’assurer une
          utilisation claire et sécurisée de notre service.
        </p>
      </div>
      <div className="terms-layout d-flex container">
        {/* Sidebar */}
        <aside className="sidebar ">
          <h2 className="sidebar-title text-secondary mb-4">Documents</h2>
          <nav className="sidebar-menu d-flex flex-column gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`sidebar-item rounded-pill px-3 py-2 align-items-center gap-2 d-flex justify-content-start ${
                  activeSection?.id === section.id ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(`/terms#${section.id}`);
                  setActiveSection(section);
                }}
              >
                <span className="sidebar-icon">{section.icon}</span>
                {section.head}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="terms-content">
          <header className="content-header ">
            <h1 className="text-mobile">{activeSection?.head || 'Termes et Conditions'}</h1>
            <p className="w-100 text-mobile">
              {activeSection?.p || 'Découvrez nos conditions et politiques afin d’assurer une utilisation claire et sécurisée de notre service.'}
            </p>
          </header>

          {/* Navigation mobile (sélecteur) */}
          <div className="mobile-nav">
            <label htmlFor="terms-section-select" className="sr-only">Section</label>
            <select
              id="terms-section-select"
              className="mobile-select border border-dark"
              value={activeSection?.id || ''}
              onChange={(e) => {
                const key = e.target.value;
                const found = sections.find((s) => s.id === key);
                navigate(`/terms#${key}`);
                setActiveSection(found || null);
              }}
            >
              {sections.map((section) => (
                <option className="text-dark bg-transparent" key={section.id} value={section.id}>
                  {section.head}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="content-body">
              <div className="skeleton">
                <div className="skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-block" />
              </div>
            </div>
          )}
          {error && <p className="error">{error}</p>}

          {!loading && sections.length > 0 && (
            <div className="content-list">
              {activeSection
                ? (
                  <article key={activeSection.id} id={activeSection.id} className="content-body">
                   
                    <div className="section-items">
                      {(activeSection.items && activeSection.items.length > 0)
                        ? activeSection.items.map((it, idx) => {
                            const itemId = it.id || `${activeSection.id}-${idx}`;
                            const isOpen = !isMobile || !!expandedItems[itemId];
                            return (
                              <div key={itemId} id={itemId} className={`section-item ${isMobile ? 'accordion' : ''}`}>
                                <h3
                                  className="item-title bg-dark rounded-pill py-2 px-3 bg-opacity-75 text-nowrap mt-3"
                                  onClick={() => toggleItem(itemId)}
                                  role={isMobile ? 'button' : undefined}
                                  aria-expanded={isOpen}
                                >
                                  {it.title}
                                </h3>
                                <div
                                  className={`item-content ps-2 text-justify ${isOpen ? 'show' : 'hide'}`}
                                  style={{ whiteSpace: 'pre-line' }}
                                >
                                  {it.content}
                                </div>
                              </div>
                            );
                          })
                        : (
                            <div className="item-content" style={{ whiteSpace: 'pre-line' }}>
                              Contenu indisponible.
                            </div>
                          )}
                    </div>
                  </article>
                )
                : (
                  sections.map((section) => (
                    <article key={section.id} id={section.id} className="content-body">
                      <h2 className="content-title">{section.titlee}</h2>
                      <div className="section-items">
                        {(section.items && section.items.length > 0)
                          ? section.items.map((it, idx) => (
                              <div key={it.id || idx} id={it.id} className="section-item">
                                <h3 className="item-title">{it.title}</h3>
                                <div className="item-content" style={{ whiteSpace: 'pre-line' }}>{it.content}</div>
                              </div>
                            ))
                          : (
                              <div className="item-content" style={{ whiteSpace: 'pre-line' }}>
                                Contenu indisponible.
                              </div>
                            )}
                      </div>
                    </article>
                  ))
                )}
            </div>
          )}

          
        </main>
      </div>
    </div>
  );
}

export default Terms;
