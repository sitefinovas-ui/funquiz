import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaUserShield, FaHistory, FaSearch, FaFilter, FaSpinner, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../../../../configurations/Api/api_axios.js';

const ModeratorActions = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/moderator-actions');
      // Trier les actions par date décroissante (la plus récente en premier)
      const data = Array.isArray(res.data) ? res.data : [];
      setActions(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error("Erreur fetch moderator actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActions = actions.filter(action => {
    const matchSearch = (
      action.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.target_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchFilter = filterType === 'all' || action.action_type === filterType;
    return matchSearch && matchFilter;
  });

  const getActionColor = (type) => {
    if (type.includes('delete')) return 'bg-red-500';
    if (type.includes('update')) return 'bg-amber-500';
    if (type.includes('create')) return 'bg-emerald-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Actions des Modérateurs</h2>
          <p className="text-slate-500 font-medium">Historique complet des interventions de l'équipe.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une action, un modérateur..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-400 text-sm" />
            <select
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="update_user">Mise à jour utilisateur</option>
              <option value="soft_delete_user">Suppression (Soft)</option>
              <option value="hard_delete_user">Suppression (Hard)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modérateur</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cible</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <FaSpinner className="animate-spin text-blue-600 mx-auto" size={24} />
                  </td>
                </tr>
              ) : filteredActions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                    Aucune action enregistrée.
                  </td>
                </tr>
              ) : (
                filteredActions.map((action) => (
                  <tr key={action.action_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{action.first_name} {action.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{action.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider ${getActionColor(action.action_type)}`}>
                        {action.action_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 uppercase">{action.target_type}</span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: {action.target_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 max-w-xs truncate" title={action.details}>
                        {action.details}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(action.created_at).toLocaleString('fr-FR')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
          <FaExclamationTriangle size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Zone de surveillance Admin</h4>
          <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
            Cet historique est immuable et sert à garantir la transparence des actions effectuées par l'équipe de modération. 
            Seuls les administrateurs de niveau supérieur peuvent consulter ces logs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModeratorActions;
