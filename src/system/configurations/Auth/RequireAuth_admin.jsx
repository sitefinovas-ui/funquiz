import { useLocation } from "react-router-dom";
import NotAuthorized from "../../sections/NotAuthorized/NotAuthorized.jsx";
import { useEffect, useState } from "react";


export default function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

useEffect(() => {
  if (!token) {
    // Rediriger vers la page de connexion après 3 secondes
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [token]);

if (!token) {
  return <NotAuthorized />;
}
  return children;
}
