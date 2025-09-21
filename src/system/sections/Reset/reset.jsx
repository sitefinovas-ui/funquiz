import './reset.css';
import { useEffect } from 'react';

export default function SeventyFiveHardLanding() {
  useEffect(() => {
    document.title = "FUNQUIZ | Réinitialiser mon mot de passe";
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 py-5">
      {/* Bootstrap CDN est déjà inclus dans l'environnement */}
      <div className="">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Header Section */}
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-light mb-3" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
                Réinitialiser votre mot de passe
              </h1>
              <p className="lead text-light fs-5" style={{ fontWeight: '300', marginTop: '2rem' }}>
                Entrez votre adresse email ci-dessous et nous vous enverrons<br />
                un lien pour créer un nouveau mot de passe et retrouver l'accès à votre compte.
              </p>
            </div>


           <div className="row g-3 mb-5">
  {/** Step 1 - Email **/}
  <div className="col-4 height-custom">
    <div 
      className="card-3d border-0 text-white h-100 d-flex flex-column align-items-center justify-content-center p-4"
    >
      <div className="mb-3">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <div className="fw-bold mb-2">Step 1</div>
      <div className="mb-3 text-center">Saisir votre email</div>
      <input type="email" placeholder="Email" className="form-control" />
    </div>
  </div>

  {/** Step 2 - Code reçu par mail **/}
  <div className="col-4 height-custom">
    <div className="card-3d border-0 text-white h-100 d-flex flex-column align-items-center justify-content-center p-4">
      <div className="mb-3">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 8V6l-8-5-8 5v2l8 5 8-5zm0 2.09l-8 5-8-5V18h16V10.09z"/>
        </svg>
      </div>
      <div className="fw-bold mb-2">Step 2</div>
      <div className="mb-3 text-center">Mot de passe reçu par mail</div>
      <input type="text" placeholder="Code reçu" className="form-control" />
    </div>
  </div>

  {/** Step 3 - Changement mot de passe **/}
  <div className="col-4 height-custom">
    <div className="card-3d border-0 text-white h-100 d-flex flex-column align-items-center justify-content-center p-4">
      <div className="mb-3">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17a2 2 0 0 0 2-2v-4a2 2 0 0 0-4 0v4a2 2 0 0 0 2 2zm0 2c-2.21 0-4-1.79-4-4v-4a4 4 0 0 1 8 0v4c0 2.21-1.79 4-4 4z"/>
        </svg>
      </div>
      <div className="fw-bold mb-2">Step 3</div>
      <div className="mb-3 text-center">Changer votre mot de passe</div>
      <input type="password" placeholder="Nouveau mot de passe" className="form-control mb-2" />
      <input type="password" placeholder="Confirmer mot de passe" className="form-control" />
    </div>
  </div>
</div>

            {/* Stats Section */}
            <div className="text-center">
              <div className="d-flex w-100 align-items-center justify-content-center gap-4 text-muted">
                
                <div className="d-flex w-100 align-items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#28a745" className="me-2">
                    <path d="M12 2C8.13 2 5 5.13 5 9v4H3v7h18v-7h-2V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v4H7v-4c0-2.76 2.24-5 5-5zm-1 9h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                  </svg>
                  <span className="text-light" style={{ fontSize: '0.95rem' }}>Changement sécurisé</span>
                </div>

                <div style={{ color: '#dee2e6' }}>•</div>

                <div className="d-flex w-100 align-items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffc107" className="me-2">
                    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z"/>
                  </svg>
                  <span className='text-light' style={{ fontSize: '0.95rem' }}>Confiance des utilisateurs</span>
                </div>

                <div style={{ color: '#dee2e6' }}>•</div>

                <div className="d-flex w-100 align-items-center">
                  <div className="me-2" style={{
                    width: '20px',
                    height: '20px',
                    background: 'linear-gradient(45deg, #ffc107, #28a745)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span className='text-light' style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>✓</span>
                  </div>
                  <span className='text-light' style={{ fontSize: '0.95rem' }}>Protection avancée</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}