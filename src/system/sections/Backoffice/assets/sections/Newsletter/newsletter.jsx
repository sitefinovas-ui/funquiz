import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jwtDecode } from 'jwt-decode';
import newsletterService from '../../../../../configurations/Services/newsletterServices';
import {
  FaEnvelope,
  FaUsers,
  FaCheckCircle,
  FaTrash,
  FaSearch,
  FaFilter,
  FaPaperPlane,
  FaSyncAlt,
  FaExclamationTriangle,
  FaClock,
} from 'react-icons/fa';

const NewsletterDashboard = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    confirmed: '',
    startDate: '',
    endDate: '',
  });
  const [emailContent, setEmailContent] = useState({
    subject: '',
    content: '',
  });

  const token = localStorage.getItem('token');
  let isAdmin = false;
  try {
    if (token) {
      const payload = jwtDecode(token);
      const role = payload?.role || payload?.user?.role;
      isAdmin = role === 'admin' || role === 'moderator';
    }
  } catch (e) {
    console.warn('JWT decode failed', e);
  }

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const response = await newsletterService.searchNewsletters(filters);
      const newsletterArray = Array.isArray(response?.results) ? response.results : [];
      setNewsletters(newsletterArray);
      setError(null);
    } catch (err) {
      setError(err.message);
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadNewsletters();
    }
  }, [filters, isAdmin]);

  const handleStatusChange = async (id, confirmed) => {
    try {
      setLoading(true);
      await newsletterService.updateStatus(id, confirmed);
      await loadNewsletters();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;
    try {
      setLoading(true);
      await newsletterService.deleteNewsletter(id);
      await loadNewsletters();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!emailContent.subject || !emailContent.content) {
      setError('Le sujet et le contenu sont requis');
      return;
    }
    try {
      setLoading(true);
      await newsletterService.sendBulk(emailContent);
      setEmailContent({ subject: '', content: '' });
      setError(null);
      alert('Newsletter envoyée avec succès !');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: newsletters.length,
    confirmed: newsletters.filter(n => n.confirmed === 1).length,
    pending: newsletters.filter(n => n.confirmed !== 1).length,
  }), [newsletters]);

  if (!isAdmin) {
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Newsletter</h1>
          <p className="text-slate-500 font-medium">Gérez vos abonnés et communiquez avec votre audience</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FaEnvelope size={20} />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 leading-none">{stats.total}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Abonnés total</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
            <FaUsers size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.total}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Total</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FaCheckCircle size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.confirmed}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Confirmés</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <FaClock size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-none">{stats.pending}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">En attente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Filters */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par email..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 transition-all"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/20"
                  value={filters.confirmed}
                  onChange={(e) => setFilters({ ...filters, confirmed: e.target.value })}
                >
                  <option value="">Tous les statuts</option>
                  <option value="1">Confirmés</option>
                  <option value="0">En attente</option>
                </select>
                <input
                  type="date"
                  className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/20"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <button
                  onClick={() => setFilters({ search: '', confirmed: '', startDate: '', endDate: '' })}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                >
                  <FaSyncAlt />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Abonné</th>
                    <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date d'inscription</th>
                    <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                    <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {newsletters.map((newsletter) => (
                    <tr key={newsletter.newsletter_id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="p-6">
                        <p className="font-bold text-slate-900 leading-tight">{newsletter.email}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-bold text-slate-700">
                          {format(new Date(newsletter.created_at), 'dd MMM yyyy', { locale: fr })}
                        </p>
                      </td>
                      <td className="p-6">
                        <button
                          onClick={() => handleStatusChange(newsletter.newsletter_id, newsletter.confirmed === 1 ? 0 : 1)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${newsletter.confirmed === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}
                        >
                          {newsletter.confirmed === 1 ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                          {newsletter.confirmed === 1 ? 'Confirmé' : 'En attente'}
                        </button>
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => handleDeleteNewsletter(newsletter.newsletter_id)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {newsletters.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <FaEnvelope size={24} />
                          </div>
                          <p className="text-slate-500 font-medium">Aucun abonné trouvé</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {loading && newsletters.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 font-medium animate-pulse">
                        Chargement des données...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 sticky top-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                <FaPaperPlane size={16} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Diffuser une newsletter</h3>
            </div>

            <form onSubmit={handleSendNewsletter} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Objet</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Sujet de la campagne"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Contenu</label>
                <textarea
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-600/20 min-h-[200px] resize-none"
                  placeholder="Écrivez votre message ici..."
                  value={emailContent.content}
                  onChange={(e) => setEmailContent({ ...emailContent, content: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  disabled={loading || stats.confirmed === 0}
                >
                  {loading ? 'Envoi en cours...' : `Envoyer aux ${stats.confirmed} abonnés`}
                </button>
                {stats.confirmed === 0 && (
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-2">
                    <FaExclamationTriangle /> Aucun abonné confirmé
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-8 right-8 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300">
          <FaExclamationTriangle />
          <p className="text-xs font-bold">{error}</p>
          <button onClick={() => setError(null)} className="ml-4 p-1 hover:bg-red-100 rounded-lg transition-all">
            <FaSyncAlt />
          </button>
        </div>
      )}
    </div>
  );
};

export default NewsletterDashboard;

