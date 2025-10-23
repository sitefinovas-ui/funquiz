import { Routes, Route } from 'react-router-dom';
import { PopupProvider } from './system/configurations/Context/PopupContext.jsx';
import AuthProvider from './system/configurations/Context/AuthProvider.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Layout from './system/components/Layout/layout.jsx';

import Raking from './system/sections/Ranking/ranking.jsx';
import Notfound from './system/sections/Not-found/notFound.jsx';
import Home from './system/sections/Home/home.jsx';
import Login from './system/sections/Login/login.jsx';
import SignUp from './system/sections/SignUp/Sign_up.jsx';
import Reset from './system/sections/Reset/reset.jsx';
import Game from './system/sections/Game/game.jsx';
import Profil from './system/sections/Profil/profil.jsx';
import Backoffice from './system/sections/Backoffice/back.jsx';
import Contact from './system/sections/Contact/Contact.jsx';
import Terms from './system/sections/Terms/terms.jsx';
import RequireAuth from './system/configurations/Auth/RequireAuth.jsx';
import RequireAuth_admin from './system/configurations/Auth/RequireAuth_admin.jsx';
import About from './system/sections/About/about.jsx'
import Search from './system/sections/Search/search.jsx';

import './App.css';


function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <PopupProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/reset" element={<Reset />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/raking" element={<Raking />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/search" element={<Search />} />
              <Route
                path="/profil"
                element={
                  <RequireAuth>
                    <Profil />
                  </RequireAuth>
                }
              />
              <Route
                path="/step"
                element={
                    <Game />
                }
              />
              <Route
                path="/dashboard/*"
                element={
                  <RequireAuth_admin allowedRoles={['admin', 'moderator']}>
                    <Backoffice />
                  </RequireAuth_admin>
                }
              />
            </Route>
            <Route path="*" element={<Notfound />} />
          </Routes>
        </PopupProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
