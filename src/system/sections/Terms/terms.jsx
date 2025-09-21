import './terms.css';
import { useEffect } from 'react';

const Terms = () => {
  useEffect(() => {
    document.title = "FUNQUIZ | Toutes les reglémentations";
  }, []);
  return (
    <div className="terms-container vh-100">
      <h1 className="terms-title">Conditions d'utilisation</h1>
      <p className="terms-text">
        En utilisant notre service, vous acceptez les termes et conditions ci-dessous.
      </p>
    </div>
  );
}

export default Terms;