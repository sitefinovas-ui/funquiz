import { useLocation, useNavigate } from 'react-router-dom';
import NotAuthorized from '../../sections/NotAuthorized/NotAuthorized.jsx';
import { useEffect } from 'react';

export default function RequireAuth({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  let role = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload?.role;
    } catch (error) {
      console.error('Erreur de décodage du token :', error);
    }
  }

  useEffect(() => {
    if (!token || (allowedRoles.length && !allowedRoles.includes(role))) {
      // Redirige vers login après 500ms
      const timer = setTimeout(() => {
        navigate('/login', { replace: true, state: { from: location } });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [token, role, allowedRoles, navigate, location]);

  if (!token || (allowedRoles.length && !allowedRoles.includes(role))) {
    return <NotAuthorized />;
  }

  return children;
}
