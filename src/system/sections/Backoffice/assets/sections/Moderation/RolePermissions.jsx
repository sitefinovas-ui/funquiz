import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaSave, FaSpinner, FaCheckCircle, FaExclamationCircle, FaLock } from 'react-icons/fa';
import api from '../../../../../configurations/Api/api_axios.js';

const RolePermissions = () => {
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const permissionLabels = {
    users_view: "Voir les utilisateurs",
    users_edit: "Modifier les utilisateurs",
    users_delete: "Supprimer les utilisateurs",
    comments_view: "Voir les commentaires",
    comments_approve: "Approuver les commentaires",
    comments_delete: "Supprimer les commentaires",
    quiz_view: "Voir les quiz",
    quiz_edit: "Modifier les quiz",
    quiz_delete: "Supprimer les quiz",
    settings_view: "Voir les réglages système",
    settings_edit: "Modifier les réglages système",
    about_edit: "Modifier la page À propos",
    logs_view: "Voir les logs de modération"
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/permissions');
      setRoleData(res.data);
    } catch (error) {
      console.error("Erreur fetch permissions:", error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des permissions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (role, key) => {
    if (role === 'admin') return; // L'admin est intouchable
    
    setRoleData(prev => prev.map(item => {
      if (item.role === role) {
        return {
          ...item,
          permissions: {
            ...item.permissions,
            [key]: !item.permissions[key]
          }
        };
      }
      return item;
    }));
  };

  const handleSave = async (role, permissions) => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await api.put('/permissions/update', { role, permissions });
      setMessage({ type: 'success', text: `Permissions pour ${role} mises à jour !` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Erreur save permissions:", error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Gestion des Permissions</h2>
        <p className="text-slate-500 font-medium">Définissez ce que chaque rôle a le droit de voir ou de faire.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
        }`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {roleData.map((item) => (
          <div key={item.role} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  item.role === 'admin' ? 'bg-blue-600 text-white' : 
                  item.role === 'moderator' ? 'bg-purple-600 text-white' : 'bg-slate-500 text-white'
                }`}>
                  <FaShieldAlt size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rôle : {item.role}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                    {item.role === 'admin' ? 'Contrôle total du système' : 
                     item.role === 'moderator' ? 'Accès limité à la modération' : 'Accès utilisateur standard'}
                  </p>
                </div>
              </div>
              
              {item.role !== 'admin' && (
                <button
                  onClick={() => handleSave(item.role, item.permissions)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  <span>Enregistrer {item.role}</span>
                </button>
              )}
              {item.role === 'admin' && (
                <div className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-2xl cursor-not-allowed">
                  <FaLock />
                  <span>Immuable</span>
                </div>
              )}
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(item.permissions).map((key) => (
                <div 
                  key={key}
                  onClick={() => handleToggle(item.role, key)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                    item.permissions[key] 
                      ? 'bg-emerald-50 border-emerald-100' 
                      : 'bg-slate-50 border-slate-100'
                  } ${item.role === 'admin' ? 'cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wide ${
                    item.permissions[key] ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {permissionLabels[key] || key}
                  </span>
                  
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    item.permissions[key] 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                      : 'bg-white border-2 border-slate-200 text-transparent'
                  }`}>
                    <FaCheckCircle size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolePermissions;
