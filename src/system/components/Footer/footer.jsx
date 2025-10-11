import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaTiktok, FaYoutube } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import './footer.css';
import Newsletter from '../../configurations/Services/newsletterServices.js';

const Footer = ({ openPopup }) => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const user_id_token = payload?.user_id;
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const location = useLocation();
  const { t } = useTranslation();
  const isGame = location.pathname === '/step';
  const isLogin = location.pathname === '/login';
  const isSignUp = location.pathname === '/sign-up';
  const isDash = location.pathname.startsWith('/dashboard');
  const isTerms = location.pathname === '/terms';
  const isSearch = location.pathname === '/search';
  const isProfil = location.pathname === '/profil';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!user_id_token) {
      setMessage('Merci pour votre inscription !');
      setTimeout(() => setMessage(''), 5000); // disparaît après 5 secondes
      setLoading(false);
      return;
    }

    try {
      await Newsletter.addNewsletter(email, user_id_token);
      setMessage('Merci pour votre inscription !');
      setEmail('');
      setTimeout(() => setMessage(''), 5000); // disparaît après 5 secondes
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setMessage('Une erreur est survenue. Veuillez réessayer.');
      setTimeout(() => setMessage(''), 5000); // disparaît après 5 secondes
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isGame && !isProfil && !isSearch && !isDash && !isLogin && !isSignUp && (
        <footer className="footer-funquiz rounded-5 pt-5">
          {!isTerms && (
            <div className="container">
              <div className="row g-4">
                {/* === À propos FunQuiz === */}
                <div className="col-lg-4 col-md-6">
                  <h3 className="footer-title logo-title">{t('footer.funquiz')}</h3>
                  <p className="mb-4">{t('footer.description')}</p>
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
                  <h3 className="footer-title">{t('footer.quick_links')}</h3>
                  <ul className="footer-links d-flex flex-lg-column flex-wrap gap-2">
                    <li>
                      <Link to="/">{t('footer.home')}</Link>
                    </li>
                    <li>
                      <Link onClick={() => openPopup('thematic')}>
                        {t('footer.quiz')}
                      </Link>
                    </li>
                    <li>
                      <Link to="/classements">{t('footer.ranking')}</Link>
                    </li>
                    <li>
                      <Link className='' to="/about">À propos</Link>
                    </li>
                    <li>
                      <Link to="/contact">{t('footer.contact')}</Link>
                    </li>
                    <li>
                      <Link to="/login">{t('footer.login')}</Link>
                    </li>
                    <li>
                      <Link to="/sign-up">{t('footer.signup')}</Link>
                    </li>
                  </ul>
                </div>

                {/* === Support === */}
                <div className="col-lg-2 col-md-6">
                  <h3 className="footer-title">{t('footer.support')}</h3>
                  <ul className="footer-links d-flex flex-lg-column flex-wrap gap-2">
                    <li>
                      <Link to="/terms">FAQ</Link>
                    </li>
                    <li>
                      <Link to="/terms">Politique de confidentialité</Link>
                    </li>
                    <li>
                      <Link to="/terms">Conditions</Link>
                    </li>
                  </ul>
                </div>

                {/* === Newsletter === */}
                <div className="col-lg-4 col-md-6 d-none d-lg-block">
                  <h3 className="footer-title">Newsletter</h3>
                  <p className="mb-4">
                    Recevez les derniers quiz et astuces directement dans votre boîte mail !
                  </p>
                  <div className="mb-4">
                    <form onSubmit={handleSubmit} className="input-group">
                      <input
                        type="email"
                        className="form-control rounded-pill m-0 newsletter-input"
                        placeholder="Votre email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <button
                        disabled={loading}
                        className="btn rounded-pill ms-3 btn-subscribe text-white"
                        type="submit"
                      >
                        S'inscrire
                      </button>
                    </form>
                    {message && (
                      <div className=" text-light position-asolute bottom-0">{message}</div>
                    )}
                  </div>
                  <p className="small">
                    En vous inscrivant, vous acceptez notre{' '}
                    <Link to="/politique-de-confidentialite">politique de confidentialité</Link>.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* === Footer Bottom === */}
          <div className="footer-bottom py-3">
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-0">© 2025 FunQuiz. Tous droits réservés.</p>
                </div>
                <div className="col-md-6 text-md-end">
                  <p className="mb-0">
                    Conçu par <Link to="/">FunQuiz</Link>
                  </p>
                </div>
              </div>
            </div>
            <div style={{ height: '100px',  }} className="bottom-custom"></div>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;
