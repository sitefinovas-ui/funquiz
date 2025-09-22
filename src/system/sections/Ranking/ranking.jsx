import { useState, useEffect } from 'react';
import piece from './../../../assets/icons/piece.png'
import rocket from './../../../assets/icons/rocket.svg'
import userRaking from './../../../assets/icons/user-raking.svg'
import './ranking.css'

const Ranking = () => {
    useEffect(() => {
    document.title = "FUNQUIZ | Classement";
  }, []);
    return (
        <div className="w-100 h-100 mb-5 overflow-hidden" >

            <div style={{height: '17rem'}} className=" d-flex align-items-center justify-content-center container-raking  w-100 mb-5">

                <img src={rocket} width={250} style={{left: '300px'}} className='ms-5 d-none d-lg-block' alt="icon rocket" />
                <div className="container d-flex w-50 flex-column align-items-center justify-content-center">
                    <h1 className='fs-custom-raking'>Classement</h1>
                    <p className="text-muted-custom-desk  text-center">
                    Retrouvez ici le classement des meilleurs joueurs, mis à jour en temps réel en fonction de leurs performances.
                    </p>
                </div>
                <img src={userRaking} width={250} style={{right: '300px'}} className='me-5 d-none d-lg-block' alt=" icon user raking" />
            </div>

            <div className="ranking-content gap-4 w-100 d-flex align-items-center justify-content-center">

                <div className="j-2 align-items-center justify-content-center d-flex flex-column ">
                    <span></span>
                    <div className="user-animation rounded-circle overflow-hidden">
                    <img src="https://i.pinimg.com/736x/6f/a3/6a/6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg" className='w-100 h-100 objectif-fit-cover' alt="" />
                    </div>
                    <h2 className='text-capitalize text-light fs-custom-raking-name mt-4'>joueur 2</h2>
                    <span className='text-light fw-bold'> 90.000 
                        <img src={piece} width={29} alt="" />
                    </span>
                </div>

                <div className=" position-relative">
                  {/* Confettis */}
                  {[...Array(20)].map((_, i) => (
                    <span
                      key={i}
                      className="confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        animationDelay: `${Math.random() * 2}s`,
                      }}
                    />
                  ))}

                  {/* Carte joueur */}
                  <div className="card-cus-raking align-items-center justify-content-center d-flex flex-column ">
                    <span></span>
                    <div  className="user-animation j-1 rounded-circle overflow-hidden b-2 ">
                      <img 
                        src="https://i.pinimg.com/736x/6f/a3/6a/6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg" 
                        className='w-100 h-100 objectif-fit-cover' 
                        alt="joueur" 
                      />
                    </div>
                    <h2 className='text-capitalize text-light mt-4 felicitation-card fs-custom-raking-name'>Joueur 1</h2>
                    <span className='text-light fw-bold'> 100.000 
                      <img src={piece} width={29} alt="pièce" />
                    </span>
                  </div>
                </div>


                <div className="align-items-center justify-content-center d-flex flex-column ">
                    <span></span>
                    <div className="j-3 user-animation rounded-circle overflow-hidden">
                        <img src="https://i.pinimg.com/736x/6f/a3/6a/6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg" className='w-100 h-100 objectif-fit-cover' alt="" />
                    </div>
                    <h2 className='text-capitalize text-light mt-4 fs-custom-raking-name'>joueur 3</h2>
                    <span className='text-light fw-bold'> 50.000 
                        <img src={piece} width={29} alt="" />
                    </span>

                </div>
            </div>
            <div style={{height:'500px'}} className="overflow-auto list-gamer d-flex flex-column gap-4 container ranking-list mt-5">
            {[
                { id: 1, name: "Joueur 1", score: 100000, img: "https://i.pinimg.com/736x/6f/a3/6a/6fa36aa2c367da06b2a4c8ae1cf9ee02.jpg" },
                { id: 2, name: "Joueur 2", score: 95000, img: "https://i.pinimg.com/564x/02/7f/71/027f71317a6d9d9eaa6db3d2efeff93c.jpg" },
                { id: 3, name: "Joueur 3", score: 90000, img: "https://i.pinimg.com/564x/7e/18/30/7e1830e0dc69c713a35fcf9d9bce64db.jpg" },
                { id: 4, name: "Joueur 4", score: 85000, img: "https://i.pinimg.com/564x/46/6d/70/466d70de5aa875540b8db8f64d4e6f28.jpg" },
                { id: 5, name: "Joueur 5", score: 82000, img: "https://i.pinimg.com/564x/9a/72/37/9a7237c339b9c8a1a1c8f343b6c8425c.jpg" },
                { id: 6, name: "Joueur 6", score: 80000, img: "https://i.pinimg.com/564x/d7/06/ed/d706ed87abf7b5f0f0c96a20646cbb12.jpg" },
                { id: 7, name: "Joueur 7", score: 78000, img: "https://i.pinimg.com/564x/f7/20/6d/f7206d743cd7a6a41cc932fbc9b91875.jpg" },
                { id: 8, name: "Joueur 8", score: 75000, img: "https://i.pinimg.com/564x/43/c5/34/43c5345149a16bcb82f41e6f94d8a332.jpg" },
                { id: 9, name: "Joueur 9", score: 72000, img: "https://i.pinimg.com/564x/1f/b9/2a/1fb92ab0db62f0f5c3e9a414c34a87fb.jpg" },
                { id: 10, name: "Joueur 10", score: 70000, img: "https://i.pinimg.com/564x/8a/19/9d/8a199d8d9dd12c6e8f589e6d56eabf02.jpg" }
            ].map((player, index) => (
                <div key={player.id} className={`ranking-item rank-${index + 1} d-flex align-items-center px-5 justify-content-between`}>
                    <div className="d-flex text-white align-items-center gap-3">
                        <span className="rank-number">{index + 1}</span>
                        <img
                        src={player.img}
                        alt={player.name}
                        className="rounded-circle border border-light shadow"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                        <span className="fw-semibold text-capitalize">{player.name}</span>
                    </div>

                     <span className="fw-bold text-white score">{player.score.toLocaleString()} 🪙</span>
                </div>
            ))}
            </div>

        </div>
          
    );
};

export default Ranking;