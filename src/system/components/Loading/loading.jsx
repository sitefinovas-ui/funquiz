import { useState, useEffect } from 'react';
import './loading.css';
import Logo from '../../../assets/Log.png'; // mets ton image ici

export default function LoadingPopup() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Le pop-up disparaît après 3 secondes
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);
  if (!visible) return null;

  return (
    <div className="loading ">
      <div className="loading-box">
        <div className="loading-circle-cus">
          <img src={Logo} alt="loading" className="loading-icon rounded-circle" />
        </div>
        <h1 className="epic-3d-title" data-text="Vous êtes prêt !">
          Vous êtes prêt !
        </h1>
        <p className="loading-text">Chargement...</p>
      </div>
    </div>
  );
}
