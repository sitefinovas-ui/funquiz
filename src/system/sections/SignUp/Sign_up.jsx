import { useState, useEffect } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from '../../configurations/Context/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

import Fb from '../../../assets/icons/rx/fb.png';
import Qz from '../../../assets/icons/rx/qz.png';
import Ins from '../../../assets/icons/rx/ins.png';

import './Sign_up.css';

const SignUp = () => {
  useEffect(() => {
    document.title = "FUNQUIZ | Inscription";
  }, []);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Animation texte
  const fullText =
    "Rejoins la communauté et découvre des quiz fun, interactifs et faits pour toi 🎉\nInscris-toi en quelques secondes et commence l’aventure !";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    if (!isDeleting && index < fullText.length) {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, index + 1));
        setIndex(index + 1);
      }, 40);
    } else if (isDeleting && index > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, index - 1));
        setIndex(index - 1);
      }, 20);
    } else if (index === fullText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (index === 0 && isDeleting) {
      setIsDeleting(false);
    }
    return () => clearTimeout(timeout);
  }, [index, isDeleting, fullText]);

  // Vérification de l'âge
  const isAdult = (dob) => {
    const [day, month, year] = dob.split('/');
    if (!day || !month || !year) return false;
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (!isAdult(dateOfBirth)) {
      setError("Vous devez avoir au moins 18 ans pour vous inscrire");
      setLoading(false);
      return;
    }

    try {
      await register({ 
        name: lastName,
        first_name: firstName,
        email,
        number,
        date_of_birth: dateOfBirth,
        password
      });
      navigate('/'); // redirection après inscription
    } catch (err) {
      console.error('Erreur lors de l\'inscription :', err);
      setError(err.response?.data?.message || 'Erreur lors de l’inscription. Réessayez.');
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
    <div className="container d-flex flex-column justify-content-center align-items-center w-100 vh-100">
      <div className="bg-effect"></div>
      <div className="bg-effect"></div>

      <div style={{ minWidth: "100%" }} className="signUp ">
        <div className="wall-inscription d-none d-lg-block position-relative">
          <div style={{height:'200px'}} className="mb-5 d-flex flex-column mt-5 align-items-center">
            <h1 className="text-dark text-center mb-5 fw-bold">Crée ton compte<br/>FUNQUIZ</h1>
            <p className="text-dark fs-6 w-75 text-center" style={{ whiteSpace: "pre-line" }}>
              {displayedText}<span className="cursor"> .</span>
            </p>
          </div>
          <div className="bulle position-relative w-100">
            <img className='floating-icon icon-1' width={100} src={Fb} alt="" />
            <img className='floating-icon icon-2' width={100} src={Qz} alt="" />
            <img className='floating-icon icon-3' width={100} src={Ins} alt="" />
          </div>
        </div>

        <div className="signUp-container z-2 p-4 p-md-5">
          <h1 className="welcome-title">Inscrivez-vous</h1>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleRegister} className="mb-4">
            {/* Nom + Prénom */}
            <div className="d-flex w-100 gap-3">
              <div className="mb-3 w-100">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input type="text" className="form-control" id="lastName" placeholder='Entrez votre nom' value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="mb-3 w-100">
                <label htmlFor="firstName" className="form-label">Prénom(s)</label>
                <input type="text" className="form-control" id="firstName" placeholder='Entrez vos/votre prénom(s)' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
            </div>

            {/* Téléphone + Email */}
            <div className="d-flex gap-3">
              <div className="mb-3 w-100">
                <label htmlFor="number" className="form-label">Téléphone</label>
                <input type="tel" placeholder='Entrez votre numéro de téléphone' className="form-control" id="number" value={number} onChange={(e) => setNumber(e.target.value.replace(/[^\d+]/g, ''))} />
              </div>
              <div className="mb-3 w-100">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" placeholder='Entrez votre adresse mail' className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Date de naissance */}
            <div className="mb-3 w-100">
              <label htmlFor="dateOfBirth" className="form-label">Date de naissance</label>
              <input
                type="text"
                className="form-control"
                id="dateOfBirth"
                placeholder="JJ/MM/AAAA"
                value={dateOfBirth}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ''); // supprime tout sauf chiffres
                  if (value.length > 8) value = value.slice(0, 8); // limite à 8 chiffres
                  // Ajout automatique des slash
                  if (value.length > 4) value = value.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
                  else if (value.length > 2) value = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
                  setDateOfBirth(value);
                }}
                required
              />
            </div>

            {/* Mot de passe */}
            <div className="mb-3 w-100">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="position-relative">
                <input type={showPassword ? "text" : "password"} className="form-control pe-5" id="password" value={password} placeholder='Nouveau mot de passe' onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="password-toggle" onClick={togglePassword}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div className="mb-3 w-100">
              <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
              <div className="position-relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder='Confirmez le mot de passe'
                  className={`form-control pe-5 ${confirmPassword && confirmPassword !== password ? 'is-invalid' : ''}`} 
                  id="confirmPassword" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
                <button type="button" className="password-toggle" onClick={toggleConfirmPassword}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="invalid-feedback">Les mots de passe ne correspondent pas</div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary-custom w-100 mb-3" 
              disabled={loading}
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>

          {/* Connexion Google */}
          <div className="d-flex  justify-content-center mb-4">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} theme="outline" size="large" width={400} text="continue_with" shape="rectangular" logo_alignment="left" />
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-muted-custom mb-2">
              Vous avez déjà un compte ? <a href="/login" className="link-custom">Se connecter</a>
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <a href="#" className="link-custom">Conditions d'utilisation</a>
              <span className="text-muted-custom">•</span>
              <a href="/" className="link-custom">Accueil</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignUp;
