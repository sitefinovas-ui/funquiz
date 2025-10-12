import { useState, useEffect } from 'react';
import './terms.css';

import {
  FaFileContract,   // CGU
  FaUserShield,     // Politique de confidentialité
  FaCookieBite,     // Politique des cookies
  FaEnvelope,       // Contact
  FaQuestionCircle, // FAQ
} from 'react-icons/fa';

// Les services d'API (supposés importés correctement)
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

  // Définir les icônes de manière centrale
  const sectionIcons = {
    cgu: <FaFileContract />,
    privacy: <FaUserShield />,
    cookies: <FaCookieBite />,
    contact: <FaEnvelope />,
    faq: <FaQuestionCircle />,
  };

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
    // Diviser par au moins deux retours à la ligne consécutifs, ou un point suivi d'un espace.
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

  // Construction des sections avec les icônes
  const sections = [
    // CGU
    ...cguList.map((row, index) => ({
      id: `cgu-${row.id || index}`,
      title: row.title || 'Conditions Générales',
      icon: sectionIcons.cgu, // <== AJOUT DE L'ICÔNE
      color: '#3b82f6',
      content: row.content || '',
    })),

    // Politique de confidentialité
    ...privacyList.map((row, index) => ({
      id: `privacy-${row.id || index}`,
      title: row.title || 'Politique de Confidentialité',
      icon: sectionIcons.privacy, // <== AJOUT DE L'ICÔNE
      color: '#8b5cf6',
      content: row.content || '',
    })),

    // Politique des cookies
    ...cookiesList.map((row, index) => ({
      id: `cookies-${row.id || index}`,
      title: row.title || 'Politique des Cookies',
      icon: sectionIcons.cookies, // <== AJOUT DE L'ICÔNE
      color: '#ec4899',
      content: row.content || '',
    })),

    // Contact (filtrer uniquement ceux opérationnels)
    ...contactList
      .filter((row) => !row.status || row.status === 'operationnel')
      .map((row, index) => ({
        id: `contact-${row.id || index}`,
        title: row.service || 'Contact',
        icon: sectionIcons.contact, // <== AJOUT DE L'ICÔNE
        color: '#06b6d4',
        content: [
          ...splitParagraphs(row.content || 'Vous pouvez nous contacter via les informations suivantes :'),
          row.email ? `📧 Email : ${row.email}` : '',
          row.created_at ? `🕓 Créé le ${formatDate(row.created_at)}` : '',
        ],
      })),

    // FAQ (uniquement actives)
    ...faqList
      .filter((f) => Number(f.is_active) === 1)
      .map((f, index) => ({
        id: `faq-${f.faq_id || index}`,
        title: f.question || 'FAQ',
        icon: sectionIcons.faq, // <== AJOUT DE L'ICÔNE
        color: '#f59e0b',
        content: f.answer || 'Réponse en attente...',
      })),
  ];

  // Fonction pour faire défiler (scroll) vers la section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      // Ajustement de l'offset pour laisser de l'espace pour la barre de nav fixe
      const offset = window.innerWidth < 900 ? 80 : 120;
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  
  // Gérer le changement de section et le scroll
  const handleSetActiveSection = (id) => {
    setActiveSection(id);
    scrollToSection(id);
  };

  // Gestion du scroll pour maintenir la navigation active (rétabli)
  useEffect(() => {
    const handleScroll = () => {
      const sectionsEls = document.querySelectorAll('section[id]');
      // Par défaut, la première section si disponible, sinon l'état initial 'cgu'
      let current = sections.length ? sections[0].id : 'cgu'; 
      const offset = window.innerWidth < 900 ? 80 : 120;
      
      sectionsEls.forEach((section) => {
        const rect = section.getBoundingClientRect();
        // Détecte si le haut de la section est au niveau de l'offset (proche du haut de l'écran)
        if (rect.top <= offset && rect.bottom >= offset) {
          current = section.id;
        }
      });
      
      // Mise à jour de l'état uniquement si nécessaire
      if (current !== activeSection) {
        setActiveSection(current);
      }
    };
    
    // Ajoute l'écouteur de scroll
    window.addEventListener('scroll', handleScroll);
    // Exécute une première fois pour définir l'état initial
    handleScroll();
    
    // Nettoyage lors du démontage du composant
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections.length, activeSection]); // Dépendance à sections.length pour réexécuter si le contenu charge

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
        {/* NAVIGATION FIXE / COLLANTE */}
        <div className="terms-nav">
          <nav
            className="h-terms-nav"
            aria-label="Navigation sections"
          >
            <h2 className="terms-nav-title text-start mb-4 text-secondary text-uppercase fs-6 d-none d-lg-block">
              Navigation
            </h2>
            {sections.map((section) => (
              <button
                key={section.id}
                // Correction: utilisation du handleSetActiveSection pour scroll + mettre à jour l'état
                onClick={() => handleSetActiveSection(section.id)}
                className={`terms-nav-item ${activeSection === section.id ? 'active' : ''} rounded-pill text-truncate`}
                title={section.title}
                aria-label={section.title}
                aria-current={activeSection === section.id ? 'page' : undefined}
                tabIndex={0}
                style={{ maxWidth: '80vw' }}
              >
                <span aria-hidden="true">{section.icon}</span>{' '}
                <span className="text-capitalize" style={{ marginLeft: 8 }}>
                  {section.title}
                </span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* CONTENU PRINCIPAL */}
        <div className="terms-content">
          {loading && <div className="p-4 text-muted">Chargement des contenus...</div>}
          {error && <div className="p-4 text-danger">⚠️ {error}</div>}
          
          {!loading &&
            !error &&
            sections.map(({ id, icon, title, content }) => (
              // Note: Le composant affiche TOUTES les sections, et le CSS s'occupe de la mise en page.
              <section
                key={id}
                id={id}
                className="terms-section"
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
              aria-label="Contacter le support"
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