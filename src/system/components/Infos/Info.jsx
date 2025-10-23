import './Infos.css';
import { useLocation } from 'react-router-dom';
import Wall from '../../../assets/10740576.jpg';
import Logo from '../../../assets/Log.png';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Info = () => {
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const isDash = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    // Vérifier si la pop-up a déjà été affichée cette session
    const seen = sessionStorage.getItem('seenWelcomePopup');

    if (!isDash && !seen) {
      setShowPopup(true);
      setTimeout(() => setAnimateIn(true));
      sessionStorage.setItem('seenWelcomePopup', 'true');
    }
  }, [isDash]);

  if (!showPopup) return null;

  return (
    <div
      className="bg-dark bg-opacity-50 vh-100 w-100 position-fixed bottom-0 end-0 d-flex align-items-center justify-content-center"
      style={{ zIndex: 9999, backdropFilter: 'blur(10px)' }}
    >
      <div
        className={`container-pop-up m-5 d-flex rounded-4 overflow-hidden ${animateIn ? 'animate-in shadow-dance' : ''}`}
        style={{
          height: '500px',
          width: '800px',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className="imgLeft d-none d-lg-block position-relative bg-light overflow-hidden"
          style={{
            width: '1450px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="gradient-overlay">
            <div
              style={{ width: '270px', top: '100px', right: '100px' }}
              className="position-absolute overflow-hidden"
            >
              <img src={Logo} className="w-100 h-100 z-3" alt="logo funquiz" />
            </div>
          </div>
          <img
            src={Wall}
            className="w-100 h-100 object-fit-cover animate-pulse"
            alt="image de fond"
          />
        </div>

        <div
          className="container-right w-100 overflow-hidden p-5 d-flex flex-column position-relative"
          style={{
            background: 'var(--bg-light)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <h2 className="logo d-flex flex-column align-items-center text-center mb-3 text-glow">
            <span className="Logo_funquiz color-shift text-dark">FunQuiz</span>
            <span className="sous-log"></span>
          </h2>
        
        

          <p
            className="text-secondary text-center mb-4 mt-3 fade-in-text"
            style={{ fontSize: '13px' }}
          >
            Prouvez votre talent, empochez des points et dominez vos amis partout !{' '}
            <br />
            <br />
            Inscrivez-vous dès maintenant pour accéder à vos points, suivre votre progression et ne rien perdre de votre expérience.
          </p>


          <button className="button-popup pulse-effect" onClick={() => setShowPopup(false)}>
            Continuer
          </button>

          <div className="position-absolute start-0 end-0 bottom-0 w-100 footer-links-container">
            <ul className="d-flex w-100 p-0 mb-3 gap-3 justify-content-center align-items-center">
              <li className="item-popup">
                <Link to={'/terms'} className="link-hover-effect">
                  Confidentialité
                </Link>
              </li>
              <li className="item-popup">
                <Link to={'/terms'} className="link-hover-effect">
                  CGU
                </Link>
              </li>
              <li className="item-popup">
                <Link to={'/legal'} className="link-hover-effect">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
