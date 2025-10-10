import './reset.css';
import { useEffect, useState } from 'react';
import authService from '../../configurations/Services/authServices';

export default function ResetPassword() {
  useEffect(() => {
    document.title = 'FUNQUIZ | Réinitialiser mon mot de passe';
  }, []);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Demander le code de réinitialisation
  const handleRequestCode = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.requestResetPassword(email);
      setSuccess('Code envoyé par mail.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la demande.');
    } finally {
      setLoading(false);
    }
  };

  // Vérifier le code avant de passer à l'étape suivante
  const handleValidateCode = () => {
    if (!code) {
      setError('Veuillez saisir le code reçu.');
      return;
    }
    setError('');
    setSuccess('Code validé avec succès ✅');
    setStep(3);
  };

  // Réinitialiser le mot de passe
  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }
    try {
      await authService.resetPassword({ email, code, newPassword });
      setSuccess('Mot de passe réinitialisé 🎉');
      setStep(4); // étape finale
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour appliquer un effet "grisé"
  const getCardClass = (cardStep) => {
    return `card-3d border-0 h-100 d-flex flex-column align-items-center justify-content-center p-4 
      ${step < cardStep ? 'bg-secondary bg-opacity-25 text-muted' : 'text-white'}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      <div className="">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10">
            {/* Header Section */}
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-light mb-3">
                Réinitialiser votre mot de passe
              </h1>
              <p className="lead text-light fs-5">
                Entrez votre adresse email ci-dessous et validez chaque étape
                <br />
                pour retrouver l'accès à votre compte.
              </p>
            </div>

            <div className="row g-3 mb-5">
              {/* Step 1 - Email */}
              <div className="col-12 col-md-4 height-custom">
                <div className={getCardClass(1)}>
                  <div className="fw-bold mb-2">Step 1</div>
                  <div className="mb-3 text-center">Saisir votre email</div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={step > 1}
                  />
                  <button
                    className="btn btn-light mt-3"
                    onClick={handleRequestCode}
                    disabled={loading || !email || step > 1}
                  >
                    Recevoir le code
                  </button>
                </div>
              </div>

              {/* Step 2 - Code reçu */}
              <div className="col-12 col-md-4 height-custom">
                <div className={getCardClass(2)}>
                  <div className="fw-bold mb-2">Step 2</div>
                  <div className="mb-3 text-center">Code reçu par mail</div>
                  <input
                    type="text"
                    placeholder="Code reçu"
                    className="form-control"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={step !== 2}
                  />
                  <button
                    className="btn btn-light mt-3"
                    onClick={handleValidateCode}
                    disabled={loading || !code || step !== 2}
                  >
                    Valider le code
                  </button>
                </div>
              </div>

              {/* Step 3 - Nouveau mot de passe */}
              <div className="col-12 col-md-4 height-custom">
                <div className={getCardClass(3)}>
                  <div className="fw-bold mb-2">Step 3</div>
                  <div className="mb-3 text-center">Changer le mot de passe</div>
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    className="form-control mb-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={step !== 3}
                  />
                  <input
                    type="password"
                    placeholder="Confirmer mot de passe"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={step !== 3}
                  />
                  <button
                    className="btn btn-success mt-3"
                    onClick={handleResetPassword}
                    disabled={loading || !newPassword || !confirmPassword || step !== 3}
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            </div>

            {/* Messages d'état */}
            <div className="text-center mt-4">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
