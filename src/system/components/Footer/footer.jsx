import { Link, useLocation } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaTiktok, FaYoutube } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import './footer.css';
import Newsletter from '../../configurations/Services/newsletterServices.js';
import Logo from '../../../assets/Log.png';

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
    try {
      await Newsletter.addNewsletter({ email, user_id: user_id_token ?? null });
      setMessage('Merci pour votre inscription !');
      setEmail('');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      if (error?.status === 409 || /déjà abonné/i.test(error?.message || '')) {
        setMessage('Vous êtes déjà inscrit à la newsletter.');
      } else {
        setMessage('Une erreur est survenue. Veuillez réessayer.');
      }
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isGame && !isProfil && !isSearch && !isDash && !isLogin && !isSignUp && (
        <footer className="footer-funquiz pt-16 pb-0">
          {!isTerms && (
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                {/* Brand */}
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-2.5 mb-4">
                    <img src={Logo} className="w-8 h-8 object-contain opacity-90" alt="FunQuiz" />
                    <h3 className="logo-tite mb-0">{t('footer.funquiz')}</h3>
                  </div>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px' }}>
                    {t('footer.description')}
                  </p>
                  <div className="social-links">
                    <a href="#" aria-label="Facebook"><FaFacebook /></a>
                    <a href="#" aria-label="Twitter"><FaTwitter /></a>
                    <a href="#" aria-label="TikTok"><FaTiktok /></a>
                    <a href="#" aria-label="YouTube"><FaYoutube /></a>
                  </div>
                </div>

                {/* Navigation */}
                <div>
                  <h3 className="footer-title">{t('footer.quick_links')}</h3>
                  <ul className="footer-links">
                    <li><Link to="/">{t('footer.home')}</Link></li>
                    <li><Link onClick={() => openPopup('thematic')}>{t('footer.quiz')}</Link></li>
                    <li><Link to="/raking">{t('footer.ranking')}</Link></li>
                    <li><Link to="/about">À propos</Link></li>
                    <li><Link to="/contact">{t('footer.contact')}</Link></li>
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h3 className="footer-title">{t('footer.support')}</h3>
                  <ul className="footer-links">
                    <li><Link to="/terms">FAQ</Link></li>
                    <li><Link to="/terms">Confidentialité</Link></li>
                    <li><Link to="/terms">Conditions d&apos;utilisation</Link></li>
                    <li><Link to="/legal">Mentions légales</Link></li>
                  </ul>
                </div>

                {/* Newsletter */}
                <div className="hidden lg:block">
                  <h3 className="footer-title">Newsletter</h3>
                  <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                    Recevez les derniers quiz et astuces directement dans votre boîte mail.
                  </p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                    <input
                      type="email"
                      className="newsletter-input"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button disabled={loading} className="btn-subscribe w-full" type="submit">
                      {loading ? 'Envoi...' : "S'inscrire"}
                    </button>
                  </form>
                  {message && (
                    <p className="mt-3 text-xs" style={{ color: '#d1b3ff' }}>{message}</p>
                  )}
                  <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.22)', lineHeight: '1.5' }}>
                    En vous inscrivant, vous acceptez notre{' '}
                    <Link to="/politique-de-confidentialite" style={{ color: 'rgba(155,52,211,0.7)' }}>
                      politique de confidentialité
                    </Link>.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Bottom bar */}
          <div className="footer-bottom py-5 mt-16">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                <p className="text-xs m-0" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  © 2025 <span style={{ color: 'rgba(255,255,255,0.5)' }}>FunQuiz</span>. Tous droits réservés.
                </p>
                <p className="text-xs m-0" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  Conçu pour {' '}
                  <Link to="/" style={{ color: 'rgba(155,52,211,0.7)' }}>FunQuiz</Link>
                </p>
              </div>
            </div>
            <div className="bottom-custom" />
          </div>

        </footer>
      )}
    </>
  );
};

export default Footer;
