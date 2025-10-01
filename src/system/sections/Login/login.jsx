import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../configurations/Context/useAuth';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginWithGoogleToken } from '../../configurations/Services/googleAuthService';
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
    document.title = "FUNQUIZ | Se connecter";
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
      background: rgba(255,255,255,0.3);
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
      // Affiche le message venant de la base, sinon un message générique
      setError(
        err?.response?.data?.message ||
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
    <div className="container d-flex flex-column justify-content-center align-items-center w-100 vh-100">
      <div className="mb-4 d-none d-lg-flex flex-column align-items-center">
        <h1 className="text-white text-center">Bienvenue</h1>
        <p style={{fontSize: '12px', width:'65%'}} className="text-muted-custom text-center">
          Connectez-vous pour accéder à votre espace personnel et profiter pleinement de FUNQUIZ.
        </p>
      </div>
      
      {/* Effets de fond */}
      <div className="bg-effect"></div>
      <div className="bg-effect"></div>

      <div className="login-container p-4 p-md-5">
        {/* Indicateur de carte */}
        <div className="card-indicator"></div>
        
        {/* Titre de bienvenue */}
        <h1 className="welcome-title">Connectez-vous</h1>
        
        {/* Affichage des erreurs */}
        {error && (
          <div className="alert alert-danger mb-3" role="alert">
            {error}
          </div>
        )}
        
        {/* Formulaire */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Adresse email</label>
              <input 
                type="email" 
                placeholder='Entrez votre email'
                className="form-control" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            {/* Mot de passe */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="position-relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5" 
                  id="password" 
                  placeholder="Entrer votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={togglePassword}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            {/* Bouton principal */}
            <button 
              type="submit" 
              className="btn btn-primary-custom w-100 mb-3 position-relative overflow-hidden"
              onClick={handleRippleEffect}
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            
            {/* Lien vers reset password */}
            <div className="text-center mb-3">
              <Link to="/reset" className="btn-link-custom">Mot de passe oublié ?</Link>
            </div>
          </div>
        </form>
        
        {/* Séparateur */}
        <div className="divider">
          <span>ou s'identifier avec</span>
        </div>
        
        {/* Google Login */}
        <div className="d-flex justify-content-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width={300}
            text="continue_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>
        
        {/* Liens du footer */}
        <div className="text-center">
          <p className="text-muted-custom mb-2">
            Pas encore de compte ? <Link to="/sign-up" className="link-custom">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;