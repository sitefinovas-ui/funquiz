import { useEffect, useState } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  .mnt-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f8faff;
    font-family: 'Inter', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 24px;
  }

  /* Cercles déco en arrière-plan */
  .mnt-blob-1 {
    position: absolute;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    top: -150px;
    right: -150px;
    pointer-events: none;
  }
  .mnt-blob-2 {
    position: absolute;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%);
    bottom: -100px;
    left: -100px;
    pointer-events: none;
  }
  .mnt-blob-3 {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
    top: 40%;
    left: 10%;
    pointer-events: none;
  }

  /* Grille de points */
  .mnt-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #c7d2fe 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.4;
    pointer-events: none;
  }

  /* Card principale */
  .mnt-card {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    max-width: 520px;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e8eaf6;
    border-radius: 28px;
    padding: 56px 48px 48px;
    box-shadow:
      0 1px 3px rgba(0,0,0,0.04),
      0 8px 32px rgba(99,102,241,0.08),
      0 32px 64px rgba(0,0,0,0.06);
  }

  /* Icône animée */
  .mnt-icon-wrap {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .mnt-icon-bg {
    position: absolute;
    inset: 0;
    border-radius: 22px;
    background: linear-gradient(135deg, #ede9fe 0%, #dbeafe 100%);
  }

  .mnt-icon-inner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34px;
    animation: mntFloat 3s ease-in-out infinite;
  }

  @keyframes mntFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-5px); }
  }

  /* Rings tournants autour de l'icône */
  .mnt-ring {
    position: absolute;
    border-radius: 50%;
    border: 1.5px solid transparent;
    pointer-events: none;
  }
  .mnt-ring-1 {
    inset: -12px;
    border-top-color: #818cf8;
    border-right-color: #c7d2fe;
    animation: mntSpin 3s linear infinite;
  }
  .mnt-ring-2 {
    inset: -22px;
    border-bottom-color: #a5b4fc;
    border-left-color: #e0e7ff;
    animation: mntSpin 5s linear infinite reverse;
  }

  @keyframes mntSpin {
    to { transform: rotate(360deg); }
  }

  /* Badge */
  .mnt-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 99px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    font-size: 12px;
    font-weight: 600;
    color: #16a34a;
    letter-spacing: 0.5px;
  }

  .mnt-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    animation: mntPulse 2s ease infinite;
  }

  @keyframes mntPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.8); }
  }

  /* Titre */
  .mnt-title {
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    font-weight: 800;
    color: #1e1b4b;
    text-align: center;
    line-height: 1.15;
    letter-spacing: -0.5px;
    margin: 0;
  }

  .mnt-title-accent {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Sous-titre */
  .mnt-sub {
    font-size: 15px;
    color: #6b7280;
    text-align: center;
    line-height: 1.7;
    margin: 0;
    max-width: 360px;
  }

  /* Divider */
  .mnt-divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e8eaf6, transparent);
  }

  /* Barre de progression */
  .mnt-progress-wrap {
    width: 100%;
  }
  .mnt-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .mnt-progress-label {
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .mnt-progress-pct {
    font-size: 12px;
    font-weight: 700;
    color: #6366f1;
  }
  .mnt-progress-track {
    width: 100%;
    height: 6px;
    background: #f1f5f9;
    border-radius: 99px;
    overflow: hidden;
  }
  .mnt-progress-fill {
    height: 100%;
    width: 70%;
    border-radius: 99px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
    background-size: 200% 100%;
    animation: mntShimmer 2s linear infinite;
  }

  @keyframes mntShimmer {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }

  /* Chips de statut */
  .mnt-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .mnt-chip {
    padding: 5px 14px;
    border-radius: 99px;
    background: #f5f3ff;
    border: 1px solid #ede9fe;
    font-size: 12px;
    font-weight: 500;
    color: #7c3aed;
  }

  /* Horloge */
  .mnt-time {
    font-size: 13px;
    font-weight: 500;
    color: #9ca3af;
    letter-spacing: 1px;
  }

  /* Footer */
  .mnt-footer {
    position: absolute;
    bottom: 20px;
    font-size: 12px;
    color: #d1d5db;
    font-weight: 400;
    z-index: 10;
  }

  @media (max-width: 480px) {
    .mnt-card { padding: 36px 24px 32px; gap: 24px; }
  }
`;

export default function MaintenancePage() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="mnt-root">
        <div className="mnt-dots" />
        <div className="mnt-blob-1" />
        <div className="mnt-blob-2" />
        <div className="mnt-blob-3" />

        <div className="mnt-card">

          {/* Icône avec rings */}
          <div className="mnt-icon-wrap">
            <div className="mnt-icon-bg" />
            <div className="mnt-icon-inner">🛠️</div>
            <div className="mnt-ring mnt-ring-1" />
            <div className="mnt-ring mnt-ring-2" />
          </div>

          {/* Badge statut */}
          <div className="mnt-badge">
            <div className="mnt-badge-dot" />
            Équipe au travail
          </div>

          {/* Titre */}
          <h1 className="mnt-title">
            On revient<br />
            <span className="mnt-title-accent">très bientôt</span>
          </h1>

          {/* Sous-titre */}
          <p className="mnt-sub">
            FunQuiz est en cours de mise à jour pour vous offrir une meilleure expérience.
            Merci pour votre patience !
          </p>

          <div className="mnt-divider" />

          {/* Progression */}
          <div className="mnt-progress-wrap">
            <div className="mnt-progress-header">
              <span className="mnt-progress-label">Avancement</span>
              <span className="mnt-progress-pct">En cours…</span>
            </div>
            <div className="mnt-progress-track">
              <div className="mnt-progress-fill" />
            </div>
          </div>

          {/* Chips */}
          <div className="mnt-chips">
            <span className="mnt-chip">🔧 Mise à jour</span>
            <span className="mnt-chip">⚡ Optimisation</span>
            <span className="mnt-chip">🔒 Sécurité</span>
          </div>

          {/* Heure */}
          {time && <p className="mnt-time">{time}</p>}
        </div>

        <p className="mnt-footer">© FunQuiz — Maintenance en cours</p>
      </div>
    </>
  );
}
