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

function Dashboard() {
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
