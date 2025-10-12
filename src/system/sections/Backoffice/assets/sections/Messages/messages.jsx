import { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import messageServices from '../../../../../configurations/Services/messageServices.js';
import { jwtDecode } from 'jwt-decode';
import './messages.css';

import {
  IoMdSearch,
  IoMdSend,
  IoMdMore,
  IoMdCall,
  IoMdVideocam,
  IoMdInformationCircle,
  IoMdAttach,
  IoMdHappy,
  IoMdClose,
  IoMdArchive,
  IoMdStar,
  IoMdTrash,
  IoMdPerson,
  IoMdTime,
  IoMdCheckmarkCircle,
  IoMdAdd,
  IoMdChatbubbles,
  IoMdMail,
  IoMdNotifications,
} from 'react-icons/io';

const Messages = () => {
  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Centre de messagerie';
  }, []);

  const [showPicker, setShowPicker] = useState(false);
  const role = localStorage.getItem('token');
  let decoded = null;
  try {
    decoded = role ? jwtDecode(role) : null;
  } catch {
    decoded = null;
  }
  const isAdmin = decoded?.role === 'admin';

  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testContent, setTestContent] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleEmojiClick = (emojiData, event) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim() || !testSubject.trim() || !testContent.trim()) {
      setTestStatus({ type: 'error', message: 'Tous les champs sont requis.' });
      return;
    }
    try {
      setTestLoading(true);
      await messageServices.sendEmail({
        email: testEmail.trim(),
        name: selectedMessage?.name,
        firstname: selectedMessage?.firstname,
        subject: testSubject.trim(),
        content: testContent.trim(),
      });
      setTestStatus({ type: 'success', message: 'Email envoyé avec succès' });
      setTestContent('');
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Erreur lors de l'envoi";
      setTestStatus({ type: 'error', message: msg });
    } finally {
      setTestLoading(false);
    }
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || null;
    } catch {
      return null;
    }
  };

  const aggregateConversations = (items) => {
    const groups = new Map();

    items.forEach((m) => {
      const emailNorm = (m.email || '').toLowerCase();
      const hasEmail = emailNorm && emailNorm !== 'sans email';
      const key = hasEmail ? `email:${emailNorm}` : m.user_id ? `uid:${m.user_id}` : `msg:${m.id}`;

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(m);
    });

    const conversations = Array.from(groups.entries()).map(([groupKey, arr]) => {
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const last = arr[arr.length - 1];

      const unreadTotal = arr.reduce(
        (acc, x) => acc + (x.status === 'unread' && !(x.admin_id || x.content_admin) ? 1 : 0),
        0
      );

      const conversation = [];
      arr.forEach((x) => {
        const timeStr = new Date(x.created_at).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        if (x.content) {
          conversation.push({
            text: x.content,
            sender: 'user',
            date: timeStr,
            read: x.status === 'read',
          });
        }

        if (x.admin_id || x.content_admin) {
          conversation.push({
            text: x.content_admin || x.content,
            sender: 'admin',
            date: timeStr,
            read: x.status === 'read',
          });
        }
      });

      return {
        id: last.id,
        groupKey,
        messageIds: arr.map((x) => x.id),
        user_id: last.user_id,
        avatar_url: last.avatar_url,
        name: last.name || arr[0].name || 'Utilisateur anonyme',
        email: last.email || arr[0].email || 'Sans email',
        created_at: last.created_at,
        date: new Date(last.created_at).toLocaleDateString('fr-FR'),
        lastMessage: (last.content_admin || last.content || '').substring(0, 50) + '...',
        unread: unreadTotal,
        online: false,
        subject: last.subject,
        priority: last.priority,
        status: last.status,
        conversation,
      };
    });

    conversations.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return conversations;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await messageServices.getAllMessages();

        const transformed = data.map((msg) => ({
          id: msg.message_id,
          avatar_url: msg.avatar_url,
          user_id: msg.user_id,
          admin_id: msg.admin_id,
          name: msg.name || 'Utilisateur anonyme',
          email: msg.email || 'Sans email',
          created_at: msg.created_at,
          date: new Date(msg.created_at).toLocaleDateString('fr-FR'),
          lastMessage: (msg.content_admin || msg.content || '').substring(0, 50) + '...',
          unread: msg.status === 'unread' ? 1 : 0,
          online: false,
          subject: msg.subject,
          content: msg.content,
          content_admin: msg.content_admin,
          priority: msg.priority,
          status: msg.status,
          assigned_to: msg.assigned_to,
        }));

        const conversations = aggregateConversations(transformed);
        setMessages(conversations);

        if (conversations.length > 0) {
          setSelectedMessage(conversations[0]);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedMessage) return;

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const adminId = getCurrentUserId();

      const email =
        selectedMessage?.email && selectedMessage.email.toLowerCase() !== 'sans email'
          ? selectedMessage.email
          : undefined;

      await messageServices.updateMessage(selectedMessage.id, {
        admin_id: adminId,
        content_admin: newMessage,
        status: 'read',
        assigned_to: adminId || selectedMessage.assigned_to || null,
        email,
        name: selectedMessage?.name || 'Utilisateur',
        subject: selectedMessage?.subject || 'Réponse à votre message',
      });

      const newMessageObj = {
        text: newMessage,
        sender: 'admin',
        date: timeStr,
        read: true,
      };

      const updatedConversation = [...(selectedMessage.conversation || []), newMessageObj];

      const updatedMessage = {
        ...selectedMessage,
        conversation: updatedConversation,
        lastMessage: newMessage,
        date: now.toLocaleDateString('fr-FR'),
        status: 'read',
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === selectedMessage.id ? updatedMessage : msg))
      );

      setSelectedMessage(updatedMessage);
      setNewMessage('');

      setStatus({
        type: 'success',
        message: 'Réponse enregistrée et email envoyé',
      });
    } catch (err) {
      console.error('Erreur:', err);
      setStatus({
        type: 'error',
        message: "Impossible d'envoyer la réponse",
      });
    }
  };

  const handleSelectMessage = async (msg) => {
    try {
      if (msg.unread > 0 && Array.isArray(msg.messageIds) && msg.messageIds.length > 0) {
        await Promise.all(
          msg.messageIds.map((id) => messageServices.updateMessage(id, { status: 'read' }))
        );

        setMessages((prev) =>
          prev.map((m) => (m.groupKey === msg.groupKey ? { ...m, unread: 0, status: 'read' } : m))
        );
      }
      setSelectedMessage(msg);
    } catch (err) {
      console.error('Erreur:', err);
      setSelectedMessage(msg);
    }
  };

  const handleDeleteMessage = async (conversation) => {
    try {
      const ids = Array.isArray(conversation.messageIds) ? conversation.messageIds : [];
      if (ids.length === 0) return;

      for (const id of ids) {
        await messageServices.deleteMessage(id);
      }

      setMessages((prev) => prev.filter((m) => m.groupKey !== conversation.groupKey));

      setSelectedMessage((prevSel) => {
        if (!prevSel || prevSel.groupKey !== conversation.groupKey) return prevSel;
        return prevSel && messages.length > 1
          ? messages.find((m) => m.groupKey !== conversation.groupKey) || null
          : null;
      });
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de supprimer');
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.name?.toLowerCase() || '').includes((search || '').toLowerCase()) ||
      (msg.email?.toLowerCase() || '').includes((search || '').toLowerCase())
  );

  const totalUnread = messages.reduce((acc, msg) => acc + msg.unread, 0);

  if (loading) {
    return (
      <div className="light-loading">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="light-error">
        <div className="alert alert-danger">
          <h5>Erreur de connexion</h5>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="light-messages-container">
      {/* Header */}
      <div className="messages-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Messages</h1>
            <p className="header-subtitle">Centre de messagerie professionnelle</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <IoMdMail />
              <span>{messages.length} conversations</span>
            </div>
            {totalUnread > 0 && (
              <div className="stat-badge unread">
                <IoMdNotifications />
                <span>
                  {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="messages-grid">
        {/* Liste des conversations */}
        <div className="conversations-panel">
          <div className="panel-header">
            <h3>Conversations</h3>
          </div>

          <div className="search-box">
            <IoMdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent text-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="conversations-list">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`conversation-item ${selectedMessage?.id === msg.id ? 'active' : ''}`}
                onClick={() => handleSelectMessage(msg)}
              >
                <div className="conversation-avatar">
                  {msg.avatar_url ? (
                    <img src={msg.avatar_url} alt={msg.name} className="w-100 h-100 objectif-fit-cover" />
                  ) : (
                    msg.name?.charAt(0) || '?'
                  )}
                  {msg.online && <span className="online-badge"></span>}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-name">{msg.name}</span>
                    <span className="conversation-time">{msg.date}</span>
                  </div>
                  <p className="conversation-preview">{msg.lastMessage}</p>
                </div>
                <div className="conversation-meta">
                  {msg.unread > 0 && <span className="unread-badge">{msg.unread}</span>}
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(msg);
                    }}
                  >
                    <IoMdTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-user-info">
              <div className="chat-avatar">
                {selectedMessage?.name?.charAt(0) || '?'}
                {selectedMessage?.online && <span className="online-badge"></span>}
              </div>
              <div>
                <h4>{selectedMessage?.name || 'Sélectionnez une conversation'}</h4>
                <span className="status-text">
                  {selectedMessage?.online ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
            <button
              className={`btn-icon ${showInfo ? 'active' : ''}`}
              onClick={() => setShowInfo(!showInfo)}
            >
              <IoMdInformationCircle size={22} />
            </button>
          </div>

          <div className="chat-messages shadow-none">
            {selectedMessage?.conversation?.length > 0 ? (
              selectedMessage.conversation.map((c, idx) => (
                <div
                  key={idx}
                  className={`message-bubble  ${c.sender === 'admin' ? 'sent shadow-none ' : 'received shadow-none'}`}
                >
                  <div className="bubble-content">
                    <p>{c.text}</p>
                    <div className="bubble-meta">
                      <span className="bubble-time">{c.date}</span>
                      {c.sender === 'admin' && (
                        <IoMdCheckmarkCircle className={c.read ? 'read' : 'unread'} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-chat">
                <IoMdChatbubbles size={64} />
                <h5>Aucun message</h5>
                <p>Commencez une conversation</p>
              </div>
            )}
          </div>

          <div className="chat-input">
            <div className="input-wrapper">
              <textarea
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                rows={1}
              />
              <button className="btn-emoji" onClick={() => setShowPicker(!showPicker)}>
                <IoMdHappy size={20} />
              </button>
              {showPicker && (
                <div className="emoji-picker-wrapper">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
            <button className="btn-send" onClick={handleSend}>
              <IoMdSend size={20} />
              <span>Envoyer</span>
            </button>
          </div>
        </div>

        {/* Panneau d'informations */}
        {showInfo && selectedMessage && (
          <div className="info-panel">
            <div className="panel-header">
              <h3>Informations</h3>
              <button className="btn-icon" onClick={() => setShowInfo(false)}>
                <IoMdClose size={20} />
              </button>
            </div>

            <div className="user-profile">
              <div className="profile-avatar">{selectedMessage.name.charAt(0)}</div>
              <h4>{selectedMessage.name}</h4>
              <p>{selectedMessage.email}</p>
              <span className={`status-badge ${selectedMessage.online ? 'online' : 'offline'}`}>
                {selectedMessage.online ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>

            <div className="info-actions">
              <button className="action-btn">
                <IoMdPerson size={18} />
                Voir le profil
              </button>
              <button className="action-btn">
                <IoMdStar size={18} />
                Favori
              </button>
              <button className="action-btn">
                <IoMdArchive size={18} />
                Archiver
              </button>
              <button className="action-btn danger">
                <IoMdTrash size={18} />
                Supprimer
              </button>
            </div>

            <div className="info-stats">
              <h5>Statistiques</h5>
              <div className="stat-row">
                <span>Messages envoyés</span>
                <strong>
                  {selectedMessage.conversation?.filter((c) => c.sender === 'user').length || 0}
                </strong>
              </div>
              <div className="stat-row">
                <span>Messages reçus</span>
                <strong>
                  {selectedMessage.conversation?.filter((c) => c.sender === 'admin').length || 0}
                </strong>
              </div>
              <div className="stat-row">
                <span>Dernier message</span>
                <strong>{selectedMessage.date}</strong>
              </div>
            </div>

            {isAdmin && (
              <div className="email-form">
                <h5>Envoi email direct</h5>
                <input
                  type="email"
                  placeholder="Email destinataire"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Sujet"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                />
                <textarea
                  rows={3}
                  placeholder="Votre message..."
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                />
                <button
                  className="btn-primary-full"
                  onClick={handleSendTestEmail}
                  disabled={testLoading}
                >
                  {testLoading ? 'Envoi...' : 'Envoyer'}
                </button>
                {testStatus && (
                  <div className={`status-message ${testStatus.type}`}>{testStatus.message}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
