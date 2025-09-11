import { useState, useEffect } from "react";
import './home.css'

import slides1_1 from '../../../assets/oyemike-princewill-N9fGkZBXNvY-unsplash.jpg';
import slides1_2 from '../../../assets/image copy 2.png';
import slides1_3 from '../../../assets/image copy 3.png';

import slides2_1 from '../../../assets/image.png';
import slides2_2 from '../../../assets/image copy.png';
import slides2_3 from '../../../assets/image.png';

import slides3_1 from '../../../assets/image.png';
import slides3_2 from '../../../assets/image.png';
import slides3_3 from '../../../assets/image.png';

const Home = () => {
  // Vos données existantes (remplacez par vos vrais imports)
const slides1 = [
  {
    src: slides1_1,
    title: "Prêt pour l’aventure ?",
    text: "Testez vos connaissances et relevez le défi du quiz !",
    btn: "Jouer maintenant"
  },
  {
    src: slides1_2,
    title: "Un challenge vous attend",
    text: "Mesurez-vous aux questions et découvrez votre score.",
    btn: "Commencer"
  },
  {
    src: slides1_3,
    title: "Saurez-vous réussir ?",
    text: "Affrontez le quiz et montrez de quoi vous êtes capable.",
    btn: "Tenter ma chance"
  },
];

const slides2 = [
  {
    src: slides2_1,
    title: "Du fun garanti",
    text: "Amusez-vous en testant vos connaissances."
  },
  {
    src: slides2_2,
    title: "Défiez vos amis",
    text: "Qui obtiendra le meilleur score ?"
  },
  {
    src: slides2_3,
    title: "Chaque réponse compte",
    text: "Progressez question après question."
  },
];

const slides3 = [
  {
    src: slides3_1,
    title: "Réflexion rapide",
    text: "Le temps est compté, serez-vous à la hauteur ?"
  },
  {
    src: slides3_2,
    title: "Un quiz plein de surprises",
    text: "Chaque question est un nouveau défi."
  },
  {
    src: slides3_3,
    title: "Atteignez le top",
    text: "Visez le meilleur score et devenez champion."
  },
];


  const [index1, setIndex1] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [index3, setIndex3] = useState(0);

  useEffect(() => {
    const timer1 = setInterval(() => {
      setIndex1((prev) => (prev + 1) % slides1.length);
    }, 4000);

    const timer2 = setInterval(() => {
      setIndex2((prev) => (prev + 1) % slides2.length);
    }, 5000);

    const timer3 = setInterval(() => {
      setIndex3((prev) => (prev + 1) % slides3.length);
    }, 6000);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
    };
  }, []);

  return (
    <>
      <section className="home">

        <div className="container ">
          <div className="section-hero rounded-4">
            {/* Grande image */}
            <div className="grid-one">
              <img
                src={slides1[index1].src}
                alt={slides1[index1].title}
                className="zoom"
              />
              <div className="overlay gradient">
                <h2>{slides1[index1].title}</h2>
                <p>{slides1[index1].text}</p>
                <button className="btn-slide">
                  <span>{slides1[index1].btn}</span>
                </button>
              </div>
            </div>

            {/* Deux petites images */}
            <div className="grid-two">
              <img
                src={slides2[index2].src}
                alt={slides2[index2].title}
                className="zoom"
              />
              <div className="overlay gradient small">
                <h3>{slides2[index2].title}</h3>
                <p>{slides2[index2].text}</p>
              </div>
            </div>

            <div className="grid-three">
              <img
                src={slides3[index3].src}
                alt={slides3[index3].title}
                className="zoom"
              />
              <div className="overlay gradient small">
                <h3>{slides3[index3].title}</h3>
                <p>{slides3[index3].text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;