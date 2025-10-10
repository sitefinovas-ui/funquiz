import React, { useEffect, useState } from 'react';
import './about.css';
import aboutServices from '../../configurations/Services/aboutServices.js';

function About() {
  const [aboutList, setAboutList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const list = await aboutServices.getAll();
        const sorted = (Array.isArray(list) ? list : []).sort((a, b) => {
          const da = new Date(a.updated_at || a.created_at || 0);
          const db = new Date(b.updated_at || b.created_at || 0);
          return db - da;
        });
        setAboutList(sorted);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAbout();
  }, []);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!aboutList.length) {
    return <div className="loading">Aucune donnée disponible.</div>;
  }

  return (
    <div className="about-pagee">
      {aboutList.map((item, idx) => (
        <div key={item.id || idx}>
          {/* Header */}
          <div className="headerr">
            <h1 className=''>{item.title }</h1>
            {item.subtitle && <p className="subtitlee">{item.subtitle}</p>}
          </div>

          {/* Description */}
          <div className="sectionn text-light">
            <h2>Qui sommes-nous ?</h2>
            <p>{item.description }</p>
          </div>

          {/* Mission et Vision */}
          <div className="sectionn gray">
            <div className="gridd">
              <div className="card">
                <h3>Notre Mission</h3>
                <p>{item.mission }</p>
              </div>
              <div className="card">
                <h3>Notre Vision</h3>
                <p>{item.vision }</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="sectionn dark mb-5">
            <h2>Contactez-nous</h2>
            {item.contact_email ? (
              <a href={`mailto:${item.contact_email}`} className="btn-about">
                {item.contact_email}
              </a>
            ) : (
              <button className="btn" disabled>Email non disponible</button>
            )}
            <p className="datee">
              Mis à jour le {item.updated_at || item.created_at
                ? new Date(item.updated_at || item.created_at).toLocaleDateString('fr-FR')
                : '—'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default About;