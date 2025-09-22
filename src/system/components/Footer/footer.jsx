import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaTiktok, FaYoutube } from 'react-icons/fa';

import './footer.css';

const Footer = () => {
  const location = useLocation();
  const isGame = location.pathname === '/step';
  const isLogin = location.pathname === '/login';
  const isSignUp = location.pathname === '/sign-up';
  const isTerms = location.pathname === '/terms';

  return (
    <>
      {!isGame && !isLogin && !isSignUp && (
        <footer className="footer-funquiz pt-5">
          {!isTerms && (
          <div className="container">
            <div className="row g-4">
              {/* === À propos FunQuiz === */}
              <div className="col-lg-4 col-md-6">
                <h3 className="footer-title logo-title">FunQuiz</h3>
                <p className="mb-4">
                  Testez vos connaissances et amusez-vous avec nos quiz interactifs ! Restez connectés
                  pour ne rien manquer.
                </p>
                <div className="social-links mb-4">
                  <a href="#">
                    <FaFacebook />
                  </a>
                  <a href="#">
                    <FaTwitter />
                  </a>
                  <a href="#">
                    <FaTiktok />
                  </a>
                  <a href="#">
                    <FaYoutube />
                  </a>
                </div>
              </div>

              {/* === Liens rapides === */}
              <div className="col-lg-2 col-md-6">
                <h3 className="footer-title">Liens rapides</h3>
                <ul className="footer-links">
                  <li><Link to="/">Accueil</Link></li>
                  <li><Link to="/quiz">Quiz</Link></li>
                  <li><Link to="/classements">Classements</Link></li>
                  <li><Link to="/a-propos">À propos</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/login">Se connecter</Link></li>
                  <li><Link to="/sign-up">S'inscrire</Link></li>
                </ul>
              </div>

              {/* === Support === */}
              <div className="col-lg-2 col-md-6">
                <h3 className="footer-title">Support</h3>
                <ul className="footer-links">
                  <li><Link to="/faq">FAQ</Link></li>
                  <li><Link to="/communaute">Communauté</Link></li>
                  <li><Link to="/politique-de-confidentialite">Politique de confidentialité</Link></li>
                  <li><Link to="/conditions">Conditions</Link></li>
                  <li><Link to="/cookies">Cookies</Link></li>
                </ul>
              </div>

              {/* === Newsletter === */}
              <div className="col-lg-4 col-md-6">
                <h3 className="footer-title">Newsletter</h3>
                <p className="mb-4">
                  Recevez les derniers quiz et astuces directement dans votre boîte mail !
                </p>
                <form className="mb-4">
                  <div className="input-group">
                    <input
                      type="email"
                      className="form-control newsletter-input"
                      placeholder="Votre email"
                    />
                    <button className="btn btn-subscribe text-white" type="submit">
                      S'inscrire
                    </button>
                  </div>
                </form>
                <p className="small">
                  En vous inscrivant, vous acceptez notre{' '}
                  <Link to="/politique-de-confidentialite">politique de confidentialité</Link>.
                </p>
              </div>
            </div>
          </div>
          )}
          {/* === Footer Bottom === */}
            <div className="footer-bottom py-3 mt-5">
              <div className="container">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-0">© 2025 FunQuiz. Tous droits réservés.</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <p className="mb-0">
                      Conçu par <Link to="/">FunQuiz Team</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </footer>
      )}
    </>
  );
};

export default Footer;
