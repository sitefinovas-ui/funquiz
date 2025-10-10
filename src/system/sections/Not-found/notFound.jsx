import './notFound.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'FUNQUIZ | Not found';
  }, []);

  return (
    <div className="not-found-custom text-light vw-100 vh-100 d-flex flex-column justify-content-center align-items-center">
      <h1 className="fs-custom-notFound mb-4">404</h1>

      <div className="text-center card-custom-notFound p-4 rounded">
        <p className="fs-3 fw-normal mb-2">Page not found</p>
        <p className="mb-3" style={{ fontSize: '15px', fontWeight: '100' }}>
          Désolé, la page que vous recherchez n'existe pas.
        </p>

        <button onClick={() => navigate('/')} className="btn-custom-notFound mt-3 rounded-pill">
          Retourner à l'accueil
        </button>
      </div>
    </div>
  );
};

export default NotFound;
