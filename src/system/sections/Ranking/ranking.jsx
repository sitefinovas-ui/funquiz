import { useEffect, useState, useMemo } from 'react';
import './ranking.css';
import pointService from '../../configurations/Services/pointService';

const PODIUM_ORDER = [1, 0, 2];

const DIVISIONS = [
  { name: 'Légende',  icon: '👑', color: '#b06000', bg: '#fef7e0', bar: '#fbbc04', minPts: 10000 },
  { name: 'Diamant',  icon: '💎', color: '#1a73e8', bg: '#e8f0fe', bar: '#4285f4', minPts: 5000  },
  { name: 'Or',       icon: '🥇', color: '#b06000', bg: '#fff8e1', bar: '#ffa000', minPts: 2000  },
  { name: 'Argent',   icon: '🥈', color: '#5f6368', bg: '#f1f3f4', bar: '#9aa0a6', minPts: 500   },
  { name: 'Bronze',   icon: '🥉', color: '#c5221f', bg: '#fce8e6', bar: '#ea4335', minPts: 1     },
  { name: 'Débutant', icon: '🎮', color: '#137333', bg: '#e6f4ea', bar: '#01875f', minPts: 0     },
];

function getDivision(pts) {
  return DIVISIONS.find(d => pts >= d.minPts) || DIVISIONS[DIVISIONS.length - 1];
}

