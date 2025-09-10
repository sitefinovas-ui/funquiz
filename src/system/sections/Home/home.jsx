import './home.css';

const Home = () => {
  return (
    <section className="home">
      <div className="container">
        <div className="content">
          <h2>Bienvenue sur FUNQUIZ</h2>
          <p>Testez vos connaissances avec nos quiz interactifs et amusants !</p>
          <p>Découvrez des questions passionnantes dans différents domaines.</p>
          <a href="#quiz" className="cta-button">
            🎯 Commencer le Quiz
          </a>
        </div>
      </div>
    </section>
  );
};
export default Home;
