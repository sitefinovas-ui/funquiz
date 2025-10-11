import React, { useEffect, useState } from 'react';
import piece from './../../../assets/icons/piece.png';
import rocket from './../../../assets/icons/rocket.svg';
import userRaking from './../../../assets/icons/user-raking.svg';
import './ranking.css';

import pointService from '../../configurations/Services/pointService';

const Ranking = () => {
  const [rankingData, setRankingData] = useState([]);

  useEffect(() => {
    document.title = 'FUNQUIZ | Classement';
  }, []);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const data = await pointService.getAllUsersPoints();
        setRankingData(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      }
    };

    fetchRankingData();
  }, []);

  return (
    <div className="w-100 h-100 mb-5 overflow-hidden">
      {/* Header classement */}
      <div
        style={{ height: '17rem' }}
        className="d-flex align-items-center justify-content-center container-raking w-100 "
      >
        <img
          src={rocket}
          width={250}
          style={{ left: '300px' }}
          className="ms-5 d-none d-lg-block"
          alt="icon rocket"
        />
        <div className="container d-flex w-100 w-lg-50 flex-column align-items-center justify-content-center">
          <h1 className="fs-custom-raking">Classement</h1>
          <p className="text-muted-custom-desk text-center">
            Retrouvez ici le classement des meilleurs joueurs, mis à jour en temps réel en fonction
            de leurs performances.
          </p>
        </div>
        <img
          src={userRaking}
          width={250}
          style={{ right: '300px' }}
          className="me-5 d-none d-lg-block"
          alt="icon user ranking"
        />
      </div>

      {/* Top 3 joueurs */}
      <div
        className="ranking-content gap-2 w-100 d-flex flex-row flex-nowrap align-items-center justify-content-between pt-5">
        {/* 2ème */}
        {rankingData.length > 1 && (
          <div className="j-2 align-items-center justify-content-center d-flex flex-column">
            <div className="user-animation rounded-circle overflow-hidden">
              <img
                src={rankingData[1].avatar_url}
                className="w-100 h-100 objectif-fit-cover"
                alt={rankingData[1].full_name}
              />
            </div>
            <h2 className="text-capitalize text-light fs-custom-raking-name mt-4">
              {rankingData[1].first_name}
            </h2>
            <span className="text-light fw-bold">
              {rankingData[1].total_points} <img src={piece} width={29} alt="pièce" />
            </span>
          </div>
        )}
        {/* 1er */}
        {rankingData.length > 0 && (
          <div className="position-relative">
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

            <div className="card-cus-raking align-items-center justify-content-center mx-3 d-flex flex-column">
              <div
                className="user-animation bg-success j-1 rounded-circle overflow-hidden b-2"
              >
                <img
                  src={rankingData[0].avatar_url}
                  className="w-100 h-100 objectif-fit-cover"
                  alt={rankingData[0].full_name}
                />
              </div>
              <h2 className="text-capitalize text-light mt-4 felicitation-card fs-custom-raking-name">
                {rankingData[0].first_name}
              </h2>
              <span className="text-light fw-bold">
                {rankingData[0].total_points} <img src={piece} width={29} alt="pièce" />
              </span>
            </div>
          </div>
        )}
        {/* 3ème */}
        {rankingData.length > 2 && (
          <div className="align-items-center justify-content-center d-flex flex-column j-3">
            <div className="user-animation rounded-circle overflow-hidden">
              <img
                src={rankingData[2].avatar_url}
                className="w-100 h-100 objectif-fit-cover"
                alt={rankingData[2].full_name}
              />
            </div>
            <h2 className="text-capitalize text-light mt-4 fs-custom-raking-name">
              {rankingData[2].first_name}
            </h2>
            <span className="text-light fw-bold">
              {rankingData[2].total_points} <img src={piece} width={29} alt="pièce" />
            </span>
          </div>
        )}
      </div>

      {/* Liste des autres joueurs */}
      <div
        style={{ height: '500px' }}
        className="overflow-auto list-gamer d-flex flex-column gap-4 container ranking-list mt-5"
      >
        {rankingData.slice(3).map((rank, index) => (
          <div
            key={rank.user_id}
            className={`ranking-item d-flex align-items-center px-5 justify-content-between`}
          >
            <div className="d-flex text-white align-items-center gap-3">
              <span className="rank-number">{index + 4}</span>
              <img
                src={rank.avatar_url}
                alt={rank.full_name}
                className="rounded-circle border border-light shadow"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              />
              <span className="fw-semibold text-capitalize">{rank.full_name}</span>
            </div>
            <span className="fw-bold text-white score">{rank.total_points} 🪙</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
