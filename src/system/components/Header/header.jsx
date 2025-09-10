import './header.css';

import { Link } from 'react-router-dom';
import { useState } from 'react';

import Logo from '../../../assets/logo_funquiz.svg';

import { FaFacebook, FaTwitter, FaTiktok, FaYoutube, FaSearch, FaUser, FaChevronDown } from 'react-icons/fa';




const Header = () => {

     const [isLogin, setIsLogin] = useState(false);
  const [language, setLanguage] = useState('fr'); 


  const size = 20;
  return (
    <header className=" header-desktop w-100 d-flex justify-content-center flex-column align-items-center">
      <div style={{ maxWidth: '', backgroundColor: 'var(--bg-purple)' }}
        className="w-100 mx-auto d-flex py-2 px-5  justify-content-between align-items-center"
      >
        <ul
          style={{ fontSize: '0.8em' }}
          className="p-0 d-flex align-items-center gap-3 text-light m-0 p-0"
        >
          <li>
            <Link className="link-white nav-item-header">Politique de confidentialité</Link>
          </li>
          <li>
            <Link className="link-white nav-item-header">Conditions générales d'utilisation</Link>
          </li>
          <li>
            <Link className="link-white nav-item-header">Mentions légales</Link>
          </li>
        </ul>
        <ul className="d-flex align-items-center gap-3 m-0 p-0">
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaFacebook size={size} />
            </Link>
          </li>
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaTwitter size={size} />
            </Link>
          </li>
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaTiktok size={size} />
            </Link>
          </li>
          <li className="">
            <Link to={'/'} className="link-white">
              {' '}
              <FaYoutube size={size} />
            </Link>
          </li>
        </ul>
      </div>

       <div className="header w-100  d-flex justify-content-center align-items-center">
        <div style={{maxWidth: '1600px'}} className="d-flex justify-content-around align-items-center px-5 py-3 w-100">
        {/* Logo */}
        <div className="logo" style={{ width: '120px' }}>
          <button 
            onClick={() => window.location.reload()}
            className="bg-transparent border-0 w-100 d-flex align-items-center justify-content-center rounded"
            style={{ height: '100px' }}
          >
            <img src={Logo} alt="Logo_funquiz" className="w-100 h-100" style={{ objectFit: 'contain' }} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div  className="search-futuristic d-flex align-items-center" style={{ flex: 1, maxWidth: '500px', margin: '0 20px', position: 'relative' }} >
          <input
            type="text"
            placeholder="Rechercher..."
            className="search-input rounded-5"
            style={{
              width: '100%',
              padding: '16px 20px',
              paddingRight: '50px',
              outline: 'none',
              fontSize: '14px'
            }}
           
          />
          <button
            onClick={() => {}}
            className="search-button"
            style={{
              position: 'absolute',
              right: '22px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <FaSearch size={16} />
          </button>
        </div>

        {/* Language */}
        <div className="language-selector">
          <div className="custom-select">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="language-select"
            >
              <option value="fr">Français (FR)</option>
              <option value="en">English (EN)</option>
            </select>
            <div className="select-icon">
              <FaChevronDown size={12} />
            </div>
          </div>
        </div>

        {/* Login */}
        <div className="login d-flex align-items-center gap-3 position-relative">
          {isLogin ? (
            <>
              <div className="d-flex align-items-center gap-3">
                {/* Badge points */}
                <span
                  className="points-badge rounded-circle d-flex justify-content-center align-items-center text-white"

                  style={{
                    fontWeight: "600",
                    width: '45px',
                    height: '45px',
                    fontSize: '13px',
                    background:"var(--orange-20)"
                  }}
                >
                  247
                </span>

                {/* Bouton utilisateur */}
                <button
                  onClick={() => setIsLogin(false)}
                  className="user-button d-flex align-items-center gap-4 px-3 py-2 rounded-5"
                  style={{ cursor: "pointer" }}
                >
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    Fatim K.
                  </span>
                  <div
                    className="user-avatar rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '35px', height: '35px' }}
                  >
                    <FaUser size={14} />
                  </div>
                  
                </button>
              </div>

            
            </>
          ) : (
            <button
              onClick={() => setIsLogin(true)}
              className="connect-button px-4 py-2 rounded"
              style={{
                cursor: "pointer",
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Se connecter
            </button>
          )}
        </div>
        </div>
      </div>
    

    </header>
  );
};
export default Header;
