import './listThematic.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import thematicService from '../../configurations/Services/thematicServices.js';
import countryServices from '../../configurations/Services/countryServices.js';

function Thematic({ closePopup, highlightThematicId }) {
  const [thematics, setThematics] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [search, setSearch] = useState('');
  const navigate  = useNavigate();
  const gridRef   = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [thematicData, countryData] = await Promise.all([
          thematicService.getAllThematics(),
          countryServices.getAll()
        ]);
        setThematics(thematicData);
        setCountries(countryData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!highlightThematicId) return;
    const el = document.getElementById(`thematic-${highlightThematicId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightThematicId, thematics]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => closePopup?.(), 260);
  };

  const handleSubThematicClick = (sub, thematic) => {
    navigate('/step', {
      state: {
        questions: sub.questions || [],
        subTitle: sub.title,
        thematicTitle: thematic.thematic_title,
      },
    });
  };

  const scrollCarousel = (dir) => {
    gridRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  const activeCountryCodes = countries.filter(c => c.is_active).map(c => c.code);

  const filtered = thematics.filter((t) => {
    const codes = Array.isArray(t.country_codes) && t.country_codes.filter(Boolean).length
      ? t.country_codes.filter(Boolean)
      : [t.country_code || 'CI'];
    const isFromActiveCountry = codes.some(code => activeCountryCodes.includes(code));
    if (!isFromActiveCountry) return false;

    return (
      t.thematic_title.toLowerCase().includes(search.toLowerCase()) ||
      (t.sub_thematics || []).some((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className={`th-backdrop ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`th-panel ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="th-header">
          <div className="th-header-left">
            <div className="th-header-icon">🎮</div>
            <div>
              <h2 className="th-title">Toutes les thématiques</h2>
              <p className="th-subtitle">Choisissez un univers et lancez-vous</p>
            </div>
          </div>
          <button className="th-close-btn" onClick={handleClose} aria-label="Fermer">✕</button>
        </div>

        {/* Toolbar */}
        <div className="th-toolbar">
          <div className="th-search">
            <span className="th-search-icon">🔍</span>
            <input
              type="text"
              className="th-search-input"
              placeholder="Rechercher une thématique..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="th-search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <span className="th-count-label">
            {filtered.length} thématique{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Body */}
        <div className="th-body">
          {filtered.length === 0 ? (
            <div className="th-empty">Aucune thématique pour « {search} »</div>
          ) : (
            <div className="th-carousel-wrap">
              {/* Prev */}
              <button
                className="th-nav-btn th-nav-prev"
                onClick={() => scrollCarousel(-1)}
                aria-label="Précédent"
              >
                ‹
              </button>

              {/* Cards */}
              <div className="th-grid" ref={gridRef}>
                {filtered.map((thematic, idx) => (
                  <div
                    key={thematic.thematic_id}
                    id={`thematic-${thematic.thematic_id}`}
                    className={`th-card ${highlightThematicId === thematic.thematic_id ? 'highlighted' : ''}`}
                    style={{
                      '--card-color': thematic.color_code || '#9b34d3',
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    {/* Image flottante au-dessus */}
                    <div className="th-card-float">
                      <img
                        src={thematic.icon_url}
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                        alt={thematic.thematic_title}
                      />
                    </div>

                    {/* Corps coloré */}
                    <div className="th-card-body">
                      <h4 className="th-card-title">{thematic.thematic_title}</h4>

                      {thematic.sub_thematics?.length > 0 && (
                        <span className="th-card-badge">
                          Quiz · {thematic.sub_thematics.length}
                        </span>
                      )}

                      <ul className="th-sub-list">
                        {Array.isArray(thematic.sub_thematics) && thematic.sub_thematics.length > 0 ? (
                          thematic.sub_thematics.map((sub) => (
                            <li key={sub.sub_thematic_id}>
                              <button
                                className="th-sub-btn"
                                onClick={() => {
                                  handleSubThematicClick(sub, thematic);
                                  closePopup?.();
                                }}
                              >
                                <span className="th-sub-arrow">›</span>
                                {sub.title}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="th-sub-empty">Aucune sous-thématique</li>
                        )}
                      </ul>
                    </div>

                    {/* Glow coloré */}
                    <div className="th-card-glow" />
                  </div>
                ))}
              </div>

              {/* Next */}
              <button
                className="th-nav-btn th-nav-next"
                onClick={() => scrollCarousel(1)}
                aria-label="Suivant"
              >
                ›
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Thematic;
