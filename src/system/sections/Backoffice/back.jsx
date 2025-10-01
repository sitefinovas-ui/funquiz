// Dashboard.jsx
import './back.css';
import { Routes, Route } from "react-router-dom";
import { PopupProvider } from "./../../configurations/Context/PopupContext.jsx";
import LayoutDash from './assets/components/LayoutDash/LayoutDash.jsx';
import HomeDash from './assets/sections/Dashboard/Dashboard.jsx';
import Users from './assets/sections/Users/user.jsx';

function Dashboard() {
  return (
    <PopupProvider>
      <Routes>
        <Route element={<LayoutDash />}>
          <Route index element={<HomeDash />} />
          <Route path="users" element={<Users/>} />
        </Route>
      </Routes>
    </PopupProvider>
  );
}

export default Dashboard;
