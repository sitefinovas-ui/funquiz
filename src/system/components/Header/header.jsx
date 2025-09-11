import './header.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../../../assets/logo_funquiz.svg';
import { FaFacebook, FaTwitter, FaTiktok, FaYoutube, FaSearch, FaUser } from 'react-icons/fa';

const Header = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [language, setLanguage] = useState('fr');

  return (
    <header className="header-pro">
      {/* --- TOPBAR --- */}
      <div className="topbar p-0 m-0">
        <div className="container">
          <ul className="links">
            <li><Link to="/">Confidentialité</Link></li>
            <li><Link to="/">CGU</Link></li>
            <li><Link to="/">Mentions légales</Link></li>
          </ul>
          <ul className="socials">
            <li><FaFacebook /></li>
            <li><FaTwitter /></li>
            <li><FaTiktok /></li>
            <li><FaYoutube /></li>
          </ul>
        </div>
      </div>

      {/* --- MAIN HEADER --- */}
      <div className="main-header container">
        {/* Logo */}
        <div className="logo">
          <img src={Logo} alt="FunQuiz Logo" />
        </div>

        {/* Search */}
        <form className="search">
          <button type='submit' className=" btn border-0 search-icon">
            <FaSearch className="" />
          </button>
          <input type="text" placeholder="Rechercher un quiz..." />
        </form>

        {/* Actions */}
        <div className="actions">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)} 
            className="lang"
          >
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>

          {isLogin ? (
            <button className="user-btn" onClick={() => setIsLogin(false)}>
              <FaUser /> <span>Fatim K.</span>
            </button>
          ) : (
            <button className="login-btn" onClick={() => setIsLogin(true)}>Se connecter</button>
          )}
        </div>
      </div>

      {/* --- MENU --- */}
      <nav className="menu container">
        <Link to="/">Accueil</Link>
        <Link to="/classement">Classement</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">Contact</Link>
      </nav>

      {/* --- THEMES --- */}
      <div className="themes container">
        <div className="theme-card">
          <div className="img-card">
            <img src="" className='' alt="" />
          </div>
          Artiste </div>
        <div className="theme-card">
          <div className="img-card">
            <img src="" className='' alt="" />
          </div>
          Code de la route</div>
        <div className="theme-card">
          <div className="img-card">
            <img src="" className='' alt="" />
          </div>
          Expression</div>
        <div className="theme-card">
          <div className="img-card">
            <img src="" className='' alt="" />
          </div>
          Culture</div>
        <div className="theme-card">
          <div className="img-card">
            <img src="" className='' alt="" />
          </div>
          Musique</div>
        <div className="theme-card">
          <div className="img-card">
            <img src="" className='' alt="" />
          </div>
          Jeux</div>
      </div>
    </header>
  );
};

export default Header;
