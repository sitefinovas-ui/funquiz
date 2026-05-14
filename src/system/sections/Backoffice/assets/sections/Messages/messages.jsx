import { useState, useEffect } from 'react';
import messageServices from '../../../../../configurations/Services/messageServices.js';
import { jwtDecode } from 'jwt-decode';
import authService from '../../../../../configurations/Services/authServices.js';
import { IoMdMail } from 'react-icons/io';
import {
  FaSearch,
  FaPaperPlane,
  FaHistory,
  FaTrash,
  FaUser,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
} from 'react-icons/fa';

const Messages = () => {
  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Centre de messagerie';
  }, []);

  const token = localStorage.getItem('token');
  let decoded = null;
  try {
    decoded = token ? jwtDecode(token) : null;
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

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

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
      alert("Impossible de supprimer le message.");
    }
  };

  if (!isStaff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center shadow-lg shadow-red-600/10">
          <FaExclamationTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Accès restreint</h2>
        <p className="text-slate-500 font-medium">Vous n'avez pas les permissions nécessaires.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Messagerie</h1>
          <p className="text-slate-500 font-medium">Envoyez des messages directs par email aux membres</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <IoMdMail size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-none">{messages.length}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Messages envoyés</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                <FaPaperPlane size={16} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nouveau message</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Destinataire</label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20"
                    placeholder="Chercher un membre..."
                    value={pmSearch}
                    onChange={(e) => setPmSearch(e.target.value)}
                  />
                </div>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                  disabled={pmLoading}
                  value={pmSelectedUserId}
                  onChange={(e) => setPmSelectedUserId(e.target.value)}
                >
                  <option value="">{pmLoading ? 'Chargement...' : 'Choisir dans la liste'}</option>
                  {pmUsers
                    .filter((u) => {
                      const q = pmSearch.trim().toLowerCase();
                      return !q || `${u.name} ${u.first_name} ${u.email}`.toLowerCase().includes(q);
                    })
                    .map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.first_name} {u.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Objet</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Sujet du message"
                  value={pmSubject}
                  onChange={(e) => setPmSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Contenu</label>
                <textarea
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-600/20 min-h-[160px] resize-none"
                  placeholder="Votre message..."
                  value={pmContent}
                  onChange={(e) => setPmContent(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 px-4 py-3 bg-slate-50 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all"
                  onClick={() => { setPmSelectedUserId(''); setPmSubject(''); setPmContent(''); setPmSendStatus(null); }}
                >
                  Effacer
                </button>
                <button
                  className="flex-[2] px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  disabled={pmSendLoading || !pmSelectedUserId || !pmSubject.trim() || !pmContent.trim()}
                  onClick={async () => {
                    try {
                      setPmSendLoading(true);
                      setPmSendStatus(null);
                      const u = pmUsers.find(x => String(x.user_id) === String(pmSelectedUserId));
                      if (!u?.email) {
                        setPmSendStatus({ type: 'error', message: "Cet utilisateur n'a pas d'email." });
                        return;
                      }
                      await messageServices.sendEmail({
                        email: u.email, name: u.name, firstname: u.first_name,
                        subject: pmSubject.trim(), content: pmContent.trim()
                      });
                      setPmSendStatus({ type: 'success', message: 'Email envoyé avec succès !' });
                      setPmContent('');
                      fetchMessages();
                    } catch (e) {
                      setPmSendStatus({ type: 'error', message: e?.response?.data?.error || e?.message || "Erreur d'envoi" });
                    } finally {
                      setPmSendLoading(false);
                    }
                  }}
                >
                  {pmSendLoading ? <FaSpinner className="animate-spin mx-auto" /> : 'Envoyer le message'}
                </button>
              </div>

              {pmSendStatus && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${pmSendStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {pmSendStatus.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  <p className="text-xs font-bold leading-tight">{pmSendStatus.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                <FaHistory size={16} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Historique</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Archives des emails envoyés</p>
              </div>
            </div>
            <button onClick={fetchMessages} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <FaSyncAlt className={loadingMessages ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sujet & Contenu</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {messages.map((msg) => (
                  <tr key={msg.message_id || msg.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-700">
                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-900 text-sm mb-1 leading-tight">{msg.subject || 'Sans sujet'}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 italic">"{msg.content || '—'}"</p>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => handleDeleteMessage(msg.message_id || msg.id)}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {messages.length === 0 && !loadingMessages && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <IoMdMail size={24} />
                        </div>
                        <p className="text-slate-500 font-medium">Aucun message archivé</p>
                      </div>
                    </td>
                  </tr>
                )}
                {loadingMessages && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center">
                      <FaSpinner className="animate-spin text-blue-600 mx-auto" size={24} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
