import './listThematic.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import thematicService from '../../configurations/Services/thematicServices.js';
import countryServices from '../../configurations/Services/countryServices.js';

function Thematic({ closePopup, highlightThematicId }) {
  const [thematics, setThematics] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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

  // Filter only active countries
  const activeCountryCodes = countries.filter(c => c.is_active).map(c => c.code);

  const filtered = thematics.filter((t) => {
    const isFromActiveCountry = activeCountryCodes.includes(t.country_code || 'CI');
    if (!isFromActiveCountry) return false;

    const matchesSearch = t.thematic_title.toLowerCase().includes(search.toLowerCase()) ||
      (t.sub_thematics || []).some((s) => s.title.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch;
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

        {/* Grid */}
        <div className="th-body">
          {filtered.length === 0 ? (
            <div className="th-empty">Aucune thématique pour « {search} »</div>
          ) : (
            <div className="th-grid">
              {filtered.map((thematic, idx) => (
                <div
                  key={thematic.thematic_id}
                  id={`thematic-${thematic.thematic_id}`}
                  className={`th-card ${highlightThematicId === thematic.thematic_id ? 'highlighted' : ''}`}
                  style={{ '--card-color': thematic.color_code || '#9b34d3', animationDelay: `${idx * 0.04}s` }}
                >
                  <div
                    className="th-card-icon"
                    style={{ background: thematic.color_code || '#9b34d3' }}
                  >
                    <img
                      src={thematic.icon_url}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      className="th-card-icon-img"
                      alt={thematic.thematic_title}
                    />
                  </div>

                  <h4 className="th-card-title">{thematic.thematic_title}</h4>

                  {thematic.sub_thematics?.length > 0 && (
                    <span className="th-card-badge">{thematic.sub_thematics.length} quiz</span>
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
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Thematic;
