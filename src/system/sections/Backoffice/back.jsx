// back.jsx
import './back.css';
import { Routes, Route } from 'react-router-dom';
import { PopupProvider } from './../../configurations/Context/PopupContext.jsx';
import LayoutDash from './assets/components/LayoutDash/LayoutDash.jsx';
import HomeDash from './assets/sections/Dashboard/Dashboard.jsx';
import Users from './assets/sections/Users/user.jsx';
import Message from './assets/sections/Messages/messages.jsx';
import Comment from './assets/sections/Comment/comment.jsx';
import NewsDash from './assets/sections/Newsletter/newsletter.jsx';
import QuizDash from './assets/sections/Quiz/quiz.jsx';
import LegalDash from './assets/sections/Legal/legal.jsx';
import LogsPage from './assets/sections/Temp/temp.jsx';
import ThemeSwitcherAdminPage from './../../components/ThemeSwitcher/theme-switcher.jsx';
import { useEffect, useState } from 'react'; // ajout pour détecter le device

function Dashboard() {
  // Détection desktop: exclut mobile/tablette et petites fenêtres
  const [isDesktop, setIsDesktop] = useState(true);
{/*
  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent || '';
      const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
      const isSmallScreen = window.innerWidth < 992; // seuil Bootstrap lg
      setIsDesktop(!isMobileUA && !isSmallScreen);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!isDesktop) {
    return (
      <div className="vh-100 vw-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
        <h2 className="fw-bold">Backoffice indisponible sur mobile</h2>
        <p className="text-muted mb-3">
          Cette section est accessible uniquement depuis un ordinateur ou une fenêtre assez large.
        </p>
        <a href="/" className="btn btn-primary rounded-pill px-4">Retour à l’accueil</a>
      </div>
    );
  }
*/}
  return (
    // Backoffice
    <PopupProvider>
      <Routes>
        <Route element={<LayoutDash />}>
          <Route index element={<HomeDash />} />
          <Route path="users" element={<Users />} />
          <Route path="message" element={<Message />} />
          <Route path="comment" element={<Comment />} />
          <Route path="newsletter" element={<NewsDash />} />
          <Route path="quiz" element={<QuizDash />} />
          <Route path="legal" element={<LegalDash />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<ThemeSwitcherAdminPage />} />
        </Route>
      </Routes>
    </PopupProvider>
  );
}

export default Dashboard;
