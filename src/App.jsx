import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './system/components/Header/header.jsx';
import Footer from './system/components/Footer/footer.jsx';
import Info from './system/components/Infos/Info.jsx';
import Cookie from './system/components/Cookie/cookie.jsx';

import Home from './system/sections/Home/home.jsx';

import './App.css';

function App() {
  return (
    <div >
      <Header />
      <Info  />
      <Routes>
        <Route index element={<Home />} />
      </Routes>
      <Cookie />
      <Footer />
    </div>
  );
}

export default App;
