import { useState } from "react";
import { Link } from "react-router-dom";
import { usePopup } from "../../configurations/Context/PopupContext.jsx";

import "./profil.css"; 

import { FcAddressBook, FcPlanner, FcGlobe } from "react-icons/fc";
import Price from '../../../assets/icons/price/second_price.png'



const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [isDelete, setDelete] = useState(false);
  const [checked, setChecked] = useState(false);

  const { setActivePopup } = usePopup();

  const [userStats] = useState({
    totalQuizzes: 156,
    correctAnswers: 1247,
    streak: 12,
    level: 15,
    xp: 2450,
    nextLevelXP: 2800,
  });


  const [userInfo] = useState({
    username: "Fatim K.",
    email: "fatimkeita@email.com",
    number: "+225 0704305430",
    avatar: "https://i.pinimg.com/736x/7b/ee/e0/7beee03a673101945753c3a5b02bc8b5.jpg",
    joinDate: "Janvier 2024",
    country: "Côte d'ivoire",
    favoriteCategory: "Gastronomie",
  });

  const progressPercentage = (userStats.xp / userStats.nextLevelXP) * 100;

  // 👇 contenu des onglets
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div>
            <h2>📈 Vue d'ensemble</h2>
            <p>+15% par rapport à la semaine dernière</p>
          </div>
        );
      case "quizzes":
        return (
          <div>
            <h2>📝 Mes Quiz</h2>
            <p>Historique des quiz récents et scores.</p>
          </div>
        );
      case "achievements":
        return (
          <div>
            <h2>🏆 Succès</h2>
            <p>Liste de vos succès et badges débloqués.</p>
          </div>
        );
      case "settings":
        return (
          <div>
            <h2>⚙️ Paramètres</h2>
            <p>Modifiez vos informations et préférences.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-page ">
      <div className="profile-container">
        {/* Header Profile Card */}
        <div className="profile-card">
          <div className="profile-header d-flex flex-column flex-md-row align-items-md-center justify-content-md-center gap-4">
            <div className="d-flex flex-column align-items-center">
              <img 
                className="avatar mb-3" 
                src={userInfo.avatar} 
                alt={userInfo.username}
              />
              <div className="d-flex gap-2">
                <button
                  onClick={() => setVisible(true)}
                  className={`edit-btn ${isEditing ? "save" : ""}`}
                >
                  Modifier
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-light bg-danger rounded-3 py-2 px-4 border"
                >
                  Dash
                </button>
              </div>
            </div>

            <div className="user-info">
              <div className="user-info-header mb-3">
                <h1 className="mb-2">{userInfo.username}</h1>
              </div>
              <div className="user-details d-flex flex-column gap-2">
                <p className="d-flex align-items-center gap-2">
                  <FcAddressBook/> {userInfo.email}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <FcAddressBook/> {userInfo.number}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <FcPlanner/> Membre depuis {userInfo.joinDate}
                </p>
                <p className="d-flex align-items-center gap-2">
                  <FcGlobe/> {userInfo.country}
                </p>
              </div>
            </div>

            <div className="level-box d-flex flex-column align-items-center">
              <div className="level-icon mb-2" style={{width:'100px'}}>
                <img src={Price} className="w-100 h-100" alt="Level icon" />
              </div>
              <div className="level-title mb-1">Niv {userStats.level}</div>
              <div className="level-xp mb-2">
                {userStats.xp} / {userStats.nextLevelXP} XP
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card blue">📊 {userStats.totalQuizzes} <span>Quiz Terminés</span></div>
            <div className="stat-card green">✅ {userStats.correctAnswers} <span>Bonnes Réponses</span></div>
            <div className="stat-card orange">🔥 {userStats.streak} Quiz <span>Historique</span></div>
            
            <div className="stat-card pink">❤️ {userInfo.favoriteCategory} <span>Catégorie Préférée</span></div>{/* Stat en prenant compte du quiz le plus utilisé */}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: "📈" },
            { id: "quizzes", label: "Mes Quiz", icon: "📝" },
            { id: "achievements", label: "Succès", icon: "🏆" },
            { id: "settings", label: "Paramètres", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ Contenu dynamique selon activeTab */}
        <div className="tab-content">{renderTabContent()}</div>
      </div>
      {isVisible && (
        <div className="position-fixed w-100 h-100 top-0 bottom-0 start-0 end-0 z-1 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">
            <div style={{maxWidth:'700px'}} className="position-relative bg-dark rounded-3 p-4 w-100">
                <button 
                    className="position-absolute top-0 bg-danger end-0 m-2 btn btn-close"
                    onClick={() => setVisible(false)}
                />
                <h3 className="mb-4 text-light">Modifier mon profile</h3>
                <form>
                    <div className="d-flex gap-4">
                        <div className="mb-3 w-100">
                            <label className="form-label">Nom</label>
                            <input type="text" className="form-control" defaultValue={userInfo.username} />
                        </div>
                        <div className="mb-3 w-100">
                            <label className="form-label">Prénom(s)</label>
                            <input type="text" className="form-control" defaultValue={userInfo.username} />
                        </div>
                    </div>
                    <div className="d-flex gap-4">
                        <div className="mb-3 w-100">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-control" defaultValue={userInfo.email} />
                        </div>
                        <div className="mb-3 w-100">
                            <label className="form-label">Téléphone</label>
                            <input type="text" className="form-control" defaultValue={userInfo.number} />
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <Link className='hover-link' to='/reset'>Mot de passe oublié ?</Link>
                        
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => setVisible(false)}>Cancel</button>
                            <button type="submit" className="btn btn-success">Sauvegarder</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      )}
      <Link onClick={()=>setDelete(true)} className="text-delete mt-5" to={'#'}>Supprimer définitivement mon compte</Link>
      {isDelete && (
        <div className="position-fixed w-100 h-100 top-0 bottom-0 start-0 end-0 z-1 bg-black bg-opacity-50 d-flex align-items-center justify-content-center">

           <div style={{maxWidth: '600px'}} className="p-4 w-100 rounded shadow bg-dark">
      <h2 className="text-danger text-center text-light mb-3">⚠️ Avertissement</h2>

      <p className="text-center text-light">
        En cliquant sur <span className="fw-bold text-danger">continuer</span>, 
        vous disposerez d’un délai de <strong>30 jours</strong> pour vous rétracter. 
        Passé ce délai, votre compte sera 
        <span className="fw-bold text-danger"> définitivement supprimé</span>.
      </p>

      <div className="form-check my-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="confirmation"
          onChange={(e) => setChecked(e.target.checked)}
        />
        <label style={{fontSize:'12px'}} className="form-check-label text-light" htmlFor="confirmation">
          En cochant cette case, vous confirmez être pleinement conscient(e) de
          cet acte.
        </label>
      </div>

      <div className="d-flex gap-3 mt-4">
        <button
          type="button"
          className="btn btn-secondary flex-fill"
          onClick={() => setDelete(false)}
        >
          Annuler
        </button>
        <button
            onClick={() => {
              setActivePopup("deleteUser");
              setDelete(false);
            }}
            className="btn btn-danger flex-fill"
            disabled={!checked}
        >
          Continuer
        </button>
      </div>
    </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
