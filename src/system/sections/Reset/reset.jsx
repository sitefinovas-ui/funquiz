import './reset.css';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaRedo } from 'react-icons/fa';
import authService from '../../configurations/Services/authServices';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  useEffect(() => {
    document.title = 'FUNQUIZ | Réinitialiser mon mot de passe';
  }, []);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdStrength, setPwdStrength] = useState({ percent: 0, label: 'Faible' });

  // Strength meter
  const evalStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { percent: 0, label: 'Faible' };
    const len = pwd.length;
    score += Math.min(len, 12) * 4;
    if (/[a-z]/.test(pwd)) score += 10;
    if (/[A-Z]/.test(pwd)) score += 10;
    if (/[0-9]/.test(pwd)) score += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
    if (len >= 12) score += 10;
    const percent = Math.max(0, Math.min(100, score));
    const label = percent < 40 ? 'Faible' : percent < 70 ? 'Moyenne' : 'Forte';
    return { percent, label };
  };

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleRequestCode = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authService.requestResetPassword(email);
      setSuccess('Code envoyé par mail.');
      setStep(2);
      setCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la demande.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    await handleRequestCode();
  };

  const handleValidateCode = () => {
    if (!code || code.trim().length === 0) {
      setError('Veuillez saisir le code reçu.');
      return;
    }
    setError('');
    setSuccess('Code validé avec succès ✅');
    setStep(3);
  };

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
      setStep(4);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement.');
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min(100, Math.max(0, ((step - 1) / 3) * 100));

  return (
    <div className="reset-full">
      

      <section className="reset-stage">
        <div className="reset-band" aria-hidden="true" />
        <div className="reset-panel">
          <div className="reset-card">
            <div className="reset-header text-center">
              <h1 className="title">Réinitialiser votre mot de passe</h1>
              <p className="subtitle">
                Suivez les étapes pour récupérer l’accès à votre compte.
              </p>
              <div className="progress-container mt-3">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-steps">
                  <span className={step >= 1 ? 'active' : ''}>1</span>
                  <span className={step >= 2 ? 'active' : ''}>2</span>
                  <span className={step >= 3 ? 'active' : ''}>3</span>
                </div>
              </div>
            </div>

            <div className="reset-body">
              <div className="back-link text-start mb-3">
                <button className="link-back" onClick={() => navigate('/login')}>← Retour</button>
              </div>
              {/* Step 1 */}
              <div className={`step ${step === 1 ? 'visible' : 'disabled'}`}>
                <label htmlFor="email" className="form-label">Adresse email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control pill"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading || step > 1}
                />
                <button
                  className="btn-gradient w-100 mt-3"
                  onClick={handleRequestCode}
                  disabled={loading || !email || step > 1}
                >
                  Recevoir le code
                </button>
              </div>

              {/* Step 2 */}
              <div className={`step ${step === 2 ? 'visible' : 'disabled'}`}>
                <label htmlFor="code" className="form-label">Code reçu par mail</label>
                <input
                  id="code"
                  type="text"
                  className="form-control pill"
                  placeholder="Entrez le code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading || step !== 2}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-light flex-grow-1 pill"
                    onClick={handleValidateCode}
                    disabled={loading || !code || step !== 2}
                  >
                    Valider le code
                  </button>
                  <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2 pill"
                    onClick={handleResendCode}
                    disabled={loading || cooldown > 0}
                    aria-live="polite"
                  >
                    <FaRedo /> {cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer'}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`step ${step === 3 ? 'visible' : 'disabled'}`}>
                <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                <div className="position-relative">
                  <input
                    id="newPassword"
                    type={showPwd ? 'text' : 'password'}
                    className="form-control pe-5 pill"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPassword(val);
                      setPwdStrength(evalStrength(val));
                    }}
                    disabled={loading || step !== 3}
                    autoComplete="new-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPwd((s) => !s)}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <small className="text-muted-custom">Sécurité: {pwdStrength.label}</small>
                  <small className="text-muted-custom">{pwdStrength.percent}%</small>
                </div>
                <div className="progress w-50" style={{ height: '6px' }}>
                  <div
                    className={`progress-bar ${
                      pwdStrength.percent < 30 ? 'bg-danger' : pwdStrength.percent < 70 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${pwdStrength.percent}%` }}
                  />
                </div>

                <label htmlFor="confirmPassword" className="form-label mt-3">Confirmer le mot de passe</label>
                <div className="position-relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPwd ? 'text' : 'password'}
                    className={`form-control pe-5 pill ${confirmPassword && confirmPassword !== newPassword ? 'is-invalid' : ''}`}
                    placeholder="Confirmez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || step !== 3}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPwd((s) => !s)}
                  >
                    {showConfirmPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <div className="invalid-feedback">Les mots de passe ne correspondent pas</div>
                </div>

                <button
                  className="btn btn-success w-100 mt-3 pill"
                  onClick={handleResetPassword}
                  disabled={loading || !newPassword || !confirmPassword || step !== 3}
                >
                  Changer le mot de passe
                </button>
              </div>
              <div className="reset-footer text-center">
                {error && <div className="alert alert-danger mb-2">{error}</div>}
                {success && <div className="alert alert-success mb-2">{success}</div>}
                <small className="text-muted-custom">Besoin d’aide ? Contacte le support via la page Contact.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="reset-dots" aria-hidden="true">
        <span />
        <span className="active" />
        <span />
      </div>
    </div>
  );
}
