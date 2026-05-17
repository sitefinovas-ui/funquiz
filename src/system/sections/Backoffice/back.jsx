// back.jsx
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
import CountryManagement from './assets/sections/Countries/CountryManagement.jsx';
import AboutManagement from './assets/sections/About/AboutManagement.jsx';
import Settings from './assets/sections/Settings/Settings.jsx';
import ModeratorActions from './assets/sections/Moderation/ModeratorActions.jsx';
import RolePermissions from './assets/sections/Moderation/RolePermissions.jsx';
import ThemeSwitcherAdminPage from './../../components/ThemeSwitcher/theme-switcher.jsx';
import OffresManagement from './assets/sections/Offres/OffresManagement.jsx';
import GameConfigManagement from './assets/sections/GameConfig/GameConfigManagement.jsx';
import StorageManagement from './assets/sections/Storage/StorageManagement.jsx';
import MaintenanceControl from './assets/sections/MaintenanceControl/MaintenanceControl.jsx';

function BackofficeMain() {
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
          <Route path="countries" element={<CountryManagement />} />
          <Route path="about" element={<AboutManagement />} />
          <Route path="legal" element={<LegalDash />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="settings" element={<ThemeSwitcherAdminPage />} />
          <Route path="global-settings" element={<Settings />} />
          <Route path="moderation" element={<ModeratorActions />} />
          <Route path="permissions" element={<RolePermissions />} />
          <Route path="publicites" element={<OffresManagement />} />
          <Route path="game-config" element={<GameConfigManagement />} />
          <Route path="storage" element={<StorageManagement />} />
          <Route path="maintenance" element={<MaintenanceControl />} />
        </Route>
      </Routes>
    </PopupProvider>
  );
}

export default BackofficeMain;
