import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './system/components/Header/header.jsx';
import Footer from './system/components/Footer/footer.jsx';

import Home from './system/sections/Home/home.jsx';

import './App.css';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route index element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
