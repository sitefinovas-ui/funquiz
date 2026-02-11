import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PopupProvider } from './system/configurations/Context/PopupContext.jsx';
import AuthProvider from './system/configurations/Context/AuthProvider.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

import RequireAuth from './system/configurations/Auth/RequireAuth.jsx';
import RequireAuth_admin from './system/configurations/Auth/RequireAuth_admin.jsx';
import Loader from './system/components/Loader/loader.jsx';

import './App.css';

const Layout = lazy(() => import('./system/components/Layout/layout.jsx'));
const Raking = lazy(() => import('./system/sections/Ranking/ranking.jsx'));
const Notfound = lazy(() => import('./system/sections/Not-found/notFound.jsx'));
const Home = lazy(() => import('./system/sections/Home/home.jsx'));
const Login = lazy(() => import('./system/sections/Login/login.jsx'));
const SignUp = lazy(() => import('./system/sections/SignUp/Sign_up.jsx'));
const Reset = lazy(() => import('./system/sections/Reset/reset.jsx'));
const Game = lazy(() => import('./system/sections/Game/game.jsx'));
const Profil = lazy(() => import('./system/sections/Profil/profil.jsx'));
const Backoffice = lazy(() => import('./system/sections/Backoffice/back.jsx'));
const Contact = lazy(() => import('./system/sections/Contact/Contact.jsx'));
const Terms = lazy(() => import('./system/sections/Terms/terms.jsx'));
const About = lazy(() => import('./system/sections/About/about.jsx'));
const Search = lazy(() => import('./system/sections/Search/search.jsx'));

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <PopupProvider>
          <Suspense fallback={<Loader title="Chargement en cours" subtitle="On prépare votre expérience FunQuiz" />}>
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
                <Route path="/step" element={<Game />} />
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
          </Suspense>
        </PopupProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
