import { FaUserShield } from "react-icons/fa";
import { AiTwotoneMessage } from "react-icons/ai";
import { TfiCommentsSmiley } from "react-icons/tfi";
import { GiRapidshareArrow } from "react-icons/gi";
import { useEffect } from "react";


import { useRef } from "react";
import './Dashboard.css'

const HomeDash = () => {
   useEffect(() => {
          document.title = "FUNQUIZ Pro | Tableau de bord";
    }, []);

  const cardData = [
    { title: "Inscription du jour", value: 300, change: "+44%", icon: FaUserShield },
    { title: "Messages reçus", value: 78, change: "-5%", icon: AiTwotoneMessage },
    { title: "Commentaires", value: 56, change: "+22%", icon: TfiCommentsSmiley },
    { title: "Partages", value: 34, change: "+10%", icon: GiRapidshareArrow },
  ];

  const carouselRef = useRef(null);

  return (
    <div className="d-flex flex-column overflow-hidden fw-normal mt-5 w-100 h-100">
      <div className="container-head mb-3">
        <h1 className="title-page fw-bold">Tableau de bord</h1>
        <p className="text-muted-custom">
          Vérifiez les inscriptions, la valeur et le taux de rebond par catégorie.
        </p>
      </div>

      <div className="carousel-container position-relative m-0 p-0">
        <div 
          className="container-card d-flex flex-nowrap overflow-auto align-items-center gap-3 p-2" 
          ref={carouselRef}
        >
          {cardData.map((card, index) => {
            const Icon = card.icon; // récupérer le composant de l'icône
            return (
              <div key={index} className="card card-head shadow p-3 fun-card">
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="d-flex flex-column">
                    <span className="title-card-head">{card.title}</span>
                    <span className="value-card-head">{card.value}</span>
                  </div>
                  <Icon size={40} className="icon-card-head rounded-3 text-light bg-dark p-2" />
                </div>
                <p className={`text-opacity-50 ${card.change.includes("+") ? "text-success" : "text-danger"}`}>
                  {card.change} <span className="text-dark text-opacity-50">cette semaine</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeDash;
