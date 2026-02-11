import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../configurations/Context/useAuth';
import privateMessageService from '../../configurations/Services/privateMessageService.js';
import authService from '../../configurations/Services/authServices.js';
import { FiArrowLeft, FiSend, FiUserPlus } from 'react-icons/fi';
import './privateMessages.css';

const computeSocketUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  const useProxy = String(import.meta.env.VITE_USE_PROXY || '').toLowerCase() === 'true';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

  const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
  const isPrivateIpv4 =
    isIpv4 &&
    (host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host));

  const useLan = host === 'localhost' || host === '127.0.0.1' || isPrivateIpv4;
  const lan = useLan ? `${protocol}//${host}:${import.meta.env.VITE_API_PORT || '5100'}` : '';

  const sameOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const raw = envUrl || lan || (useProxy ? sameOrigin : '') || 'http://localhost:5100';
  return raw.replace(/\/api\/?$/, '');
};

const PrivateMessages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.user_id;
  const isStaff = user?.role === 'admin' || user?.role === 'moderator';

  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [newRecipientId, setNewRecipientId] = useState('');

  const socketRef = useRef(null);
  const messagesRef = useRef(null);
  const activeThreadRef = useRef(null);
  const allUsersRef = useRef([]);

  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) =>
      `${t.name || ''} ${t.first_name || ''}`.toLowerCase().includes(q)
    );
  }, [threads, search]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const startConversationWithUser = (userItem) => {
    if (!userItem?.user_id) return;
    setThreads((prev) => {
      const exists = prev.find((t) => t.user_id === userItem.user_id);
      if (exists) return prev;
      return [
        {
          user_id: userItem.user_id,
          name: userItem.name,
          first_name: userItem.first_name,
          avatar_url: userItem.avatar_url,
          last_message: '',
          last_at: null,
          unread_count: 0,
        },
        ...prev,
      ];
    });
    setActiveThread({
      user_id: userItem.user_id,
      name: userItem.name,
      first_name: userItem.first_name,
      avatar_url: userItem.avatar_url,
    });
    setNewRecipientId('');
  };

  const updateThreadsWithMessage = (msg, currentActive, allUsersSnapshot) => {
    setThreads((prev) => {
      const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      const existing = prev.find((t) => t.user_id === otherId);
      const otherUser = allUsersSnapshot.find((u) => u.user_id === otherId);
      const fromActive = currentActive?.user_id === otherId;
      const isIncoming = msg.receiver_id === currentUserId;
      const resolvedName =
        existing?.name ||
        (fromActive ? currentActive?.name : null) ||
        otherUser?.name ||
        (msg.sender_id !== currentUserId ? msg.sender_name : 'Utilisateur');
      const resolvedFirst =
        existing?.first_name ||
        (fromActive ? currentActive?.first_name : null) ||
        otherUser?.first_name ||
        (msg.sender_id !== currentUserId ? msg.sender_first_name : '');
      const resolvedAvatar =
        existing?.avatar_url ||
        (fromActive ? currentActive?.avatar_url : null) ||
        otherUser?.avatar_url ||
        (msg.sender_id !== currentUserId ? msg.sender_avatar_url : '');
      const updated = {
        user_id: otherId,
        name: resolvedName,
        first_name: resolvedFirst,
        avatar_url: resolvedAvatar,
        last_message: msg.content,
        last_at: msg.created_at,
        unread_count:
          isIncoming && otherId !== currentActive?.user_id
            ? (existing?.unread_count || 0) + 1
            : existing?.unread_count || 0,
      };
      const filtered = prev.filter((t) => t.user_id !== otherId);
      return [updated, ...filtered];
    });
  };

  const appendOrReplaceMessage = (msg, currentActive, otherId) => {
    if (!currentActive?.user_id || currentActive.user_id !== otherId) return;
    setMessages((prev) => {
      if (msg.sender_id === currentUserId) {
        const pendingIndex = prev.findIndex(
          (m) =>
            m?.pending &&
            m.sender_id === msg.sender_id &&
            m.receiver_id === msg.receiver_id &&
            m.content === msg.content
        );
        if (pendingIndex !== -1) {
          const next = [...prev];
          next[pendingIndex] = msg;
          return next;
        }
      }
      if (prev.some((m) => m.message_id && m.message_id === msg.message_id)) {
        return prev;
      }
      return [...prev, msg];
    });
  };

  useEffect(() => {
    let ignore = false;
    const fetchThreads = async () => {
      try {
        setLoadingThreads(true);
        const list = await privateMessageService.getConversations();
        if (!ignore) {
          setThreads(Array.isArray(list) ? list : []);
          if (!activeThread && list?.length) {
            setActiveThread(list[0]);
          }
        }
      } catch (e) {
        if (!ignore) setThreads([]);
      } finally {
        if (!ignore) setLoadingThreads(false);
      }
    };
    fetchThreads();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchUsers = async () => {
      try {
        const list = await authService.getAllUsers();
        if (!ignore) {
          const base = (Array.isArray(list) ? list : []).filter((u) => u.user_id !== currentUserId);
          if (isStaff) {
            setAllUsers(base.filter((u) => u.role === 'user'));
            return;
          }

          const admins = base.filter((u) => u.role === 'admin');
          const moderators = base.filter((u) => u.role === 'moderator');
          const staffSorted = [...admins, ...moderators];
          setAllUsers(staffSorted);
        }
      } catch {
        if (!ignore) setAllUsers([]);
      }
    };
    fetchUsers();
    return () => {
      ignore = true;
    };
  }, [currentUserId, isStaff]);

  useEffect(() => {
    if (!isStaff) return;
    const openUserId = location.state?.openUserId;
    if (!openUserId) return;

    const target = allUsers.find((u) => Number(u.user_id) === Number(openUserId));
    if (!target?.user_id) return;

    setThreads((prev) => {
      const exists = prev.find((t) => Number(t.user_id) === Number(target.user_id));
      if (exists) return prev;
      return [
        {
          user_id: target.user_id,
          name: target.name,
          first_name: target.first_name,
          avatar_url: target.avatar_url,
          last_message: '',
          last_at: null,
          unread_count: 0,
        },
        ...prev,
      ];
    });

    setActiveThread({
      user_id: target.user_id,
      name: target.name,
      first_name: target.first_name,
      avatar_url: target.avatar_url,
    });
    navigate('/messages', { replace: true, state: {} });
  }, [allUsers, isStaff, location.state?.openUserId, navigate]);

  useEffect(() => {
    if (!activeThread?.user_id) return;
    let ignore = false;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const list = await privateMessageService.getThread(activeThread.user_id);
        if (!ignore) setMessages(Array.isArray(list) ? list : []);
        await privateMessageService.markRead(activeThread.user_id);
        socketRef.current?.emit('private:read', { other_id: activeThread.user_id });
        setThreads((prev) =>
          prev.map((t) =>
            t.user_id === activeThread.user_id ? { ...t, unread_count: 0 } : t
          )
        );
      } catch {
        if (!ignore) setMessages([]);
      } finally {
        if (!ignore) setLoadingMessages(false);
      }
    };

    loadMessages();
    return () => {
      ignore = true;
    };
  }, [activeThread?.user_id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !currentUserId) return;
    const socket = io(computeSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('private:message', (msg) => {
      if (!msg?.sender_id || !msg?.receiver_id) return;
      const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      const currentActive = activeThreadRef.current;
      const allUsersSnapshot = allUsersRef.current || [];

      updateThreadsWithMessage(msg, currentActive, allUsersSnapshot);
      appendOrReplaceMessage(msg, currentActive, otherId);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!activeThread?.user_id || !currentUserId) return;
    const content = newMessage.trim();
    if (!content) return;
    setNewMessage('');

    const localMessage = {
      local_id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sender_id: currentUserId,
      receiver_id: activeThread.user_id,
      content,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, localMessage]);
    updateThreadsWithMessage(localMessage, activeThreadRef.current, allUsersRef.current || []);

    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('private:send', { toUserId: activeThread.user_id, content });
      return;
    }

    try {
      const saved = await privateMessageService.sendMessage({
        receiver_id: activeThread.user_id,
        content,
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.local_id === localMessage.local_id ? saved : msg))
      );
      updateThreadsWithMessage(saved, activeThreadRef.current, allUsersRef.current || []);
    } catch {
    }
  };

  return (
    <div className="pm-page">
      <div className="pm-container">
        <div className="pm-header">
          <button className="pm-back" type="button" onClick={() => navigate('/profil')}>
            <FiArrowLeft /> Retour profil
          </button>
          <div>
            <h1>Messagerie privee</h1>
            <p>Discutez en prive avec les membres de la communaute.</p>
          </div>
        </div>

        <div className="pm-shell">
          <aside className="pm-sidebar">
            <div className="pm-new">
              <div className="pm-new-title">
                {isStaff ? 'Nouvelle conversation' : 'Contacter un admin'}
              </div>
              <div className="pm-new-row">
                <select
                  className="pm-select"
                  value={newRecipientId}
                  onChange={(e) => setNewRecipientId(e.target.value)}
                >
                  <option value="">
                    {isStaff ? 'Choisir un utilisateur' : 'Choisir un admin'}
                  </option>
                  {allUsers.map((u) => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.name} {u.first_name} {u.role ? `(${u.role})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="pm-new-btn"
                  onClick={() => {
                    const selected = allUsers.find(
                      (u) => String(u.user_id) === String(newRecipientId)
                    );
                    if (selected) startConversationWithUser(selected);
                  }}
                  disabled={!newRecipientId}
                >
                  <FiUserPlus />
                  Ouvrir
                </button>
              </div>
            </div>

            <div className="pm-search">
              <input
                placeholder="Rechercher une conversation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="pm-threads">
              {loadingThreads && <div className="pm-empty">Chargement...</div>}
              {!loadingThreads && filteredThreads.length === 0 && (
                <div className="pm-empty">Aucune conversation pour le moment.</div>
              )}
              {filteredThreads.map((thread) => (
                <button
                  key={thread.user_id}
                  type="button"
                  className={`pm-thread ${activeThread?.user_id === thread.user_id ? 'active' : ''}`}
                  onClick={() => setActiveThread(thread)}
                >
                  <div className="pm-thread-avatar">
                    {thread.avatar_url ? (
                      <img src={thread.avatar_url} alt={thread.name} />
                    ) : (
                      <span>{(thread.name || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div className="pm-thread-info">
                    <div className="pm-thread-title">
                      {thread.name} {thread.first_name}
                    </div>
                    <div className="pm-thread-preview">{thread.last_message || '...'}</div>
                  </div>
                  <div className="pm-thread-meta">
                    <span>{formatTime(thread.last_at)}</span>
                    {thread.unread_count > 0 && (
                      <span className="pm-thread-badge">{thread.unread_count}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="pm-chat">
            {!activeThread && <div className="pm-empty">Selectionnez une conversation.</div>}
            {activeThread && (
              <>
                <div className="pm-chat-header">
                  <div className="pm-chat-user">
                    <div className="pm-chat-avatar">
                      {activeThread.avatar_url ? (
                        <img src={activeThread.avatar_url} alt={activeThread.name} />
                      ) : (
                        <span>{(activeThread.name || 'U').charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="pm-chat-name">
                        {activeThread.name} {activeThread.first_name}
                      </div>
                      <div className="pm-chat-subtitle">
                        {isStaff ? 'Support utilisateur' : 'Support'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pm-chat-body" ref={messagesRef}>
                  {loadingMessages && <div className="pm-empty">Chargement...</div>}
                  {!loadingMessages &&
                    messages.map((msg) => {
                      const isMine = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.message_id || msg.local_id}
                          className={`pm-bubble ${isMine ? 'me' : 'them'} ${msg.pending ? 'pending' : ''}`}
                        >
                          <div className="pm-bubble-content">{msg.content}</div>
                          <div className="pm-bubble-meta">
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <form className="pm-chat-input" onSubmit={handleSend}>
                  <input
                    placeholder="Ecrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit">
                    <FiSend />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivateMessages;
