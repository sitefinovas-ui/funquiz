import React, { useEffect, useState, useRef } from 'react';
import './headDash.css';
import { PiBellRingingDuotone } from 'react-icons/pi';
import { MdOutlineMessage } from 'react-icons/md';
import messageServices from '../../../../../configurations/Services/messageServices.js';
import quizStatsServices from '../../../../../configurations/Services/quizStatsServices.js';
import { useLocation, useNavigate } from 'react-router-dom';

const HeadDash = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messagesCount, setMessagesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenKey = 'dashNotifLastSeen';
  const [lastSeenAt, setLastSeenAt] = useState(() => Number(localStorage.getItem(lastSeenKey) || 0));
  // ➕ suivi des messages vus et état d’ouverture du popup messages
  const msgLastSeenKey = 'dashMsgLastSeen';
  const [lastMsgSeenAt, setLastMsgSeenAt] = useState(() => Number(localStorage.getItem(msgLastSeenKey) || 0));
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  // ➕ état d’ouverture du menu notifications + ref pour clic extérieur
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const refresh = async () => {
      try {
        const msgs = await messageServices.getAllMessages();
        const seenTs = Number(localStorage.getItem(msgLastSeenKey) || lastMsgSeenAt || 0);
        let unread = 0;
        if (Array.isArray(msgs)) {
          unread = msgs.filter((m) => {
            // Priorité: flag is_read si présent
            if (m && typeof m.is_read !== 'undefined') {
              const v = m.is_read;
              return !(v === true || v === 1 || v === '1');
            }
            // Sinon, comparer un timestamp connu à last seen
            const ts = (
              m?.created_at ? new Date(m.created_at).getTime() :
              m?.sent_at ? new Date(m.sent_at).getTime() :
              m?.date ? new Date(m.date).getTime() :
              m?.timestamp ? Number(m.timestamp) :
              0
            );
            return ts > seenTs;
          }).length;
        }
        if (!ignore) setMessagesCount(unread);
      } catch {
        if (!ignore) setMessagesCount(0);
      }
      try {
        const res = await quizStatsServices.getRecentActivity(7);
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!ignore) {
          setRecentActivity(items);
          setNotifCount(items.length);
        }
      } catch {
        if (!ignore) {
          setRecentActivity([]);
          setNotifCount(0);
        }
      }
    };
    refresh();
    const id = setInterval(refresh, 60000);
    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, []);

  // ➕ gestion fermeture au clic extérieur et touche Échap
  useEffect(() => {
    const onDocClick = (e) => {
      if (!notifDropdownRef.current) return;
      if (!notifDropdownRef.current.contains(e.target)) setIsNotifOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  // Recalcule les non-lus à chaque changement de liste ou de dernière consultation
  useEffect(() => {
    const latestUnread = recentActivity.filter((a) => {
      const ts = a.played_at ? new Date(a.played_at).getTime() : 0;
      return ts > lastSeenAt;
    }).length;
    setUnreadCount(latestUnread);
  }, [recentActivity, lastSeenAt]);

  const getTitle = (path) => {
    if (path === '/dashboard' || path === '/dashboard/') return "Vue d'ensemble";
    if (path.startsWith('/dashboard/users')) return 'Utilisateurs';
    if (path.startsWith('/dashboard/comment')) return 'Commentaires';
    if (path.startsWith('/dashboard/message')) return 'Messages';
    if (path.startsWith('/dashboard/newsletter')) return 'Newsletter';
    if (path.startsWith('/dashboard/quiz')) return 'Quiz';
    if (path.startsWith('/dashboard/legal')) return 'Légal';
    if (path.startsWith('/dashboard/logs')) return 'Logs';
    if (path.startsWith('/dashboard/settings')) return 'Réglages';
    return 'Backoffice';
  };

  return (
    <header className="head-dash d-flex align-items-center justify-content-between gap-3">
      <div className="d-flex align-items-center gap-2 min-w-0">
        <button
          type="button"
          className="head-dash-burger"
          aria-label="Ouvrir le menu"
          onClick={() => onOpenSidebar && onOpenSidebar()}
        >
          ≡
        </button>
        <div className="head-dash-title-wrap min-w-0">
          <div className="head-dash-title text-truncate">{getTitle(location.pathname)}</div>
          <div className="head-dash-subtitle text-truncate">Admin Console</div>
        </div>
      </div>

      <div className="header-menu d-flex align-items-center gap-3">
          {/* Bouton Messages */}
          <button
            className="btn-icon"
            aria-label="Messages"
            onClick={() => {
              const now = Date.now();
              localStorage.setItem(msgLastSeenKey, String(now));
              setLastMsgSeenAt(now);
              setIsMessageOpen(true);
              setMessagesCount(0);
              navigate('/dashboard/message');
            }}
          >
            <MdOutlineMessage className="fs-4" />
            {messagesCount > 0 && <span className="icon-badge">{messagesCount}</span>}
          </button>

          {/* Notifications (cloche) */}
          <div className="dropdown position-relative " ref={notifDropdownRef}>
            <button
              className="btn-icon"
              type="button"
              aria-expanded={isNotifOpen}
              aria-label="Notifications"
              onClick={() => {
                setIsNotifOpen((opened) => {
                  const next = !opened;
                  if (!opened && next) {
                    const now = Date.now();
                    localStorage.setItem(lastSeenKey, String(now));
                    setLastSeenAt(now);
                    setUnreadCount(0);
                  }
                  return next;
                });
              }}
            >
              <PiBellRingingDuotone className="fs-4" />
              {unreadCount > 0 && <span className="icon-badge bg-danger">{unreadCount}</span>}
            </button>
            <ul
              className={`dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 ${isNotifOpen ? 'show' : ''}`}
              style={{ display: isNotifOpen ? 'block' : undefined }}
            >
              <li>
                <p className="dropdown-header text-dark">Mes Notifications</p>
              </li>

              {recentActivity.length === 0 ? (
                <li className="px-3 py-2 text-dark">Aucune notification récente</li>
              ) : (
                
                recentActivity.map((a) => {
                  const dateStr = a.played_at ? new Date(a.played_at).toLocaleString('fr-FR') : '—';
                  const rate = a.success_rate !== undefined ? `${a.success_rate}%` : '';
                  const text = a.full_name && a.quiz_title
                    ? `🎯 ${a.full_name} a joué "${a.quiz_title}" (${a.thematic_title}) • ${rate}`
                    : `🎯 Activité récente • ${rate}`;
                  return (
                    <li key={a.history_id || `${a.user_id}-${dateStr}`}>
                      <button
                        type="button"
                        className="dropdown-item text-dark"
                        onClick={() => {
                          setIsNotifOpen(false);
                          navigate('/dashboard/quiz');
                        }}
                      >
                        {text}
                        <br />
                        <small className="text-muted">{dateStr}</small>
                      </button>
                    </li>
                  );
                })
              )}

              <li>
                <hr className="dropdown-divider" />
              </li>
              
            </ul>
          </div>
        </div>
    </header>
  );
};

export default HeadDash;
