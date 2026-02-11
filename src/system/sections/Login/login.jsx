import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../configurations/Context/useAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading } = useAuth();

  useEffect(() => {
    document.title = 'FUNQUIZ | Se connecter';
  }, []);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRippleEffect = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.35);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x}px;
      top: ${y}px;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      margin-top: -10px;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      // Lis d'abord `message` renvoyé par l'API, puis `error` (compatibilité)
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Erreur lors de la connexion. Veuillez réessayer.'
      );
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const googleToken = credentialResponse.credential;
      if (!googleToken) throw new Error('Aucun token Google reçu');
      await loginWithGoogle(googleToken);
      navigate('/');
    } catch (err) {
      setError('Erreur Google: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setError('Échec de la connexion Google. Veuillez réessayer.');
  };

  return (
    <div className=" d-flex">
      <div className="anthropic-left-panel">
        <div className="anthropic-content">
          <div className="anthropic-header">
            <h1 className="anthropic-title">
              Apprendre ?<br />
              S'amuser.
            </h1>
            <p className="anthropic-subtitle">Le quiz pour les esprits curieux</p>
          </div>

          <div className="anthropic-card">
            <div className="anthropic-google-wrapper">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="rectangular"
                  width="320"
                  text="continue_with"
                />
            </div>

            <div className="anthropic-divider">
              <span>OU</span>
            </div>

            {error && <div className="anthropic-error">{error}</div>}

            <form onSubmit={handleLogin} className="anthropic-form">
              <div className="anthropic-input-group">
                <input
                  type="email"
                  className="anthropic-input"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="anthropic-input-group">
                <div className="anthropic-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="anthropic-input"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="anthropic-eye-btn"
                    onClick={togglePassword}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="anthropic-btn-primary" disabled={loading}>
                {loading ? 'Chargement...' : "Continuer avec l'email"}
              </button>
            </form>
            
             <div className="anthropic-footer-links">
               <Link to="/reset">Mot de passe oublié ?</Link>
               <span>•</span>
               <Link to="/sign-up">S'inscrire</Link>
            </div>

            <p className="anthropic-disclaimer">
              En continuant, vous acceptez nos <a href="/terms#cgu">Conditions d'utilisation</a> et notre <a href="/terms#privacy">Politique de confidentialité</a>.
            </p>
          </div>
        </div>
      </div>

      <div className="anthropic-right-panel">
         {/* Placeholder for the artistic image */}
         <div className="anthropic-art-container">
            <img src="/play.webp" alt="Funquiz Art" className="w-100 h-100 anthropic-art-logo" />
         </div>
      </div>
    </div>
  );
};

export default Login;
