// Home.jsx
import './home.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import musique from '../../../assets/icons/thematic/t-music.svg'
import sport from '../../../assets/icons/thematic/t-sport.svg'
import gastronomie from '../../../assets/icons/thematic/t-gastro.svg'
import priceOne from '../../../assets/icons/price/price_one.png'
import secondPrice from '../../../assets/icons/price/second_price.png'
import threePrice from '../../../assets/icons/price/three_price.png'
import google from '../../../assets/icons/google.png'

import { MdGamepad } from "react-icons/md";
import { FaUserPlus, FaGift, FaInfo, FaPlus } from "react-icons/fa";
import { SlActionRedo } from "react-icons/sl";


const Home = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const containerRef = useRef(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Comment ça marche ?",
      answer: "Créez un compte, connectez-vous et commencez à utiliser nos services facilement."
    },
    {
      question: "Est-ce gratuit ?",
      answer: "Oui, l’inscription est gratuite. Certaines fonctionnalités avancées sont payantes."
    },
    {
      question: "Puis-je utiliser le service sur mobile ?",
      answer: "Oui, notre site est entièrement responsive et fonctionne sur tous les appareils."
    },
    {
      question: "Comment vous contacter ?",
      answer: "Vous pouvez nous écrire via la page de contact ou par email. Nous répondons rapidement."
    }
  ];

  useEffect(() => {
    const root = containerRef.current || document;
    const sections = root.querySelectorAll("section");

    if (!('IntersectionObserver' in window)) {
      // Fallback simple: show all sections
      sections.forEach(s => s.classList.add('show'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // add class (triggers CSS transition)
            entry.target.classList.add("show");
            // stop observing this element (animation only once)
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    sections.forEach(section => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className='home pb-5 d-flex flex-column align-items-center'>

      {/* HERO */}
      <section className="section container hero position-relative">
        <div className=" w-100 d-flex flex-column align-items-center justify-content-center mt-4">
          <p style={{fontSize: '12px'}} className='text-white d-flex gap-1 align-items-center justify-content-center text-center fw-normal w-100'> 
            <span style={{color: 'var(--yellow)' }}className='d-flex align-items-center justify-content-center gap-1'>
              <FaGift /> 1 mois
            </span> - <span className='text-white font-bold'>Accès gratuit</span>
          </p>
          <h1 className=' text-white text-center title-home fw-bold'>
            Jouez et devenez<br/> Incollable
          </h1>

          <p style={{fontSize: '14px'}} className='w-75  text-white mt-2 text-opacity-25 text-center fw-normal'>Testez vos connaissances à travers des quiz rapides, amusants et surprenants.</p>
        </div>

        {/* cards container (position:absolute in your CSS) */}
        <div className="cards-container d-lg-flex d-none">
          {/* ... vos cartes thematiques (laissez la structure d'origine) */}
          <div className="card-thematic t-one overflow-hidden position-absolute">
            <div className=" d-flex mt-2 justify-content-between align-items-center">
              <h3 className="name-thematic d-flex flex-column text-white fs-3">Musique <span style={{fontSize: '12px'}} className=' text-light text-opacity-50 fw-normal '>+2734 questions</span></h3>
              <button className='btn px-3 btn-outline-dark rounded-5'><FaInfo/></button>
            </div>
            <div style={{width: '100%'}} className="d-flex justify-content-center align-items-center">
              <img src={musique} alt="" className='w-100 h-100' />
            </div>
          </div>

          <div className="card-thematic t-two overflow-hidden position-absolute">
            <div className=" d-flex mt-2 justify-content-between align-items-center">
              <h3 className="name-thematic d-flex flex-column text-white fs-3">Sport <span style={{fontSize: '12px'}} className=' text-light text-opacity-50 fw-normal '>+2734 questions</span></h3>
              <button className='btn px-3 btn-outline-dark rounded-5'><FaInfo/></button>
            </div>
            <div style={{width: '100%'}} className="d-flex justify-content-center align-items-center">
              <img src={sport} alt="" className='w-100 h-100' />
            </div>
          </div>

          <div className="card-thematic t-three overflow-hidden position-absolute">
            <div className=" d-flex mt-2 justify-content-between align-items-center">
              <h3 className="name-thematic d-flex flex-column text-white fs-3">Gastronomie <span style={{fontSize: '12px'}} className=' text-light text-opacity-50 fw-normal '>+2734 questions</span></h3>
              <button className='btn px-3 btn-outline-dark rounded-5'><FaInfo/></button>
            </div>
            <div style={{width: '100%'}} className="d-flex justify-content-center align-items-center">
              <img src={gastronomie} alt="" className='w-100 h-100' />
            </div>
          </div>

          <div className="card-thematic t-four overflow-hidden position-absolute">
            <div className=" d-flex mt-2 justify-content-between align-items-center">
              <h3 className="name-thematic d-flex flex-column text-white fs-3">Culture <span style={{fontSize: '12px'}} className=' text-light text-opacity-50 fw-normal '>+2734 questions</span></h3>
              <button className='btn px-3 btn-outline-dark rounded-5'><FaInfo/></button>
            </div>
            <div style={{width: '100%'}} className="d-flex justify-content-center align-items-center">
              <img src={musique} alt="" className='w-100 h-100' />
            </div>
          </div>

          <div className="card-thematic t-five overflow-hidden position-absolute">
            <div className=" d-flex mt-2 justify-content-between align-items-center">
              <h3 className="name-thematic d-flex flex-column text-white fs-3">Vie quotidienne <span style={{fontSize: '12px'}} className=' text-light text-opacity-50 fw-normal '>+2734 questions</span></h3>
              <button className='btn px-3 btn-outline-dark rounded-5'><FaInfo/></button>
            </div>
            <div style={{width: '100%'}} className="d-flex justify-content-center align-items-center">
              <img src={musique} alt="" className='w-100 h-100' />
            </div>
          </div>

          <div className="card-thematic t-six overflow-hidden position-absolute">
            <div className=" d-flex mt-2 justify-content-between align-items-center">
              <h3 className="name-thematic d-flex flex-column text-white fs-3">Language <span style={{fontSize: '12px'}} className=' text-light text-opacity-50 fw-normal '>+2734 questions</span></h3>
              <button className='btn px-3 btn-outline-dark rounded-5'><FaInfo/></button>
            </div>
            <div style={{width: '100%'}} className="d-flex justify-content-center align-items-center">
              <img src={musique} alt="" className='w-100 h-100' />
            </div>
          </div>
        </div>
        {/* bulles container */}
        <div 
          style={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none', 
            height:'250px'
          }} 
          className="container-bulle d-flex align-items-center d-lg-none"
        >
          <div className="d-inline-flex gap-3" style={{padding: '0 20px'}}>
            
            <div className="bulle-custom d-flex flex-column align-items-center" style={{ scrollSnapAlign: 'center' }}>
              <div style={{width: '100px', height: '100px'}} className="rounded-circle container-img-bulle overflow-hidden b-zero">
                <img src="https://i.pinimg.com/736x/58/af/d6/58afd68fd0c3f3924455d74e86164eb7.jpg" className='w-100 h-100' alt="" />
              </div>
              <p className='text-white pt-3'>Musique</p>
            </div>

            <div className="bulle-custom d-flex flex-column align-items-center" style={{ scrollSnapAlign: 'center' }}>
              <div style={{width: '100px', height: '100px'}} className="rounded-circle container-img-bulle overflow-hidden b-one">
                <img src="https://i.pinimg.com/1200x/54/57/38/545738fc6c989280f7b1c0786222f496.jpg" className='w-100 h-100' alt="" />
              </div>
              <p className='text-white pt-3'>Sport</p>
            </div>

            <div className="bulle-custom d-flex flex-column align-items-center" style={{ scrollSnapAlign: 'center' }}>
              <div style={{width: '100px', height: '100px'}} className="rounded-circle container-img-bulle overflow-hidden b-two">
                <img src="https://i.pinimg.com/736x/65/76/a4/6576a4fa98f5f34c3ef0accc1e5c1f36.jpg" className='w-100 h-100' alt="" />
              </div>
              <p className='text-white pt-3'>Gastronomie</p>
            </div>

            <div className="bulle-custom d-flex flex-column align-items-center" style={{ scrollSnapAlign: 'center' }}>
              <div style={{width: '100px', height: '100px'}} className="rounded-circle container-img-bulle overflow-hidden b-three">
                <img src="https://i.pinimg.com/1200x/71/fd/2e/71fd2e527a4f2b006e80ac06844e3e3c.jpg" className='w-100 h-100' alt="" />
              </div>
              <p className='text-white pt-3'>Culture</p>
            </div>

            <div className="bulle-custom d-flex flex-column align-items-center" style={{ scrollSnapAlign: 'center' }}>
              <div style={{width: '100px', height: '100px'}} className="rounded-circle container-img-bulle overflow-hidden b-four">
                <img src="https://i.pinimg.com/736x/2a/9b/d3/2a9bd35abf540d14b9fb23de2c8ed540.jpg" className='w-100 h-100' alt="" />
              </div>
              <p className='text-white pt-3'>Le quotidien</p>
            </div>

            <div className="bulle-custom d-flex flex-column align-items-center" style={{ scrollSnapAlign: 'center' }}>
              <div style={{width: '100px', height: '100px'}} className="rounded-circle container-img-bulle overflow-hidden b-five">
                <img src="https://i.pinimg.com/1200x/d1/55/9d/d1559d46cdc371704292d403d66f4777.jpg" className='w-100 h-100' alt="" />
              </div>
              <p className='text-white pt-3'>Langue</p>
            </div>

          </div>
        </div>
      </section>

      {/* TOP section */}
      <section className="section top">
        <div className="title-top text-center text-light my-4">
          <h2 className="fs-custom text-light fw-bold">Classement des joueurs</h2>
          <div className="divider mx-auto text-center text-light my-2"></div>
          <p className="text-light fw-100">
            Découvrez le top des joueurs et défiez vos<br/> amis pour entrer dans le classement !
          </p>
        </div>

        <div className="bubbles-container d-flex gap-4 position-relative">
          {/* player 1 */}
          <div style={{width: '100px', height: '250px'}} className="bubble position-relative b-1">
            <span className="notif-badge">
              <img src={priceOne} alt="badge" className="badge-img" />
            </span>
            <div className="user-img-container w-100 position-absolute bottom-0">
              <img src="https://i.pinimg.com/736x/3b/19/11/3b1911246fc66f81cbc8a0035014569b.jpg" alt="bubble" className="user-img b-1 w-100 h-100 " />
              <p className='name-gamer'>Joueur 1</p>
            </div>
          </div>

          {/* player 2 */}
          <div style={{width: '100px', height: '250px'}} className="bubble position-relative ">
            <span className="notif-badge">
              <img src={secondPrice} alt="badge" className="badge-img" />
            </span>
            <div className="user-img-container position-absolute bottom-0">
              <img src="https://i.pinimg.com/736x/3b/19/11/3b1911246fc66f81cbc8a0035014569b.jpg" alt="bubble" className="user-img w-100 h-100 " />
              <p className='name-gamer'>Joueur 2</p>
            </div>
          </div>

          {/* player 3 */}
          <div style={{width: '100px', height: '250px'}} className="bubble position-relative  ">
            <span className="notif-badge">
              <img src={threePrice} alt="badge" className="badge-img p-0 m-0 w-100 h-100" />
            </span>
            <div className="user-img-container position-absolute bottom-0">
              <img src="https://i.pinimg.com/736x/3b/19/11/3b1911246fc66f81cbc8a0035014569b.jpg" alt="bubble" className="user-img w-100 h-100 " />
              <p className='name-gamer'>Joueur 3</p>
            </div>
          </div>
          
          <button
          onClick={() => navigate('/raking')}
          className="btn-add position-absolute end-0 me-5"
          aria-label="View rankings">
            <FaPlus size={27} />
          </button>

        </div>
      </section>

      {/* OPINION + FAQ */}
      <section className="section px-5 py-5 d-flex flex-lg-row gap-4 flex-column justify-content-center align-items-center">
        <div className="w-100">
          <div>
            <h6 className="text-light d-flex flex-row gap-2 align-items-center fw-normal">
              Qu'est-ce que les autres disent sur nous ? 
              <Link to="/opinions" className="btn-discover text-nowrap d-flex align-items-center gap-2">
                Tout savoir <SlActionRedo />
              </Link>
            </h6>
          </div>

          <div className="mt-4">
            <h2 style={{fontSize:"2.5rem", fontWeight:"500", lineHeight:'1.3', letterSpacing: '0.5px'}} className="text-light text-focuss position-relative w-100">
              Tout fonctionne parfaitement sur mobile, tablette et ordinateur.
            </h2>

            <p style={{fontSize:"1rem", fontWeight:"400", lineHeight:'1.5', letterSpacing: '0.5px'}} className="text-light mt-3 w-100">
              Retrouvez ici toutes les réponses aux questions les plus fréquentes pour profiter pleinement de notre service.
            </p>
          </div>

          <div className="d-flex flex-column flex-md-row w-100 mt-4 gap-3">
            <button onClick={() => navigate('/login')} className='btn py-2 bg-white fw-bold text-dark rounded-5'>Se connecter</button>
            <button onClick={() => navigate('/sign-up')} className='btn py-2 border fw-bold text-light rounded-5'>Inscription</button>
          </div>
        </div>

        <div className="container mt-5">
          <h2 className="text-center text-light mb-4 fs-4">Les questions fréquentes</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${activeIndex === index ? "active" : ""}`}>
                <button className="faq-question py-3" onClick={() => toggleFAQ(index)}>
                  {faq.question}
                  <span>{activeIndex === index ? "−" : "+"}</span>
                </button>
                {activeIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

     {/* GOOGLE OPINIONS */}
      <section className="section py-5">
        {/* Header */}
        <div className="container text-center mb-5">
          <div className="d-flex align-items-center justify-content-center gap-3">
            <img 
              src={google} 
              width={50} 
              height={50} 
              alt="Google logo" 
              className="img-fluid" 
            />
            <h2 className="m-0 text-light fw-bold d-flex align-items-center gap-2">
              Google 
              <span
                className="fw-normal"
                style={{
                  background: "linear-gradient(145deg, rgb(158, 4, 4), rgb(79, 178, 18))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Opinions des joueurs
              </span>
            </h2>
          </div>
        </div>

        {/* Reviews */}
        <div className="container">
          <div className="row g-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="col-12 col-md-4">
                <div className="card-opinion bg-dark bg-opacity-25 p-4 rounded-4 h-100 shadow-sm">
                  <div className="d-flex gap-3">
                    {/* User Avatar */}
                    <img
                      src="https://i.pinimg.com/736x/3b/19/11/3b1911246fc66f81cbc8a0035014569b.jpg"
                      width={60}
                      height={60}
                      alt="User profile"
                      className="rounded-circle user-img border border-2 border-light"
                    />
                    
                    {/* User Info & Review */}
                    <div className="d-flex flex-column flex-grow-1">
                      <div className="mb-2">
                        <h6 className="user-name mb-1 text-light fw-semibold">
                          Name Joueur
                        </h6>
                        <small className="date text-light opacity-75">
                          12/01/2024
                        </small>
                      </div>
                      <p className="text-light mb-0 fst-italic">
                        "FUNQUIZ est une plateforme de jeu en ligne..."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className='section pb-5'>
        <div className="container newsletter d-flex flex-column align-items-center rounded-pill text-center p-5">
          <div className="title-newsletter d-flex flex-row align-items-center justify-content-center text-light gap-5 mb-4">
           <h2 className="fw-bold w-100 text-light">
            Rejoignez notre newsletter pour être informé des dernières actualités, offres spéciales et événements.
          </h2>

          </div>

          <form action="" className="newsletter-form bg-white p-3 align-items-center rounded-pill d-flex flex-row gap-2 justify-content-center">
            <input 
              type="email" 
              placeholder="Entrez votre email" 
              className='w-100 rounded-pill p-1 bg-transparent border-0'
              required 
            />
            <button style={{backgroundColor: "rgb(88, 8, 113)"}} className='btn rounded-pill text-light px-4 py-2' type="submit">S'inscrire</button>
          </form>
        </div>
      </section>

      {/* SECURITY */}
      <section className='section pb-5'>
        
      </section>


    </div>
  );
};

export default Home;
