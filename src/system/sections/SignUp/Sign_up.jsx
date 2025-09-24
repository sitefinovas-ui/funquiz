import { useState, useEffect } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash, FaStar, FaHeart, FaSmile } from "react-icons/fa";

import Fb from '../../../assets/icons/rx/fb.png';
import Qz from '../../../assets/icons/rx/qz.png';
import Ins from '../../../assets/icons/rx/ins.png';


import './Sign_up.css';

const SignUp = () => {
  // ----------------------------
  // Hooks
  // ----------------------------
  useEffect(() => {
    document.title = "FUNQUIZ | Inscription";
  }, []);

  const [email, setEmail] = useState('julien@gmail.com');
  const [firstName, setFirstName] = useState('Julien');
  const [lastName, setLastName] = useState('Ramos');
  const [number, setNumber] = useState('+225 0702030104');
  const [dateOfBirth, setDateOfBirth] = useState('01/09/2002');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ----------------------------
  // Fonctions
  // ----------------------------
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

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


   const fullText =
    "Rejoins la communauté et découvre des quiz fun, interactifs et faits pour toi 🎉\nInscris-toi en quelques secondes et commence l’aventure !";

  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;

    if (!isDeleting && index < fullText.length) {
      // Écriture
      timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, index + 1));
        setIndex(index + 1);
      }, 40);
    } else if (isDeleting && index > 0) {
      // Effacement
      timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, index - 1));
        setIndex(index - 1);
      }, 20);
    } else if (index === fullText.length) {
      // Pause avant suppression
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (index === 0 && isDeleting) {
      // Recommence après suppression
      setIsDeleting(false);
    }

    return () => clearTimeout(timeout);
  }, [index, isDeleting, fullText]);
  // ----------------------------
  // Rendu
  // ----------------------------
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center w-100 vh-100">
      
      {/* Header */}
      

      {/* Effets de fond */}
      <div className="bg-effect"></div>
      <div className="bg-effect"></div>

      {/* Conteneur principal */}
      <div style={{ minWidth: "100%" }} className="signUp ">
        
        {/* Panneau gauche */}
        <div className="wall-inscription d-none d-lg-block position-relative">
            <div style={{height:'200px'}} className="mb-5 d-flex flex-column mt-5 align-items-center">
                <h1 className="text-dark text-center mb-5 fw-bold">Crée ton compte<br/>FUNQUIZ</h1>
                <p className="text-dark fs-6 w-75 text-center" style={{ whiteSpace: "pre-line" }}>
                {displayedText}
                <span className="cursor"> .</span>
                </p>
            </div>
            <div className="bulle  position-relative w-100">
                <img className='floating-icon icon-1' width={100} src={Fb} alt="" />
                <img className='floating-icon icon-2' width={100} src={Qz} alt="" />
                <img className='floating-icon icon-3' width={100} src={Ins} alt="" />
            </div>
        </div>

        {/* Formulaire */}
        <div className="signUp-container z-2 p-4 p-md-5">

          {/* Indicateur de carte */}
          <div className="card-indicator">

          </div>

          {/* Titre */}
          <h1 className="welcome-title">Inscrivez-vous</h1>

          {/* Champs */}
          <form className="mb-4" >

            {/* Nom + Prénom */}
            <div className="d-flex w-100 gap-3">
              <div className="mb-3 w-100">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input 
                  type="text"
                  className="form-control"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3 w-100">
                <label htmlFor="firstName" className="form-label">Prénom(s)</label>
                <input 
                  type="text"
                  className="form-control"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            </div>

            {/* Téléphone + Email */}
            <div className="d-flex gap-3">
              <div className="mb-3 w-100">
                <label htmlFor="number" className="form-label">Téléphone</label>
                <input 
                  type="tel"
                  className="form-control"
                  id="number"
                  pattern="[0-9]{1,}"
                  value={number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d+]/g, '');
                    setNumber(value);
                  }}
                />
              </div>

              <div className="mb-3 w-100">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date de naissance */}
            <div className="">
              <div className="mb-3 w-100">
                <label htmlFor="dateOfBirth" className="form-label">Date de naissance</label>
                <input 
                  type="text"
                  className="form-control"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  placeholder="JJ/MM/AAAA"
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d/]/g, '');
                    let formattedValue = value;

                    if (value.length === 2 && !value.includes('/')) {
                      formattedValue = value + '/';
                    } else if (value.length === 5 && value.split('/').length === 2) {
                      formattedValue = value + '/';
                    }

                    if (formattedValue.length <= 10) {
                      if (formattedValue.length === 10) {
                        const [day, month, year] = formattedValue.split('/');
                        const birthDate = new Date(year, month - 1, day);
                        const today = new Date();

                        let age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();

                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }

                        if (age < 18) {
                          e.target.setCustomValidity("Vous devez avoir au moins 18 ans pour vous inscrire");
                          e.target.classList.add('is-invalid');
                        } else {
                          e.target.setCustomValidity("");
                          e.target.classList.remove('is-invalid');
                        }
                      }
                      setDateOfBirth(formattedValue);
                    }
                  }}
                  required
                />
                <div className="invalid-feedback">
                  Vous devez avoir au moins 18 ans pour vous inscrire
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="mb-3 w-100">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <div className="position-relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="form-control pe-5"
                  id="password"
                  placeholder="Entrer votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={togglePassword}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
              <div className="position-relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control pe-5 ${confirmPassword && confirmPassword !== password ? 'is-invalid' : ''}`}
                  id="confirmPassword"
                  placeholder="Confirmer votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPassword}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="invalid-feedback">
                  Les mots de passe ne correspondent pas
                </div>
              </div>
            </div>

            {/* Bouton principal */}
            <button 
              type="submit"
              className="btn btn-primary-custom w-100 mb-3"
              onClick={handleRippleEffect}
              disabled={!password || password !== confirmPassword}
            >
              S'inscrire
            </button>

        
          </form>

       

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
