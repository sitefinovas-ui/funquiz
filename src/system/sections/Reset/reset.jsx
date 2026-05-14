import './reset.css';
import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaRedo } from 'react-icons/fa';
import authService from '../../configurations/Services/authServices';
import { useLocation, useNavigate } from 'react-router-dom';

const evalStrength = (pwd) => {
  if (!pwd) return { percent: 0, label: 'Faible', color: '#ff3b30' };
  let score = Math.min(pwd.length, 12) * 4;
  if (/[a-z]/.test(pwd)) score += 10;
  if (/[A-Z]/.test(pwd)) score += 10;
  if (/[0-9]/.test(pwd)) score += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
  if (pwd.length >= 12) score += 10;
  const percent = Math.min(100, Math.max(0, score));
  if (percent < 40) return { percent, label: 'Faible',  color: '#ff3b30' };
  if (percent < 70) return { percent, label: 'Moyenne', color: '#ff9f0a' };
  return             { percent, label: 'Forte',   color: '#34c759' };
};

const STEPS = [
  { eyebrow: 'Étape 1 sur 3', title: 'Saisissez votre email',    sub: 'Nous vous enverrons un code de vérification.',          icon: '✉️', iconClass: 'blue'  },
  { eyebrow: 'Étape 2 sur 3', title: 'Entrez le code reçu',      sub: 'Consultez votre boîte mail et saisissez le code.',       icon: '🔢', iconClass: ''      },
  { eyebrow: 'Étape 3 sur 3', title: 'Nouveau mot de passe',     sub: 'Choisissez un mot de passe sécurisé pour votre compte.', icon: '🔒', iconClass: ''      },
  { eyebrow: 'Terminé',       title: 'Mot de passe réinitialisé', sub: 'Vous allez être redirigé vers la connexion.',            icon: '✅', iconClass: 'green' },
];

