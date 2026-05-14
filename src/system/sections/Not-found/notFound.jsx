import './notFound.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'FUNQUIZ | Not found'; }, []);

  return (
    <div className="not-found-custom text-white w-full min-h-screen flex flex-col justify-center items-center">
      <h1 className="fs-custom-notFound mb-4">404</h1>
      <div className="text-center card-custom-notFound p-4 rounded-xl">
        <p className="text-2xl font-normal mb-2">Page not found</p>
        <p className="mb-4 text-sm font-light">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <button onClick={() => navigate('/')} className="btn-custom-notFound mt-3 rounded-full">
          Retourner à l'accueil
        </button>
      </div>
    </div>
  );
};

export default NotFound;
