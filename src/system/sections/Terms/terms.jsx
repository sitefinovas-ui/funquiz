import { useState, useEffect } from 'react';
import './terms.css';

import cguServices from '../../configurations/Services/cguServices.js';
import privacyPolicyServices from '../../configurations/Services/privacyPolicyServices.js';
import cookiesPolicyServices from '../../configurations/Services/cookiesPolicyServices.js';
import contactServices from '../../configurations/Services/contactServices.js';
import faqServices from '../../configurations/Services/faqService.js';

function Terms() {
  const [activeSection, setActiveSection] = useState('cgu');
  const [cguList, setCguList] = useState([]);
  const [privacyList, setPrivacyList] = useState([]);
  const [cookiesList, setCookiesList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [faqList, setFaqList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger toutes les politiques
  useEffect(() => {
    const loadPolicies = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cguRows, privacyRows, cookiesRows, contactRows, faqRows] = await Promise.all([
          cguServices.getAll(),
          privacyPolicyServices.getAll(),
          cookiesPolicyServices.getAll(),
          contactServices.getAll(),
          faqServices.getAllFaq(),
        ]);

        const normalize = (resp) => {
          if (Array.isArray(resp)) return resp;
          if (resp?.data && Array.isArray(resp.data)) return resp.data;
          if (resp?.rows && Array.isArray(resp.rows)) return resp.rows;
          if (resp?.results && Array.isArray(resp.results)) return resp.results;
          return [];
        };

        setCguList(normalize(cguRows));
        setPrivacyList(normalize(privacyRows));
        setCookiesList(normalize(cookiesRows));
        setContactList(normalize(contactRows));
        setFaqList(normalize(faqRows));
      } catch (e) {
        const msg = e?.response?.data?.error || e.message || 'Erreur réseau';
        setError(`Impossible de charger les contenus : ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  // Divise le contenu en paragraphes
  const splitParagraphs = (text) => {
    if (!text) return [];
    return String(text)
      .split(/\n{2,}|\.\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  // Formate les dates
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Rendu du contenu
  const renderSectionContent = (content) => {
    if (Array.isArray(content)) {
      return content.map((paragraph, index) => (
        <p key={`arr-${index}`} className="terms-paragraph">
          {paragraph}
        </p>
      ));
    }
    if (typeof content === 'string') {
      const paras = splitParagraphs(content);
      return paras.map((paragraph, index) => (
        <p key={`str-${index}`} className="terms-paragraph">
          {paragraph}
        </p>
      ));
    }
    return null;
  };

  // Construction des sections
  const sections = [
    // CGU
    ...cguList.map((row) => ({
      id: `cgu-${row.id}`,
      title: row.title || "Conditions Générales d'Utilisation",
      icon: '',
      color: '#3b82f6',
      content: row.content || '',
    })),

    // Politique de confidentialité
    ...privacyList.map((row) => ({
      id: `privacy-${row.id}`,
      title: row.title || 'Politique de confidentialité',
      icon: '',
      color: '#8b5cf6',
      content: row.content || '',
    })),

    // Politique des cookies
    ...cookiesList.map((row) => ({
      id: `cookies-${row.id}`,
      title: row.title || 'Politique des cookies',
      icon: '',
      color: '#ec4899',
      content: row.content || '',
    })),

    // Contact (filtrer uniquement ceux opérationnels)
    ...contactList
      .filter((row) => !row.status || row.status === 'operationnel')
      .map((row) => ({
        id: `contact-${row.id}`,
        title: row.service || 'Contact',
        icon: '',
        color: '#06b6d4',
        content: [
          ...splitParagraphs(row.content || ''),
          row.email ? `📧 Email : ${row.email}` : '',
          row.created_at ? `🕓 Créé le ${formatDate(row.created_at)}` : '',
        ],
      })),

    // FAQ (uniquement actives)
    ...faqList
      .filter((f) => Number(f.is_active) === 1)
      .map((f) => ({
        id: `faq-${f.faq_id}`,
        title: f.question || 'FAQ',
        icon: '',
        color: '#f59e0b',
        content: f.answer || '',
      })),
  ];

  // Gestion du scroll actif
  // (À retirer complètement) Ancien effet qui changeait l'active au scroll
  // useEffect(() => {
  //   const handleScroll = () => {
  //     const sectionsEls = document.querySelectorAll('section[id]');
  //     let current = sections.length ? sections[0].id : 'cgu';
  //     const offset = window.innerWidth < 900 ? 80 : 120;
  //     sectionsEls.forEach((section) => {
  //       const rect = section.getBoundingClientRect();
  //       if (rect.top <= offset && rect.bottom >= offset) {
  //         current = section.id;
  //       }
  //     });
  //     setActiveSection(current);
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   handleScroll();
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [sections]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y =
        el.getBoundingClientRect().top + window.scrollY - (window.innerWidth < 900 ? 60 : 100);
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const heroTitle = 'Tous les termes et conditions';

  return (
    <div className="terms-app dark-theme">
      {/* HERO HEADER */}
      <div className="terms-hero">
        <div className="params">
          <h1>{heroTitle}</h1>
          <p>Découvrez nos engagements et vos droits en toute transparence</p>
        </div>
      </div>

      <div className="terms-layout position-relative">
        {/* NAVIGATION */}
        <div className="terms-nav">
          <nav
            className="h-terms-nav d-flex flex-row flex-lg-column flex-nowrap gap-2 align-items-stretch"
            aria-label="Navigation sections"
            style={{
              top: 0,
              zIndex: 1000,
              WebkitOverflowScrolling: 'touch',
              overflowX: 'hidden',
              overscrollBehavior: 'none',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(6px)',
              padding: '1rem',
            }}
          >
            <h2 className="terms-nav-title text-start mb-4 text-secondary text-uppercase fs-6 d-none d-lg-block">
              Navigation
            </h2>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`terms-nav-item ${activeSection === section.id ? 'active' : ''} rounded-pill text-truncate`}
                title={section.title}
                aria-label={section.title}
                aria-current={activeSection === section.id ? 'page' : undefined}
                tabIndex={0}
                style={{ maxWidth: '80vw' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveSection(section.id);
                  }
                }}
              >
                <span aria-hidden="true">{section.icon}</span>{' '}
                <span className="text-capitalize" style={{ marginLeft: 8 }}>
                  {section.title}
                </span>
              </button>
            ))}
          </nav>
        </div>
        {/* CONTENU */}
        <div className="terms-content">
          {loading && <div className="p-4 text-muted">Chargement des contenus...</div>}
          {error && <div className="p-4 text-danger">⚠️ {error}</div>}
          {!loading &&
            !error &&
            sections.map(({ id, icon, title, content }) => (
              <section
                key={id}
                id={id}
                className={`terms-section ${activeSection === id ? 'active' : ''}`}
              >
                <div className="terms-section-header">
                  <span className="terms-section-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <h2 className="terms-section-title text-capitalize">{title}</h2>
                </div>
                <div className="terms-section-content">{renderSectionContent(content)}</div>
              </section>
            ))}

          <footer className="terms-footer">
            <div>
              Dernière mise à jour :{' '}
              {new Date().toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <a
              href="/contact"
              className="terms-contact-button border-0 text-light"
              aria-label="Contacter le support FunQuiz"
            >
              Nous contacter
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Terms;
