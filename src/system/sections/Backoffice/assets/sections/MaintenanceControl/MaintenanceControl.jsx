import { useState, useEffect } from 'react';
import maintenanceService from '../../../../../configurations/Services/maintenanceService.js';
import MaintenancePage from '../../../../../sections/Maintenance/MaintenancePage.jsx';

/* ── Styles injectés ─────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Share+Tech+Mono&display=swap');

  .mc-pop-anim {
    animation: mcPopOut 0.9s ease forwards;
    transform: translateX(-50%);
  }
  @keyframes mcPopOut {
    0%   { opacity: 0; transform: translateX(-50%) translateY(0)    scale(0.7); }
    15%  { opacity: 1; transform: translateX(-50%) translateY(-8px)  scale(1.1); }
    70%  { opacity: 1; transform: translateX(-50%) translateY(-12px) scale(1);   }
    100% { opacity: 0; transform: translateX(-50%) translateY(-22px) scale(0.9); }
  }
  .mc-switch:active { transform: scale(0.97) !important; }

  .mc-confirm-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: mcFadeIn 0.2s ease;
  }
  @keyframes mcFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .mc-confirm-box {
    background: #12121e;
    border: 1px solid rgba(255,60,95,0.4);
    border-radius: 20px;
    padding: 36px 40px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 0 60px rgba(255,60,95,0.15), 0 20px 60px rgba(0,0,0,0.8);
    font-family: 'Rajdhani', sans-serif;
    animation: mcZoomIn 0.25s cubic-bezier(0.34,1.4,0.64,1);
  }
  @keyframes mcZoomIn { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }
`;

/* ── Confirmation Dialog ─────────────────────────────────── */
function ConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="mc-confirm-overlay">
      <div className="mc-confirm-box">
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <h3 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, letterSpacing: 3, color: '#ff3c5f', margin: '0 0 12px', textTransform: 'uppercase' }}>
          ALERTE SYSTÈME
        </h3>
        <p style={{ color: '#d1d5db', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
          Tu t'apprêtes à <strong style={{ color: '#ff3c5f' }}>couper le site</strong> pour tous les utilisateurs.<br />
          Une page de maintenance s'affichera immédiatement.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid #2a2a4a', background: '#1e1e36', color: '#9ca3af', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}
          >
            ANNULER
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(255,60,95,0.5)', background: 'rgba(255,60,95,0.12)', color: '#ff3c5f', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}
          >
            CONFIRMER
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Switch 3D ───────────────────────────────────────────── */
function Switch3D({ isOn, onToggle, loading }) {
  const [pop, setPop] = useState(null);
  const color = isOn ? '#00ffe0' : '#ff3c5f';

  function showPop(txt) {
    setPop({ txt, id: Date.now() });
    setTimeout(() => setPop(null), 900);
  }

  function handleClick() {
    if (loading) return;
    showPop(isOn ? '▼ OFF' : '▲ ON');
    onToggle();
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="mc-switch"
        onClick={handleClick}
        style={{
          position: 'relative',
          width: 100,
          height: 180,
          borderRadius: 16,
          cursor: loading ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {/* Shell */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 16,
          background: 'linear-gradient(160deg,#1a1a2e 0%,#0f0f1a 50%,#1a1a2e 100%)',
          border: '1px solid #30305a',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.08),inset 0 -2px 4px rgba(0,0,0,0.8),4px 8px 24px rgba(0,0,0,0.9),-2px -2px 12px rgba(255,255,255,0.03)',
        }} />

        {/* Track */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 44, height: 130, borderRadius: 22,
          background: 'linear-gradient(180deg,#060610 0%,#0c0c20 50%,#060610 100%)',
          border: '1px solid #20203a',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.9),inset 0 -2px 6px rgba(0,0,0,0.6)',
        }}>
          {/* ON dot */}
          <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', top: 10, left: '50%', transform: 'translateX(-50%)', background: '#00ffe0', boxShadow: '0 0 8px rgba(0,255,224,0.6),0 0 16px rgba(0,255,224,0.6)', opacity: isOn ? 1 : 0.15, transition: 'opacity 0.4s' }} />
          {/* OFF dot */}
          <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: '#ff3c5f', boxShadow: '0 0 8px rgba(255,60,95,0.5),0 0 16px rgba(255,60,95,0.5)', opacity: isOn ? 0.15 : 1, transition: 'opacity 0.4s' }} />

          {/* Knob */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            width: 52, height: 52, borderRadius: 10,
            background: 'linear-gradient(145deg,#e8e8f0 0%,#b0b0c8 40%,#606080 100%)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '2px 4px 12px rgba(0,0,0,0.8),inset 0 2px 4px rgba(255,255,255,0.5),inset 0 -2px 4px rgba(0,0,0,0.4)',
            top: isOn ? 20 : 76,
            transition: 'top 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            cursor: 'pointer',
          }}>
            {[8, 16, null].map((top, i) => (
              <div key={i} style={{
                position: 'absolute',
                ...(top !== null ? { top } : { bottom: 10 }),
                left: 8, right: 8,
                height: i === 2 ? 2 : 3, borderRadius: i === 2 ? 1 : 2,
                background: `linear-gradient(90deg,rgba(0,0,0,${i === 2 ? 0.1 : 0.2}),rgba(255,255,255,${i === 2 ? 0.25 : i === 1 ? 0.3 : 0.4}),rgba(0,0,0,${i === 2 ? 0.1 : 0.2}))`,
              }} />
            ))}
          </div>
        </div>

        {/* Glow ON */}
        {isOn && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: 22,
            background: 'radial-gradient(ellipse at 50% 50%,rgba(0,255,224,0.25) 0%,transparent 70%)',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Pop badge */}
      {pop && (
        <div
          key={pop.id}
          className="mc-pop-anim"
          style={{
            position: 'absolute', left: '50%', top: 0, zIndex: 20,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
            padding: '4px 10px', borderRadius: 6, whiteSpace: 'nowrap',
            background: 'rgba(0,0,0,0.85)',
            color, border: `1px solid ${color}60`,
            pointerEvents: 'none',
          }}
        >
          {pop.txt}
        </div>
      )}
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────── */
export default function MaintenanceControl() {
  const [isOn,        setIsOn]       = useState(false); // true = ONLINE, false = maintenance
  const [loading,     setLoading]    = useState(true);
  const [saving,      setSaving]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastChange,  setLastChange]  = useState(null);
  const [statusMsg,   setStatusMsg]   = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const color = isOn ? '#00ffe0' : '#ff3c5f';

  /* Charge le statut au montage */
  useEffect(() => {
    maintenanceService.getStatus()
      .then(data => setIsOn(!data.maintenance))  // maintenance=true → switch OFF
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* L'utilisateur clique le switch */
  function handleToggleRequest() {
    if (saving || loading) return;
    if (isOn) {
      // Veut couper le site → confirmation d'abord
      setShowConfirm(true);
    } else {
      // Veut remettre en ligne → direct
      applyToggle(true);
    }
  }

  /* Confirmation validée */
  function handleConfirm() {
    setShowConfirm(false);
    applyToggle(false);
  }

  async function applyToggle(nextOnline) {
    setSaving(true);
    try {
      await maintenanceService.setStatus(!nextOnline); // maintenance = !online
      setIsOn(nextOnline);
      setLastChange(new Date().toLocaleString('fr-FR'));
      setStatusMsg({ type: 'success', text: nextOnline ? 'Site remis en ligne ✓' : 'Site en maintenance ✓' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setStatusMsg({ type: 'error', text: 'Erreur de connexion au serveur.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{css}</style>

      {/* Modal prévisualisation */}
      {showPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
          <MaintenancePage />
          <button
            onClick={() => setShowPreview(false)}
            style={{
              position: 'fixed', top: 16, right: 16, zIndex: 10001,
              padding: '8px 18px', borderRadius: 10,
              background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontFamily: "'Share Tech Mono', monospace",
              fontSize: 12, letterSpacing: 2, cursor: 'pointer',
            }}
          >
            ✕ FERMER
          </button>
        </div>
      )}

      {showConfirm && (
        <ConfirmDialog
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Header de section ── */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: '0 0 6px', fontFamily: 'sans-serif' }}>
              🔴 Contrôle de maintenance
            </h1>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0, fontFamily: 'sans-serif' }}>
              Coupez ou remettez le site en ligne instantanément depuis ce panneau.
            </p>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            style={{
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
              border: '1px solid #e5e7eb', background: '#f9fafb',
              color: '#374151', fontSize: 13, fontWeight: 600,
              fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            👁 Prévisualiser la page
          </button>
        </div>

        {/* ── Banner statut actuel ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 14, marginBottom: 32,
          background: isOn ? 'rgba(0,200,100,0.08)' : 'rgba(255,60,95,0.08)',
          border: `1px solid ${isOn ? 'rgba(0,200,100,0.25)' : 'rgba(255,60,95,0.25)'}`,
          fontFamily: 'sans-serif',
          opacity: loading ? 0.5 : 1,
          transition: 'all 0.4s',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isOn ? '#22c55e' : '#ef4444',
            boxShadow: `0 0 8px ${isOn ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}`,
            animation: 'mc-dot-pulse 2s ease infinite',
          }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: isOn ? '#16a34a' : '#dc2626' }}>
            {loading ? 'Chargement…' : isOn ? 'Site EN LIGNE' : 'Site EN MAINTENANCE'}
          </span>
          {lastChange && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
              Dernière modification : {lastChange}
            </span>
          )}
        </div>

        {/* ── Message succès/erreur ── */}
        {statusMsg && (
          <div style={{
            padding: '12px 18px', borderRadius: 12, marginBottom: 24, fontFamily: 'sans-serif',
            background: statusMsg.type === 'success' ? 'rgba(0,200,100,0.1)' : 'rgba(255,60,95,0.1)',
            border: `1px solid ${statusMsg.type === 'success' ? 'rgba(0,200,100,0.3)' : 'rgba(255,60,95,0.3)'}`,
            color: statusMsg.type === 'success' ? '#16a34a' : '#dc2626',
            fontSize: 14, fontWeight: 600,
          }}>
            {statusMsg.text}
          </div>
        )}

        {/* ── Layout principal ── */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Panneau Switch 3D */}
          <div style={{
            position: 'relative',
            background: '#12121e',
            border: '1px solid #2a2a4a',
            borderRadius: 24,
            padding: '40px 52px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6),inset 0 -1px 3px rgba(255,255,255,0.04),0 0 60px rgba(0,0,0,0.4)',
            minWidth: 220,
          }}>
            {/* Rivets */}
            {[{ top:14,left:14 }, { top:14,right:14 }, { bottom:14,left:14 }, { bottom:14,right:14 }].map((pos,i) => (
              <div key={i} style={{
                position: 'absolute', ...pos,
                width: 10, height: 10, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%,#c0c0d8,#404060)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8),0 0 0 1px #20203a',
              }} />
            ))}

            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11, letterSpacing: 3, color: '#404070', textTransform: 'uppercase',
            }}>
              PWR — SYS 01
            </div>

            <Switch3D isOn={isOn} onToggle={handleToggleRequest} loading={loading || saving} />

            {/* Status pill */}
            <div style={{
              padding: '6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.4s',
              fontFamily: "'Share Tech Mono', monospace",
              background: isOn ? '#001a14' : '#200010',
              color, border: `1px solid ${color}40`,
            }}>
              {saving ? '…' : isOn ? 'ONLINE' : 'OFFLINE'}
            </div>

            <div style={{ width: '100%', height: 1, background: '#2a2a4a' }} />

            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10, letterSpacing: 2, color: '#404070', textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              site status
            </div>

            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 18, color, transition: 'color 0.4s', letterSpacing: 2 }}>
              {isOn ? '⬤ UP' : '⬤ DOWN'}
            </div>
          </div>

          {/* Panneau d'infos */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'sans-serif' }}>

            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px 24px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#111827' }}>
                Comment ça fonctionne ?
              </h3>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#6b7280', fontSize: 14, lineHeight: 2 }}>
                <li>Activez la maintenance : tous les visiteurs voient une page "Site en maintenance"</li>
                <li>Les administrateurs gardent un accès complet au backoffice</li>
                <li>Désactivez pour remettre le site en ligne instantanément</li>
              </ul>
            </div>

            <div style={{
              background: isOn ? 'rgba(0,200,100,0.05)' : 'rgba(255,60,95,0.05)',
              border: `1px solid ${isOn ? 'rgba(0,200,100,0.2)' : 'rgba(255,60,95,0.2)'}`,
              borderRadius: 16, padding: '20px 24px',
            }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: isOn ? '#16a34a' : '#dc2626' }}>
                {isOn ? '✓ Site accessible' : '⚠ Site inaccessible'}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                {isOn
                  ? 'Le site est actuellement en ligne. Tous les utilisateurs peuvent y accéder normalement.'
                  : 'Le site est en mode maintenance. Les utilisateurs non-administrateurs voient une page de maintenance.'}
              </p>
            </div>

            <div style={{ background: 'rgba(255,152,0,0.06)', border: '1px solid rgba(255,152,0,0.2)', borderRadius: 16, padding: '20px 24px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#d97706' }}>
                ⚠ Attention
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                La mise en maintenance est <strong>immédiate et globale</strong>. Assurez-vous de prévenir votre équipe avant de couper le site.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
