import { useState, useEffect } from 'react';
import messageServices from '../../../../../configurations/Services/messageServices.js';
import { jwtDecode } from 'jwt-decode';
import authService from '../../../../../configurations/Services/authServices.js';
import './messages.css';

import { IoMdMail } from 'react-icons/io';

const Messages = () => {
  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Centre de messagerie';
  }, []);

  const role = localStorage.getItem('token');
  let decoded = null;
  try {
    decoded = role ? jwtDecode(role) : null;
  } catch {
    decoded = null;
  }
  const isStaff = decoded?.role === 'admin' || decoded?.role === 'moderator';

  const [pmUsers, setPmUsers] = useState([]);
  const [pmSearch, setPmSearch] = useState('');
  const [pmLoading, setPmLoading] = useState(false);
  const [pmSelectedUserId, setPmSelectedUserId] = useState('');
  const [pmSubject, setPmSubject] = useState('');
  const [pmContent, setPmContent] = useState('');
  const [pmSendLoading, setPmSendLoading] = useState(false);
  const [pmSendStatus, setPmSendStatus] = useState(null);

  // Historique
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Récupérer les messages et utilisateurs au chargement
  useEffect(() => {
    if (!isStaff) return;
    fetchMessages();
    fetchUsers();
  }, [isStaff]);

  const fetchUsers = async () => {
    try {
      setPmLoading(true);
      const list = await authService.getAllUsers();
      const onlyUsers = (Array.isArray(list) ? list : []).filter((u) => u?.role === 'user');
      setPmUsers(onlyUsers);
    } catch {
      setPmUsers([]);
    } finally {
      setPmLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const data = await messageServices.getAllMessages();
      // On suppose que data est un tableau de messages
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      await messageServices.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => (m.message_id || m.id) !== id));
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert("Impossible de supprimer le message.");
    }
  };

  return (
    <div className="light-messages-container">
      {/* Header */}
      <div className="messages-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Messages</h1>
            <p className="header-subtitle">Envoi direct d’emails aux utilisateurs</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <IoMdMail />
              <span>Email</span>
            </div>
          </div>
        </div>
      </div>

      {isStaff && (
        <>
          <div className="conversations-panel" style={{ maxWidth: 980, margin: '0 auto 1.5rem auto' }}>
            <div className="panel-header">
              <h3>Nouveau message (Email)</h3>
              <span className="box-subtitle">Envoi direct</span>
            </div>
            <div style={{ padding: '1rem 1.2rem' }}>
              <div className="row g-2">
              <div className="col-12 col-lg-5">
                <input
                  className="form-control text-dark"
                  placeholder="Rechercher un utilisateur..."
                  value={pmSearch}
                  onChange={(e) => setPmSearch(e.target.value)}
                />
              </div>
              <div className="col-12 col-lg-7">
                <select
                  className="form-select text-dark"
                  disabled={pmLoading}
                  value={pmSelectedUserId}
                  onChange={(e) => setPmSelectedUserId(e.target.value)}
                >
                  <option value="">
                    {pmLoading ? 'Chargement...' : 'Choisir un utilisateur'}
                  </option>
                  {pmUsers
                    .filter((u) => {
                      const q = pmSearch.trim().toLowerCase();
                      if (!q) return true;
                      return `${u.name || ''} ${u.first_name || ''} ${u.email || ''}`
                        .toLowerCase()
                        .includes(q);
                    })
                    .map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.name || '—'} {u.first_name || ''} ({u.email || 'sans email'})
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-12">
                <input
                  className="form-control text-dark"
                  placeholder="Sujet"
                  value={pmSubject}
                  onChange={(e) => setPmSubject(e.target.value)}
                />
              </div>
              <div className="col-12">
                <textarea
                  className="form-control text-dark"
                  placeholder="Votre message..."
                  rows={4}
                  value={pmContent}
                  onChange={(e) => setPmContent(e.target.value)}
                />
              </div>
              <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => {
                    setPmSelectedUserId('');
                    setPmSubject('');
                    setPmContent('');
                    setPmSendStatus(null);
                  }}
                  disabled={pmSendLoading}
                >
                  Effacer
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    pmSendLoading || !pmSelectedUserId || !pmSubject.trim() || !pmContent.trim()
                  }
                  onClick={async () => {
                    try {
                      setPmSendLoading(true);
                      setPmSendStatus(null);
                      const u = pmUsers.find(
                        (x) => String(x.user_id) === String(pmSelectedUserId)
                      );
                      const email = u?.email;
                      if (!email) {
                        setPmSendStatus({
                          type: 'error',
                          message: "Cet utilisateur n'a pas d'email.",
                        });
                        return;
                      }
                      await messageServices.sendEmail({
                        email,
                        name: u?.name || 'Utilisateur',
                        firstname: u?.first_name || '',
                        subject: pmSubject.trim(),
                        content: pmContent.trim(),
                      });
                      setPmSendStatus({ type: 'success', message: 'Email envoyé.' });
                      setPmContent('');
                    } catch (e) {
                      const msg =
                        e?.response?.data?.error || e?.message || "Erreur lors de l'envoi";
                      setPmSendStatus({ type: 'error', message: msg });
                    } finally {
                      setPmSendLoading(false);
                    }
                  }}
                >
                  {pmSendLoading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
              {pmSendStatus?.message && (
                <div className="col-12">
                  <div
                    className={`alert ${
                      pmSendStatus.type === 'success' ? 'alert-success' : 'alert-danger'
                    } mb-0`}
                  >
                    {pmSendStatus.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historique des messages */}
        <div className="conversations-panel" style={{ maxWidth: 980, margin: '0 auto 1.5rem auto' }}>
          <div className="panel-header">
            <h3>Historique des messages</h3>
            <span className="box-subtitle">{messages.length} message(s)</span>
          </div>
          <div style={{ padding: '0' }}>
            {loadingMessages ? (
              <div className="p-4 text-center text-muted">Chargement...</div>
            ) : messages.length === 0 ? (
              <div className="p-4 text-center text-muted">Aucun message trouvé.</div>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0 messages-table table-hover">
                  <thead>
                    <tr>
                      <th className="px-3">Date</th>
                      <th className="px-3">Sujet</th>
                      <th className="px-3">Contenu</th>
                      <th className="px-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.message_id || msg.id}>
                        <td className="px-3">
                          {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : '—'}
                          <small className="d-block text-muted">
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                          </small>
                        </td>
                        <td className="px-3" style={{ maxWidth: '200px' }}>
                          <div className="fw-medium text-truncate" title={msg.subject}>{msg.subject || 'Sans sujet'}</div>
                        </td>
                         <td className="px-3" style={{ maxWidth: '300px' }}>
                          <div className="text-muted text-truncate" title={msg.content}>{msg.content || '—'}</div>
                        </td>
                        <td className="px-3 text-end">
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteMessage(msg.message_id || msg.id)}
                            title="Supprimer"
                          >
                             <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default Messages;
