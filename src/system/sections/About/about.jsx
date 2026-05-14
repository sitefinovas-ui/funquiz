import React, { useEffect, useState } from 'react';
import './about.css';
import aboutServices from '../../configurations/Services/aboutServices.js';

function About() {
  const [aboutList, setAboutList] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    document.title = 'FUNQUIZ | À propos';
    aboutServices.getAll()
      .then(list => {
        const publishedOnly = (Array.isArray(list) ? list : []).filter(item => item.status === 'published');
        const sorted = publishedOnly.sort((a, b) =>
          new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)
        );
        setAboutList(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="ab-page">
      <div className="ab-loading">Chargement…</div>
    </div>
  );

  if (!aboutList.length) return (
    <div className="ab-page">
      <div className="ab-loading">Aucune donnée disponible.</div>
    </div>
  );

  return (
    <div className="ab-page">
      {aboutList.map((item, idx) => (
        <div key={item.id || idx}>

          {/* ── HERO ── */}
          <div className="ab-hero">
            <p className="ab-hero-eyebrow">À propos</p>
            <h1 className="ab-hero-title">
              {item.title || 'FunQuiz'}
            </h1>
            {item.subtitle && (
              <p className="ab-hero-sub">{item.subtitle}</p>
            )}
          </div>

          {/* ── CONTENT ── */}
          <div className="ab-content">

            {/* Description */}
            {item.description && (
              <div className="ab-desc-card">
                <p className="ab-desc-eyebrow">Notre histoire</p>
                <h2 className="ab-desc-heading">À propos de FunQuiz</h2>
                <p className="ab-desc-text">{item.description}</p>
                <p className="ab-desc-quote">
                  "Apprendre peut être une aventure — FunQuiz le prouve chaque jour."
                </p>
              </div>
            )}

            {/* Mission & Vision */}
            {(item.mission || item.vision) && (
              <div className="ab-mv-row">
                {item.mission && (
                  <div className="ab-mv-card">
                    <span className="ab-mv-label">Mission</span>
                    <h3 className="ab-mv-heading">Ce que nous faisons</h3>
                    <p className="ab-mv-text">{item.mission}</p>
                  </div>
                )}
                {item.vision && (
                  <div className="ab-mv-card">
                    <span className="ab-mv-label">Vision</span>
                    <h3 className="ab-mv-heading">Là où nous allons</h3>
                    <p className="ab-mv-text">{item.vision}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact band */}
            <div className="ab-contact">
              <div className="ab-contact-left">
                <p className="ab-contact-eyebrow">Support</p>
                <h2 className="ab-contact-heading">
                  Une question ?<br />On vous répond.
                </h2>
              </div>
              <div className="ab-contact-right">
                <p className="ab-contact-sub">
                  Notre équipe est disponible du lundi au vendredi, de 9h à 18h.
                  Chaque message reçoit une réponse en moins de 24h.
                </p>
                {item.contact_email ? (
                  <a href={`mailto:${item.contact_email}`} className="ab-email-btn">
                    Nous écrire
                  </a>
                ) : (
                  <span className="ab-email-missing">Email non disponible</span>
                )}
                {(item.updated_at || item.created_at) && (
                  <p className="ab-date">
                    Mis à jour le {new Date(item.updated_at || item.created_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default About;
