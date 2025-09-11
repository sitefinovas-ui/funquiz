import './infos.css'

import Wall from '../../../assets/10740576.jpg';
import Logo from '../../../assets/logo_funquiz.svg'

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Info = () => {
    const [showPopup, setShowPopup] = useState(true);
    const [animateIn, setAnimateIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Déclencher l'animation après le montage du composant
        if (showPopup) {
            setTimeout(() => setAnimateIn(true), 100);
        }
    }, [showPopup]);

    if (!showPopup) return null;
    
    return (
        <div className='bg-dark bg-opacity-50 vh-100 w-100 border position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center'
             style={{ zIndex: 9999, backdropFilter: 'blur(10px)' }}>

            <div 
                className={`container-pop-up d-flex rounded-4 overflow-hidden ${animateIn ? 'animate-in shadow-dance' : ''}`}
                style={{
                    height: '500px', 
                    width: '800px',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>

                <div 
                    className="img_left position-relative bg-light overflow-hidden"
                    style={{
                        width:'1450px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                    <div className="gradient-overlay"></div>
                    <img 
                        src={Wall} 
                        className='w-100 h-100 object-fit-cover animate-pulse' 
                        alt="image de fond" />

                    <img 
                        src={Logo}
                        className='position-absolute m-3 logo-animation' 
                        width={100} 
                        height={100} 
                        alt="logo funquiz" />
                </div>

                <div 
                    className="container-right w-100 overflow-hidden p-5 d-flex flex-column position-relative"
                    style={{
                        background:'var(--bg-light)',
                        position: 'relative',
                        zIndex: 2
                    }}>
                    <button 
                        type="button" 
                        className="btn-close fs-6 border-0 position-absolute top-0 m-3 end-0 btn-close-animated" 
                        onClick={() => setShowPopup(false)}>
                    </button>

                    <h2 className="logo d-flex flex-column align-items-center text-center mb-3 text-glow"> 
                        <span className="Logo_funquiz color-shift">FunQuiz</span> 
                        <span className="sous-log">2025</span>
                    </h2>

                    <p 
                        className="text-secondary text-center mb-4 mt-3 fade-in-text"
                        style={{fontSize:'13px'}}>
                        Prouvez votre talent, empochez des points et dominez vos amis partout en Côte d'Ivoire ! <br/><br/>
                        Inscrivez-vous et démarrez l'aventure !
                    </p>

                    <button 
                        className="button-popup pulse-effect"
                        onClick={() => navigate('/sign-up')}>
                        S'inscrire
                    </button>
                
                    <div className="position-absolute start-0 end-0 bottom-0 w-100 footer-links-container">
                        <ul className='d-flex w-100 p-0 mb-3 gap-3 justify-content-center align-items-center'>
                            <li className='item-popup'>
                                <Link to={"/"} className='link-hover-effect'>Confidentialité</Link>
                            </li>
                            <li className='item-popup'>
                                <Link to={"/"} className='link-hover-effect'>CGU</Link>
                            </li>
                            <li className='item-popup'>
                                <Link to={"/"} className='link-hover-effect'>Mentions légales</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Info