import './listThematic.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import thematicService from '../../configurations/Services/thematicServices.js';

function Thematic({ closePopup, highlightThematicId }) {
  const [thematics, setThematics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThematics = async () => {
      try {
        const data = await thematicService.getAllThematics();
        setThematics(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des thématiques :', error);
      }
    };
    fetchThematics();
  }, []);

  // Mettez en évidence et scrollez vers la thématique ciblée
  useEffect(() => {
    if (!highlightThematicId) return;
    const el = document.getElementById(`thematic-${highlightThematicId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightThematicId, thematics]);

  // rediriger vers QuizComponent avec la sous-thématique choisie
  const handleSubThematicClick = (sub, thematic) => {
    navigate('/step', {
      state: {
        questions: sub.questions || [],
        subTitle: sub.title,
        thematicTitle: thematic.thematic_title,
      },
    });
  };

  return (
    <div
      className="backdrop-blur position-fixed bg-dark bg-opacity-50 top-0 end-0 bottom-0 start-0 h-100 w-100"
      style={{ zIndex: 1055 }}
      onClick={() => {
        closePopup?.();
      }}
    >
      <div className="position-relative w-100">
        <div
          style={{ top: '-10px' }}
          className="text-dark p-5 start-0 end-0 bg-white position-absolute"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="d-flex align-items-center justify-content-between mx-5">
            <h2 className="title-selec-quiz fw-bold">Toutes les thématiques</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closePopup?.();
              }}
              style={{color:'#0000008c'}}
              className="border-0 btn-close"
            >
              x
            </button>
          </div>

          <div className="dropdown-menu-large w-100">
            <div className="dropdown-content w-100">
              {thematics.map((thematic) => (
                <div
                  key={thematic.thematic_id}
                  id={`thematic-${thematic.thematic_id}`}
                  className="dropdown-column"
                  style={
                    highlightThematicId === thematic.thematic_id
                      ? { backgroundColor: 'rgba(179, 14, 182, 0.13)', borderRadius: '12px', padding: '12px' }
                      : undefined
                  }
                >
                  {/* Icône thématique */}
                  <div
                    className="image-container rounded-circle overflow-hidden mb-3"
                    style={{
                      width: '100px',
                      height: '100px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: thematic.color_code,
                    }}
                  >
                    <img
                      src={thematic.icon_url}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      className="rounded-circle w-100 h-100 object-fit-cover"
                      alt="Thematic category"
                    />
                  </div>

                  <h4 className={highlightThematicId === thematic.thematic_id ? '' : ''}>
                    {thematic.thematic_title}
                  </h4>

                  <ul className="list-unstyled text-start">
                    {Array.isArray(thematic.sub_thematics) && thematic.sub_thematics.length > 0 ? (
                      thematic.sub_thematics.map((sub) => (
                        <li className="hover-custom text-start" key={sub.sub_thematic_id}>
                          <button
                            onClick={() => {
                              handleSubThematicClick(sub, thematic);
                              closePopup?.();
                            }}
                            className="text-decoration-none bg-transparent border-0 text-primary"
                          >
                            {sub.title}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted fst-italic small">Aucune sous-thématique</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thematic;
