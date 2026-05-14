import React, { useEffect, useState, useRef } from 'react';
import { PiBellRingingDuotone } from 'react-icons/pi';
import { MdOutlineMessage } from 'react-icons/md';
import { FiMenu } from 'react-icons/fi';
import messageServices from '../../../../../configurations/Services/messageServices.js';
import quizStatsServices from '../../../../../configurations/Services/quizStatsServices.js';
import { useLocation, useNavigate } from 'react-router-dom';

const HeadDash = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messagesCount, setMessagesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenKey = 'dashNotifLastSeen';
  const [lastSeenAt, setLastSeenAt] = useState(() => Number(localStorage.getItem(lastSeenKey) || 0));
  const msgLastSeenKey = 'dashMsgLastSeen';
  const [lastMsgSeenAt, setLastMsgSeenAt] = useState(() => Number(localStorage.getItem(msgLastSeenKey) || 0));
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
        }
      } catch {
        if (!ignore) {
          setRecentActivity([]);
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
    <div className="w-full flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          onClick={onOpenSidebar}
        >
          <FiMenu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{getTitle(location.pathname)}</h1>
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Console d'administration</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Bouton Messages */}
        <button
          className="relative p-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all border border-gray-100"
          aria-label="Messages"
          onClick={() => {
            const now = Date.now();
            localStorage.setItem(msgLastSeenKey, String(now));
            setLastMsgSeenAt(now);
            setMessagesCount(0);
            navigate('/dashboard/message');
          }}
        >
          <MdOutlineMessage size={20} />
          {messagesCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
              {messagesCount}
            </span>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            className={`p-2.5 rounded-xl transition-all border ${
              isNotifOpen 
                ? 'bg-blue-50 text-blue-600 border-blue-100' 
                : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-blue-600'
            }`}
            onClick={() => {
              setIsNotifOpen((v) => {
                if (!v) {
                  const now = Date.now();
                  localStorage.setItem(lastSeenKey, String(now));
                  setLastSeenAt(now);
                  setUnreadCount(0);
                }
                return !v;
              });
            }}
          >
            <PiBellRingingDuotone size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Notifications récentes</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">Aucune notification pour le moment</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentActivity.map((a) => {
                      const dateStr = a.played_at ? new Date(a.played_at).toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '—';
                      return (
                        <button
                          key={a.history_id || `${a.user_id}-${a.played_at}`}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigate('/dashboard/quiz');
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              Q
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 line-clamp-2">
                                <span className="font-bold">{a.full_name || 'Un utilisateur'}</span> a joué <span className="text-blue-600 font-medium">{a.quiz_title}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-400 font-medium">{dateStr}</span>
                                {a.success_rate !== undefined && (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                                    {a.success_rate}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-2 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => { setIsNotifOpen(false); navigate('/dashboard/quiz'); }}
                  className="w-full py-2 text-xs font-bold text-blue-600 hover:bg-white rounded-lg transition-colors"
                >
                  Voir toute l'activité
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadDash;
