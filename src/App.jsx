import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./system/components/Layout/layout.jsx";

import Raking from "./system/sections/Ranking/ranking.jsx"
import Notfound from "./system/sections/Not-found/notFound.jsx";
import Home from "./system/sections/Home/home.jsx";
import Login from "./system/sections/Login/login.jsx";
import SignUp from "./system/sections/SignUp/Sign_up.jsx";
import Reset from "./system/sections/Reset/reset.jsx";
import Game from "./system/sections/Game/game.jsx";
import Contact from "./system/sections/Contact/Contact.jsx"
import Terms from "./system/sections/Terms/terms.jsx"
import Profil from "./system/sections/Profil/profil.jsx"

import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/step" element={<Game />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/raking" element={<Raking />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/profil" element={<Profil />}/>
        </Route>

        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
}

export default App;
