import './game.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/loading.jsx'
import Logo from '../../../assets/Log.png'
import Icon from '../../../assets/80286.svg';
import loading from '../../../assets/loading.gif';
import magneto from '../../../assets/icons/icon-phone.svg'
import ponto from '../../../assets/icons/ponto.png'
import btnclose from '../../../assets/icons/btn-close.svg'

const QuizComponent = () => {
    useEffect(() => {
    document.title = "FUNQUIZ | Session de jeu";
  }, []);
    const navigate = useNavigate()
    //pop-up de sortie
    const [isVisible, setVisible] = useState('')
  return (
    <div className="container-game vh-100 vw-100 d-flex align-items-center justify-content-center overflow-hidden">

    <Loading />
        <div className="d-flex flex-lg-row flex-column  align-items-center justify-content-center gap-4 container ">

            <button 
                onClick={() => setVisible(true)}
                className="rounded-pill position-absolute z-3 top-0 start-0 p-2 m-5 btn-quiz border-0 bg-transparent overflow-hidden"
            >
                <img 
                    src={btnclose} 
                    width={70} 
                    alt="Close button"
                />
            </button>

            <div className="visio-one position-relative">
                <div className=" d-flex align-items-center">
                    <div style={{width:'100px'}} className="logo">
                        <img src={Logo} className='w-100 h-100' alt="" />
                    </div>
                    <h1 className='fw-bold text-light d-none d-lg-block'>FunQuiz</h1>
                </div>
                
                <div className="bg-light w-100 rounded-4 p-4 overflow-hidden container-custom">
                    <div className="md-visible">
                        <h2 className='fw-bold fs-md-4 fs-custom position-relative'>Question <span className='fs-4 position-absolute end-0'>01/50</span></h2>
                        <h4 className='question-quiz w-100'>Comment s'appelle le plat le plus connu de la Côte d'Ivoire ?</h4>
                    </div>
                    <div style={{height:'380px'}} className="w-100 shadow-inset overflow-hidden rounded-4 mt-4 card-visio-one">
                        <img src="https://i.pinimg.com/1200x/e5/33/2e/e5332efb91d853e6164f85b8d00049b1.jpg" className='w-100 h-100 object-fit-cover' alt="" />
                    </div>
                </div>

                <img src={magneto} width={300} className='position-absolute d-none d-lg-block' style={{left:'-180px', top:'50%'}} alt="" />
            </div>

            <div style={{width:'320px', maxHeight:'600px'}} className="visio-two bg-white shadow-lg rounded-4 p-4 position-relative">
                {/* Header minuteur */}
                <div className="w-100 d-flex gap-3 align-items-center mb-4">
                    <img src={loading} width={60} alt="minuteur" className="minuteur" />
                    <p className="time p-0 m-0 bg-custom-time px-3 py-1 rounded-pill fw-bold">00:00</p>
                </div>

                {/* Question type */}
                <p style={{fontSize:'12px'}} className=" bg-success text-success text-center rounded-pill bg-opacity-10 mb-4">choix unique / choix multiple</p>

                {/* Réponses */}
                <form>
                    {['a', 'b', 'c', 'd'].map((letter, i) => (
                    <button key={letter} className="quiz-btn d-flex gap-2 align-items-center mb-2">
                        <span className="fw-bold text-uppercase letter">{letter}</span>
                        <span>Réponse {i + 1}</span>
                    </button>
                    ))}

                    <button type='submit' className='w-100 rounded-pill py-2 border-0 btn-submit-quiz' >
                        Continuer
                    </button>
                </form>

                <img src={ponto} className='ponto' alt="" />
            </div>

            {isVisible && ( 
                <div className="blur bg-dark bg-opacity-50 top-0 bottom-0 left-0 right-0 position-absolute z-3 w-100 h-100 d-flex align-items-center justify-content-center">
                        <div className="quit-card bg-white shadow-lg rounded-4 p-4 text-center">
                            <h5 className="fw-bold mb-3">Voulez-vous quitter la partie ?</h5>
                            <p className="text-muted mb-4">Votre progression actuelle sera perdue.</p>
                            
                            <div className="d-flex justify-content-center gap-3">
                                <button onClick={()=> setVisible(false)} className="btn btn-secondary rounded-pill px-4">Annuler</button>
                                <button onClick={()=> navigate('/')} className="btn btn-danger rounded-pill px-4">Quitter</button>
                            </div>
                            </div>

                </div>
            )}

        </div>
    </div>
  );
};

export default QuizComponent;