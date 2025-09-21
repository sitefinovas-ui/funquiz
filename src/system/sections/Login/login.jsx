import { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";



import './login.css';

const Login = () => {
    useEffect(() => {
    document.title = "FUNQUIZ | Se connecter";
  }, []);
  const [email, setEmail] = useState('julien@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

 

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
            
            {/* Formulaire */}
            <div className="mb-4">
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Adresse email</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              
              {/* Bouton principal */}
              <button 
                type="button" 
                className="btn btn-primary-custom w-100 mb-3"
                onClick={handleRippleEffect}
              >
                Se connecter
              </button>
              
              {/* Lien vers les plans */}
              <div className="text-center mb-3">
                <a href="/reset" className="btn-link-custom">Mot de passe oublié ?</a>
              </div>
            </div>
            
            {/* Séparateur */}
            <div className="divider">
              <span>ou s'identifier avec</span>
            </div>
            
            {/* Boutons sociaux */}
            <div className="row g-2 mb-4">
                <button type="button" className="btn d-flex align-items-center justify-content-center bg-white btn-social w-100"> Continuer avec
                  <FcGoogle className='ms-1'/>oogle
                </button>
            </div>
            
            {/* Liens du footer */}
            <div className="text-center">
              <p className="text-muted-custom mb-2">
                Pas encore de compte ? <Link to="/sign-up" className="link-custom">S'inscrire</Link>
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <a href="#" className="link-custom">Conditions d'utilisation</a>
                <span className="text-muted-custom">•</span>
                <a href="#" className="link-custom">Privacy Policy</a>
              </div>
            </div>
          </div>
    </div>
  );
};

export default Login;