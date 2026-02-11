import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import useAuth from '../../configurations/Context/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';

import './Sign_up.css';

const SignUp = () => {
  useEffect(() => {
    document.title = 'FUNQUIZ | Inscription';
  }, []);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const DEFAULT_DOB = '--/--/----';

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError("Vous devez accepter les conditions d'utilisation et la politique de confidentialité.");
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (number && number.length !== 10) {
      setError('Le numéro de téléphone doit comporter 10 chiffres (format Côte d\'Ivoire).');
      return;
    }

    setLoading(true);

    try {
      const finalNumber = number.trim() || null;

      await register({
        name: lastName,
        first_name: firstName,
        email,
        number: finalNumber,
        date_of_birth: DEFAULT_DOB,
        password,
      });

      navigate('/');
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      setError(err.response?.data?.message || "Erreur lors de l'inscription. Réessayez.");
    } finally {
      setLoading(false);
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
    <div className="corals-wrapper">
      <div className="corals-container">
        {/* Left Side - Form */}
        <div className="corals-left">
          <div className="corals-header">
            <h1>Créer un compte</h1>
            <p className="corals-subtitle">Commençons votre aventure dès aujourd'hui</p>
          </div>

          <div className="corals-google-wrapper w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="rectangular"
              width="320"
              text="signup_with"
            />
          </div>

          <div className="corals-divider">
            <span>ou</span>
          </div>

          {error && <div className="corals-error">{error}</div>}

          <form className="corals-form" onSubmit={handleRegister}>
            <div className="corals-input-group">
              <label>Nom complet <span className="required">*</span></label>
              <div className="corals-grid-2">
                <input
                  className="corals-input"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <input
                  className="corals-input"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            <div className="corals-input-group">
              <div className="corals-grid-2">
                <div>
                  <label>Email <span className="required">*</span></label>
                  <input
                    type="email"
                    className="corals-input"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Numéro de téléphone <span className="optional">(facultatif)</span></label>
                  <div className="corals-phone-wrapper">
                    <span className="corals-phone-prefix">🇨🇮 +225</span>
                    <input
                      type="tel"
                      className="corals-input corals-input-phone"
                      placeholder="07 07 07 07 07"
                      value={number}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNumber(val);
                      }}
                      maxLength={10} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="corals-input-group">
              <div className="corals-grid-2">
                <div>
                  <label>Mot de passe <span className="required">*</span></label>
                  <div className="corals-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="corals-input"
                      placeholder="Créer un mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="corals-eye-btn" onClick={togglePassword}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label>Confirmer le mot de passe <span className="required">*</span></label>
                  <div className="corals-password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="corals-input"
                      placeholder="Répétez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="corals-eye-btn" onClick={toggleConfirmPassword}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="corals-checkbox-wrapper">
              <label className="corals-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="corals-checkmark"></span>
                <span className="corals-checkbox-text">
                  J'accepte les <a href="#">Conditions</a>, la <a href="#">Politique de confidentialité</a> et les Frais
                </span>
              </label>
            </div>

            <button className="corals-btn-submit" disabled={loading}>
              {loading ? 'Création...' : "S'inscrire"}
            </button>

            <div className="corals-footer-link">
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </div>
          </form>
        </div>

        {/* Right Side - Image */}
        <div className="corals-right">
          <div className="corals-image-card">
            <img src="/signup.webp" alt="Furniture" className="corals-image" />
            <div className="corals-image-overlay">
              <h2>Découvrez le meilleur apprentissage pour vous</h2>
              <p>Notre plateforme est conçue pour des environnements complets exceptionnels et des situations spéciales.</p>
              <div className="corals-badges">
                <div className="corals-badge">
                  <FaShieldAlt /> 100% Garantie
                </div>
                <div className="corals-badge">
                  <FaCheckCircle /> Accès illimité
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