export default function ResetPassword() {
  useEffect(() => { document.title = 'FUNQUIZ | Réinitialiser mon mot de passe'; }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const [email,           setEmail]           = useState('');
  const [emailLocked,     setEmailLocked]     = useState(false);
  const [code,            setCode]            = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step,            setStep]            = useState(1);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [cooldown,        setCooldown]        = useState(0);
  const [showPwd,         setShowPwd]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [strength,        setStrength]        = useState({ percent: 0, label: 'Faible', color: '#ff3b30' });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const prefill = params.get('email');
    if (!prefill) return;
    const v = String(prefill).trim();
    if (!v) return;
    setEmail(v);
    setEmailLocked(true);
  }, [location.search]);

  const clear = () => { setError(''); setSuccess(''); };

  const handleRequestCode = async () => {
    clear();
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) { setError('Veuillez saisir votre adresse email.'); return; }
    setLoading(true);
    try {
      const resp = await authService.requestResetPassword(normalized);
      setSuccess(resp?.message || 'Code envoyé — vérifiez votre boîte mail.');
      setStep(2);
      setCooldown(30);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Erreur lors de l\'envoi.');
    } finally { setLoading(false); }
  };

  const handleResendCode = async () => {
    if (cooldown > 0) return;
    await handleRequestCode();
  };

  const handleValidateCode = () => {
    const normalized = String(code || '').trim();
    if (!normalized) { setError('Veuillez saisir le code reçu.'); return; }
    clear();
    setSuccess('Code validé.');
    setStep(3);
  };

  const handleResetPassword = async () => {
    clear();
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      const resp = await authService.resetPassword({ code: String(code || '').trim(), newPassword });
      setSuccess(resp?.message || 'Mot de passe réinitialisé avec succès.');
      setStep(4);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Erreur lors du changement.');
    } finally { setLoading(false); }
  };

  const s = STEPS[step - 1];

  return (
    <div className="rs-page">
      <div className="rs-card">

        {/* ── DOTS ── */}
        <div className="rs-dots">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className={`rs-dot ${step > n ? 'done' : step === n ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* ── HEAD ── */}
        <div className="rs-head">
          <div className={`rs-icon ${s.iconClass}`}>{s.icon}</div>
          <p className="rs-eyebrow">{s.eyebrow}</p>
          <h1 className="rs-title">{s.title}</h1>
          <p className="rs-sub">{s.sub}</p>
        </div>

        {/* ── STEPS ── */}
        {step === 4 ? (

          /* SUCCESS */
          <div className="rs-success-wrap">
            <p style={{ fontSize: 15, color: '#34c759', fontWeight: 600, margin: 0 }}>
              Redirection en cours…
            </p>
          </div>

        ) : (
          <>
            <div className="rs-form">

              {/* Step 1 — Email */}
              {step === 1 && (
                <div className="rs-field">
                  <label htmlFor="email" className="rs-label">Adresse email</label>
                  <input
                    id="email" type="email" className="rs-input"
                    placeholder="exemple@mail.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading || emailLocked}
                  />
                </div>
              )}

              {/* Step 2 — Code */}
              {step === 2 && (
                <div className="rs-field">
                  <label htmlFor="code" className="rs-label">Code de vérification</label>
                  <input
                    id="code" type="text" inputMode="numeric"
                    className="rs-input rs-otp"
                    placeholder="· · · · · ·"
                    value={code} onChange={e => setCode(e.target.value)}
                    autoComplete="one-time-code"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Step 3 — Passwords */}
              {step === 3 && (
                <>
                  <div className="rs-field">
                    <label htmlFor="newPwd" className="rs-label">Nouveau mot de passe</label>
                    <div className="rs-pw-wrap">
                      <input
                        id="newPwd"
                        type={showPwd ? 'text' : 'password'}
                        className="rs-input"
                        placeholder="Minimum 6 caractères"
                        value={newPassword}
                        onChange={e => { setNewPassword(e.target.value); setStrength(evalStrength(e.target.value)); }}
                        autoComplete="new-password" minLength={6}
                        disabled={loading}
                      />
                      <button type="button" className="rs-pw-toggle" onClick={() => setShowPwd(v => !v)}>
                        {showPwd ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {newPassword.length > 0 && (
                      <div className="rs-strength">
                        <div className="rs-strength-row">
                          <span className="rs-strength-lbl">Sécurité du mot de passe</span>
                          <span className="rs-strength-val" style={{ color: strength.color }}>{strength.label}</span>
                        </div>
                        <div className="rs-strength-track">
                          <div className="rs-strength-fill" style={{ width: `${strength.percent}%`, background: strength.color }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rs-field">
                    <label htmlFor="confirmPwd" className="rs-label">Confirmer le mot de passe</label>
                    <div className="rs-pw-wrap">
                      <input
                        id="confirmPwd"
                        type={showConfirm ? 'text' : 'password'}
                        className={`rs-input ${confirmPassword && confirmPassword !== newPassword ? 'invalid' : ''}`}
                        placeholder="Répétez le mot de passe"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={loading}
                      />
                      <button type="button" className="rs-pw-toggle" onClick={() => setShowConfirm(v => !v)}>
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="rs-hint">Les mots de passe ne correspondent pas.</p>
                    )}
                  </div>
                </>
              )}

              {/* Messages */}
              {error   && <p className="rs-msg error">{error}</p>}
              {success && step !== 4 && <p className="rs-msg success">{success}</p>}
            </div>

            {/* Actions */}
            <div className="rs-actions">
              {step === 1 && (
                <button
                  className="rs-btn-primary"
                  onClick={handleRequestCode}
                  disabled={loading || !email}
                >
                  {loading ? <><span className="rs-spinner" /> Envoi…</> : 'Envoyer le code'}
                </button>
              )}

              {step === 2 && (
                <>
                  <button
                    className="rs-btn-primary"
                    onClick={handleValidateCode}
                    disabled={loading || !code}
                  >
                    Valider le code
                  </button>
                  <button
                    className="rs-btn-secondary"
                    onClick={handleResendCode}
                    disabled={loading || cooldown > 0}
                  >
                    <FaRedo size={12} />
                    {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Renvoyer le code'}
                  </button>
                </>
              )}

              {step === 3 && (
                <button
                  className="rs-btn-primary green"
                  onClick={handleResetPassword}
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  {loading ? <><span className="rs-spinner" /> Modification…</> : 'Changer le mot de passe'}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="rs-footer">
              <button className="rs-back" onClick={() => navigate('/login')}>
                ← Retour à la connexion
              </button>
              <span>Besoin d'aide ? Visitez la page Contact.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