const Ranking = () => {
  const [rankingData, setRankingData] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [tab,         setTab]         = useState('top');

  useEffect(() => { document.title = 'FUNQUIZ | Classement'; }, []);

  const currentUserId = useMemo(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try { return JSON.parse(atob(token.split('.')[1]))?.user_id || null; } catch { return null; }
  }, []);

  useEffect(() => {
    pointService.getAllUsersPoints()
      .then(data => {
        const list = Array.isArray(data) ? data : data.data || [];
        setRankingData([...list].sort((a, b) => (b?.total_points ?? 0) - (a?.total_points ?? 0)));
      })
      .catch(() => setError('Impossible de charger le classement.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Computed values ── */
  const stats = useMemo(() => {
    const total    = rankingData.length;
    const totalPts = rankingData.reduce((s, r) => s + (r.total_points || 0), 0);
    return { total, totalPts, best: rankingData[0]?.total_points || 0, avg: total ? Math.round(totalPts / total) : 0 };
  }, [rankingData]);

  const myIndex  = useMemo(() => {
    if (!currentUserId) return -1;
    return rankingData.findIndex(r => Number(r.user_id) === Number(currentUserId));
  }, [rankingData, currentUserId]);

  const myPlayer = myIndex >= 0 ? rankingData[myIndex] : null;
  const myRank   = myIndex >= 0 ? myIndex + 1 : null;
  const myPts    = myPlayer?.total_points || 0;

  const neighbors = useMemo(() => {
    if (myIndex < 0) return [];
    const start = Math.max(0, myIndex - 2);
    const end   = Math.min(rankingData.length, myIndex + 3);
    return rankingData.slice(start, end).map((p, i) => ({ ...p, rank: start + i + 1 }));
  }, [rankingData, myIndex]);

  const divisionStats = useMemo(() => DIVISIONS.map(div => {
    const players = rankingData.filter(r => getDivision(r.total_points || 0).name === div.name);
    return { ...div, count: players.length, isMe: myPlayer ? getDivision(myPts).name === div.name : false };
  }), [rankingData, myPlayer, myPts]);

  const top3  = rankingData.slice(0, 3);
  const top10 = rankingData.slice(0, 10);
  const rest  = rankingData.slice(3);

  const filtered = useMemo(() => {
    if (!search.trim()) return rankingData;
    const q = search.trim().toLowerCase();
    return rankingData.filter(r =>
      (r.full_name || '').toLowerCase().includes(q) ||
      (r.first_name || '').toLowerCase().includes(q)
    );
  }, [rankingData, search]);

  const progressToFirst = stats.best > 0 ? Math.min(100, Math.round((myPts / stats.best) * 100)) : 0;
  const ptsToNext       = myRank > 1 ? (rankingData[myIndex - 1]?.total_points || 0) - myPts : 0;

  /* ── Helpers ── */
  const PlayerRow = ({ player, rank, idx }) => {
    const isMe = Number(player.user_id) === Number(currentUserId);
    return (
      <div className={`rk-row${isMe ? ' rk-row-me' : ''}`} style={{ animationDelay: `${idx * 0.025}s` }}>
        <div className="rk-row-rank">
          {rank <= 3
            ? <span className={`rk-rank-circle rk-rank-c${rank}`}>{rank}</span>
            : <span className="rk-rank-num">#{rank}</span>}
        </div>
        <div className="rk-row-avatar">
          <img src={player.avatar_url} alt={player.full_name} />
          {isMe && <span className="rk-row-me-dot" />}
        </div>
        <div className="rk-row-info">
          <span className="rk-row-name">
            {player.full_name}
            {isMe && <span className="rk-row-me-tag">Vous</span>}
          </span>
        </div>
        <div className="rk-row-pts">
          <span className="rk-pts-val">{(player.total_points ?? 0).toLocaleString('fr-FR')}</span>
          <span className="rk-pts-lbl">points</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rk-wrap">

      {/* ── TOP BAR ── */}
      <div className="rk-topbar">
        <div className="rk-topbar-inner">
          <h1 className="rk-topbar-title">Classement</h1>
          <div className="rk-search">
            <span className="rk-search-icon">🔍</span>
            <input
              className="rk-search-input"
              placeholder="Rechercher un joueur…"
              value={search}
              onChange={e => { setSearch(e.target.value); }}
            />
            {search && <button className="rk-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <div className="rk-tabs">
            <button className={`rk-tab${tab === 'top'       ? ' active' : ''}`} onClick={() => setTab('top')}>Top joueurs</button>
            <button className={`rk-tab${tab === 'divisions' ? ' active' : ''}`} onClick={() => setTab('divisions')}>Divisions</button>
            <button className={`rk-tab${tab === 'myrank'    ? ' active' : ''}`} onClick={() => setTab('myrank')}>Mon rang</button>
          </div>
        </div>
      </div>

      {/* ── STATES ── */}
      {loading ? (
        <div className="rk-loading">
          <div className="rk-spinner" />
          <p className="rk-loading-text">Chargement du classement…</p>
        </div>
      ) : error ? (
        <div className="rk-error">{error}</div>
      ) : search.trim() ? (

        /* ══════════════════════════════════════
           SEARCH RESULTS
        ══════════════════════════════════════ */
        <div className="rk-content">
          <div className="rk-section">
            <div className="rk-section-header">
              <h2 className="rk-section-title">Résultats</h2>
              <span className="rk-section-chip">{filtered.length} joueur{filtered.length > 1 ? 's' : ''}</span>
            </div>
            <div className="rk-list-card">
              {filtered.length === 0
                ? <div className="rk-empty">Aucun résultat pour « {search} »</div>
                : filtered.map((player, idx) => (
                    <PlayerRow key={player.user_id} player={player} rank={rankingData.indexOf(player) + 1} idx={idx} />
                  ))
              }
            </div>
          </div>
        </div>

      ) : tab === 'top' ? (

        /* ══════════════════════════════════════
           TAB : TOP JOUEURS
           §1 Stats — §3 Top 3 — §6 Top 10 — §7 Classement
        ══════════════════════════════════════ */
        <div className="rk-content">

          {/* §1 — Statistiques */}
          <div className="rk-section" style={{ animationDelay: '0s' }}>
            <div className="rk-section-header">
              <h2 className="rk-section-title">Statistiques globales</h2>
            </div>
            <div className="rk-stats-grid">
              <div className="rk-stat-card">
                <span className="rk-stat-icon">👥</span>
                <span className="rk-stat-val">{stats.total.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Joueurs classés</span>
              </div>
              <div className="rk-stat-card">
                <span className="rk-stat-icon">🪙</span>
                <span className="rk-stat-val">{stats.totalPts.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Points distribués</span>
              </div>
              <div className="rk-stat-card">
                <span className="rk-stat-icon">🏆</span>
                <span className="rk-stat-val">{stats.best.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Meilleur score</span>
              </div>
              <div className="rk-stat-card">
                <span className="rk-stat-icon">📊</span>
                <span className="rk-stat-val">{stats.avg.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Score moyen</span>
              </div>
            </div>
          </div>

          {/* §3 — Top 3 */}
          {top3.length > 0 && (
            <div className="rk-section" style={{ animationDelay: '.06s' }}>
              <div className="rk-section-header">
                <h2 className="rk-section-title">Meilleurs joueurs</h2>
                <span className="rk-section-chip">Top 3</span>
              </div>
              <div className="rk-featured">
                {PODIUM_ORDER.map((pos) => {
                  const player = top3[pos];
                  if (!player) return null;
                  const isMe = Number(player.user_id) === Number(currentUserId);
                  const rank = pos + 1;
                  const LABELS = ['', '#1 · Or', '#2 · Argent', '#3 · Bronze'];
                  return (
                    <div key={player.user_id} className={`rk-featured-card rk-featured-card-${rank}${isMe ? ' is-me' : ''}`}>
                      <span className={`rk-feat-rank-badge rk-feat-rank-${rank}`}>{LABELS[rank]}</span>
                      {isMe && <span className="rk-feat-me-badge">Vous</span>}
                      <div className="rk-featured-avatar">
                        <img src={player.avatar_url} alt={player.full_name} />
                      </div>
                      <p className="rk-featured-name">{player.first_name || player.full_name}</p>
                      <p className="rk-featured-pts">
                        <strong>{(player.total_points ?? 0).toLocaleString('fr-FR')}</strong> pts
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* §6 — Top 10 rapide */}
          {top10.length > 0 && (
            <div className="rk-section" style={{ animationDelay: '.12s' }}>
              <div className="rk-section-header">
                <h2 className="rk-section-title">Top 10</h2>
                <span className="rk-section-chip">Meilleurs scores</span>
              </div>
              <div className="rk-top10-scroll">
                {top10.map((player, idx) => {
                  const rank = idx + 1;
                  const isMe = Number(player.user_id) === Number(currentUserId);
                  return (
                    <div key={player.user_id} className={`rk-top10-card${isMe ? ' is-me' : ''}`}>
                      <div className={`rk-top10-rank${rank <= 3 ? ` rk-top10-rank-${rank}` : ''}`}>{rank}</div>
                      <div className="rk-top10-avatar">
                        <img src={player.avatar_url} alt={player.full_name} />
                      </div>
                      <span className="rk-top10-name">{player.first_name || player.full_name}</span>
                      <span className="rk-top10-pts">{(player.total_points ?? 0).toLocaleString('fr-FR')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* §7 — Classement complet */}
          {rest.length > 0 && (
            <div className="rk-section" style={{ animationDelay: '.18s' }}>
              <div className="rk-section-header">
                <h2 className="rk-section-title">Classement complet</h2>
                <span className="rk-section-chip">{rankingData.length} joueurs</span>
              </div>
              <div className="rk-list-card">
                {rest.map((player, idx) => (
                  <PlayerRow key={player.user_id} player={player} rank={idx + 4} idx={idx} />
                ))}
              </div>
            </div>
          )}

        </div>

      ) : tab === 'divisions' ? (

        /* ══════════════════════════════════════
           TAB : DIVISIONS
           §1 Stats — §5 Divisions
        ══════════════════════════════════════ */
        <div className="rk-content">

          {/* §1 — Statistiques */}
          <div className="rk-section" style={{ animationDelay: '0s' }}>
            <div className="rk-section-header">
              <h2 className="rk-section-title">Statistiques globales</h2>
            </div>
            <div className="rk-stats-grid">
              <div className="rk-stat-card">
                <span className="rk-stat-icon">👥</span>
                <span className="rk-stat-val">{stats.total.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Joueurs classés</span>
              </div>
              <div className="rk-stat-card">
                <span className="rk-stat-icon">🪙</span>
                <span className="rk-stat-val">{stats.totalPts.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Points distribués</span>
              </div>
              <div className="rk-stat-card">
                <span className="rk-stat-icon">🏆</span>
                <span className="rk-stat-val">{stats.best.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Meilleur score</span>
              </div>
              <div className="rk-stat-card">
                <span className="rk-stat-icon">📊</span>
                <span className="rk-stat-val">{stats.avg.toLocaleString('fr-FR')}</span>
                <span className="rk-stat-lbl">Score moyen</span>
              </div>
            </div>
          </div>

          {/* §5 — Divisions */}
          <div className="rk-section" style={{ animationDelay: '.06s' }}>
            <div className="rk-section-header">
              <h2 className="rk-section-title">Divisions</h2>
              {myPlayer && <span className="rk-section-chip">Votre division : {getDivision(myPts).name}</span>}
            </div>
            <div className="rk-divisions-list">
              {divisionStats.map(div => (
                <div key={div.name} className={`rk-division-row${div.isMe ? ' is-me' : ''}`}>
                  <div className="rk-div-icon" style={{ background: div.bg }}>{div.icon}</div>
                  <div className="rk-div-info">
                    <span className="rk-div-name" style={{ color: div.isMe ? '#137333' : '#202124' }}>{div.name}</span>
                    <span className="rk-div-range">
                      {div.minPts === 0 ? '0' : div.minPts.toLocaleString('fr-FR')} pts
                      {DIVISIONS.indexOf(div) > 0
                        ? ` – ${(DIVISIONS[DIVISIONS.indexOf(div) - 1].minPts - 1).toLocaleString('fr-FR')} pts`
                        : '+'}
                    </span>
                    <div className="rk-div-bar-track">
                      <div className="rk-div-bar-fill" style={{
                        width: stats.total > 0 ? `${Math.round((div.count / stats.total) * 100)}%` : '0%',
                        background: div.bar,
                      }} />
                    </div>
                  </div>
                  <div className="rk-div-right">
                    <span className="rk-div-count">{div.count}</span>
                    <span className="rk-div-pct">{stats.total > 0 ? Math.round((div.count / stats.total) * 100) : 0}%</span>
                    {div.isMe && <span className="rk-div-me-tag">Vous êtes ici</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      ) : (

        /* ══════════════════════════════════════
           TAB : MON RANG
           §2 Mon classement — §4 Autour de moi
        ══════════════════════════════════════ */
        <div className="rk-content">

          {/* §2 — Mon classement */}
          <div className="rk-section" style={{ animationDelay: '0s' }}>
            <div className="rk-section-header">
              <h2 className="rk-section-title">Mon classement</h2>
              {myRank && <span className="rk-section-chip">#{myRank} / {stats.total}</span>}
            </div>
            {!currentUserId ? (
              <div className="rk-myrank-login">Connectez-vous pour voir votre position dans le classement.</div>
            ) : !myPlayer ? (
              <div className="rk-myrank-login">Vous n'apparaissez pas encore dans le classement. Jouez pour gagner des points !</div>
            ) : (
              <div className="rk-myrank-card">
                <div className="rk-myrank-avatar">
                  <img src={myPlayer.avatar_url} alt={myPlayer.full_name} />
                </div>
                <div className="rk-myrank-info">
                  <div className="rk-myrank-top">
                    <span className="rk-myrank-name">{myPlayer.full_name}</span>
                    <span className="rk-myrank-pts">{myPts.toLocaleString('fr-FR')} pts</span>
                  </div>
                  <div className="rk-myrank-bar-wrap">
                    <div className="rk-myrank-bar-labels">
                      <span>0 pts</span>
                      <span>{progressToFirst}% du score #1</span>
                      <span>{stats.best.toLocaleString('fr-FR')} pts</span>
                    </div>
                    <div className="rk-myrank-bar-track">
                      <div className="rk-myrank-bar-fill" style={{ width: `${progressToFirst}%` }} />
                    </div>
                  </div>
                  <div className="rk-myrank-meta">
                    <span className="rk-myrank-badge green">Division {getDivision(myPts).name}</span>
                    {myRank > 1 && (
                      <span className="rk-myrank-badge">+{ptsToNext.toLocaleString('fr-FR')} pts pour monter</span>
                    )}
                    {myRank === 1 && (
                      <span className="rk-myrank-badge green">Leader du classement 🏆</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* §4 — Autour de moi */}
          {neighbors.length > 0 && (
            <div className="rk-section" style={{ animationDelay: '.06s' }}>
              <div className="rk-section-header">
                <h2 className="rk-section-title">Autour de moi</h2>
                <span className="rk-section-chip">±2 rangs</span>
              </div>
              <div className="rk-neighbors-list">
                {neighbors.map((player) => {
                  const isMe = Number(player.user_id) === Number(currentUserId);
                  const gap  = !isMe && player.rank < myRank
                    ? player.total_points - myPts
                    : !isMe && player.rank > myRank
                    ? myPts - player.total_points
                    : 0;
                  return (
                    <div key={player.user_id} className={`rk-neighbor-row${isMe ? ' is-me' : ''}`}>
                      <span className="rk-neighbor-rank">#{player.rank}</span>
                      <div className="rk-neighbor-avatar">
                        <img src={player.avatar_url} alt={player.full_name} />
                      </div>
                      <span className="rk-neighbor-name">{player.full_name}{isMe ? ' (Vous)' : ''}</span>
                      <span className="rk-neighbor-pts">
                        {(player.total_points ?? 0).toLocaleString('fr-FR')} pts
                        {!isMe && gap > 0 && (
                          <span className="rk-neighbor-gap">
                            ({player.rank < myRank ? '+' : '-'}{gap.toLocaleString('fr-FR')})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!currentUserId && (
            <div className="rk-myrank-login">Connectez-vous pour voir les joueurs autour de vous.</div>
          )}

        </div>
      )}
    </div>
  );
};

export default Ranking;
