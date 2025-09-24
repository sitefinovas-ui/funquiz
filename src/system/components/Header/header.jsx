import './header.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SiHomeassistant, SiNintendogamecube } from 'react-icons/si';
import { FaSearch } from 'react-icons/fa';
import { GrInfo } from 'react-icons/gr';
import { IoMdMail } from "react-icons/io";
import { MdAccountCircle } from "react-icons/md";


import Logo from '../../../assets/Log.png'
import piece from '../../../assets/icons/piece.png';

const Header = ({openPopup}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGame = location.pathname === '/step';
  const isLogin = location.pathname === '/login';
  const isSignUp = location.pathname === '/sign-up';
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {!isGame && !isSignUp && !isLogin && (
        <div className="position-relative z-3">
          {/* === Header Desktop === */}
          <header className="d-none d-lg-block">
            <div
              style={{ backgroundColor: '#0d0d19' }}
              className="header-desktop d-flex align-items-center justify-content-between p-5"
            >
              {/* Navigation */}
              <div className="d-flex align-items-center gap-5">
                <nav className="nav-header">
                  <ul className="d-flex align-items-center gap-5 list-unstyled m-0">
                    <li>
                      <button onClick={()=>navigate('/')} className=" btn-header-custom text-white text-decoration-none">
                        <SiHomeassistant /> Accueil
                      </button>
                    </li>
                    <li>
                      <button onClick={() => openPopup("thematic")} className=" btn-header-custom text-white text-decoration-none">
                        <SiNintendogamecube /> Quiz
                      </button>
                    </li>
                  </ul>
                </nav>

                {/* Search bar */}
                <form className="search-bar d-flex align-items-center position-relative">
                  <input
                    type="text"
                    className="search-input w-100 px-4 py-3 rounded-pill"
                    placeholder="Rechercher un quiz..."
                  />
                  <button type="submit" className="search-btn position-absolute">
                    <FaSearch />
                  </button>
                </form>
              </div>

              {/* Logo */}
              <div style={{width:'100px'}} className="logo d-flex align-items-center justify-content-center">

                <img src={Logo} className='w-100 h-100' alt="" />
                <h1 className='fw-bold text-light'>FunQuiz</h1>
              </div>

              {/* Actions */}
              <div className="d-flex gap-3 align-items-center justify-content-center">
                <button onClick={() => navigate('/terms')} className="info-btn">
                  <GrInfo size={26} className="icon text-white" />
                </button>

                {isAuthenticated && (
                  <button className="btn d-flex align-items-center bg-secondary text-white bg-opacity-25 rounded-pill">
                    <img
                      src={piece}
                      width={30}
                      className="object-fit-cover"
                      alt="pièces"
                    />
                    <span className="p-1">100.000</span>
                  </button>
                )}

                <select style={{backgroundColor:'var(--purple-select-from)'}} className="form-select text-white border-0 w-auto">
                  <option value="fr">🇫🇷 Français</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                </select>

                {isAuthenticated ? (
                  <button
                    style={{ width: '70px', height: '70px' }}
                    onClick={() => navigate('/profile')}
                    className="rounded-5 overflow-hidden border border-white"
                  >
                    <img
                      src="https://img.freepik.com/photos-premium/image-photorealiste-hyper-realiste-fond-blanc-ai-generee-par-freepik_643360-530895.jpg?semt=ais_hybrid&w=740&q=80"
                      className="object-fit-cover w-100"
                      alt="profil"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="rounded-5 py-2 px-3 btn-wall-custom border-0 text-white"
                  >
                    Se connecter
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* === Footer Mobile === */}
          <div className="d-flex align-items-center justify-content-center w-100">
            <div
              style={{ height: '80px', maxWidth: '90%', zIndex: 99999 }}
              className="d-flex align-items-center justify-content-between gap-4 px-4 d-lg-none bg-mobile shadow-lg position-fixed bottom-0 w-100 rounded-pill m-2 mx-auto left-0 right-0"
            >
              {/* Bloc gauche */}
              <nav className="flex-1">
                <ul className="d-flex align-items-center justify-content-center gap-3 list-unstyled m-0">
                  <li>
                    <button onClick={()=>navigate('/')} className="btn-mb-header text-decoration-none">
                      <SiHomeassistant /> <span className="title-header">Accueil</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => openPopup("thematic")} className="btn-mb-header text-decoration-none">
                      <SiNintendogamecube /> <span className="title-header">Quiz</span>
                    </button>
                  </li>
                </ul>
              </nav>

              {/*logo*/}
              <div style={{width: '100px'}} className="logo d-flex align-items-center justify-content-center">
                  <img src={Logo} className='w-100 h-100' alt="" />
              </div>

              {/* Bloc droit */}
              <nav className="flex-1">
                <ul className="d-flex align-items-center justify-content-center gap-3 list-unstyled m-0">
                  <li>
                    <button onClick={()=>navigate('/contact')} className="btn-mb-header text-decoration-none">
                      <IoMdMail /> <span className="title-header">Contact</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={()=>navigate('/profil')}  className="btn-mb-header text-decoration-none">
                      <MdAccountCircle /> <span className="title-header">Profil</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

export default Header;
