import { useState, useEffect } from 'react';
import {
  FaShieldAlt, FaSave, FaSpinner, FaCheckCircle, FaExclamationCircle, FaLock,
  FaUsers, FaComments, FaQuestionCircle, FaGamepad, FaBullhorn, FaGlobeAfrica,
  FaFileAlt, FaEnvelope, FaCog, FaUserShield,
} from 'react-icons/fa';
import api from '../../../../../configurations/Api/api_axios.js';

/* ── Labels affichés pour chaque clé de permission ── */
const PERMISSION_LABELS = {
  // Utilisateurs
  users_view:             'Voir les utilisateurs',
  users_edit:             'Modifier les utilisateurs',
  users_delete:           'Supprimer les utilisateurs',
  // Commentaires
  comments_view:          'Voir les commentaires',
  comments_approve:       'Approuver les commentaires',
  comments_delete:        'Supprimer les commentaires',
  // Quiz
  quiz_view:              'Voir les quiz',
  quiz_edit:              'Modifier les quiz',
  quiz_delete:            'Supprimer les quiz',
  // Paramètres du jeu
  game_config_view:       'Voir les paramètres du jeu',
  game_config_edit:       'Modifier les paramètres du jeu',
  // Offres spéciales
  publicites_view:        'Voir les offres spéciales',
  publicites_edit:        'Modifier les offres spéciales',
  publicites_delete:      'Supprimer les offres spéciales',
  // Pays
  countries_view:         'Voir les pays',
  countries_edit:         'Modifier les pays',
  // Pages de contenu
  about_edit:             'Modifier la page À propos',
  legal_edit:             'Modifier la page Légal',
  // Messages & Newsletter
  messages_view:          'Voir les messages',
  newsletter_view:        'Voir la newsletter',
  newsletter_send:        'Envoyer la newsletter',
  // Système
  settings_view:          'Voir les réglages système',
  settings_edit:          'Modifier les réglages système',
  global_settings_view:   'Voir la configuration services',
  global_settings_edit:   'Modifier la configuration services',
  // Modération
  logs_view:              'Voir les logs de modération',
};

/* ── Groupes de permissions (ordre d'affichage) ── */
const GROUPS = [
  { id: 'users',       label: 'Utilisateurs',          icon: FaUsers,          color: 'blue',   keys: ['users_view', 'users_edit', 'users_delete'] },
  { id: 'comments',    label: 'Commentaires',           icon: FaComments,       color: 'indigo', keys: ['comments_view', 'comments_approve', 'comments_delete'] },
  { id: 'quiz',        label: 'Quiz',                   icon: FaQuestionCircle, color: 'violet', keys: ['quiz_view', 'quiz_edit', 'quiz_delete'] },
  { id: 'game',        label: 'Paramètres du jeu',      icon: FaGamepad,        color: 'purple', keys: ['game_config_view', 'game_config_edit'] },
  { id: 'publicites',  label: 'Offres spéciales',       icon: FaBullhorn,       color: 'orange', keys: ['publicites_view', 'publicites_edit', 'publicites_delete'] },
  { id: 'countries',   label: 'Pays',                   icon: FaGlobeAfrica,    color: 'green',  keys: ['countries_view', 'countries_edit'] },
  { id: 'content',     label: 'Pages de contenu',       icon: FaFileAlt,        color: 'teal',   keys: ['about_edit', 'legal_edit'] },
  { id: 'messages',    label: 'Messages & Newsletter',  icon: FaEnvelope,       color: 'sky',    keys: ['messages_view', 'newsletter_view', 'newsletter_send'] },
  { id: 'system',      label: 'Système',                icon: FaCog,            color: 'slate',  keys: ['settings_view', 'settings_edit', 'global_settings_view', 'global_settings_edit'] },
  { id: 'moderation',  label: 'Modération',             icon: FaUserShield,     color: 'red',    keys: ['logs_view'] },
];

const COLORS = {
  blue:   { section: 'bg-blue-50 border-blue-100',     label: 'text-blue-700',   badge: 'bg-blue-100 text-blue-600',     dot: 'bg-blue-500' },
  indigo: { section: 'bg-indigo-50 border-indigo-100', label: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-600', dot: 'bg-indigo-500' },
  violet: { section: 'bg-violet-50 border-violet-100', label: 'text-violet-700', badge: 'bg-violet-100 text-violet-600', dot: 'bg-violet-500' },
  purple: { section: 'bg-purple-50 border-purple-100', label: 'text-purple-700', badge: 'bg-purple-100 text-purple-600', dot: 'bg-purple-500' },
  orange: { section: 'bg-orange-50 border-orange-100', label: 'text-orange-700', badge: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' },
  green:  { section: 'bg-green-50 border-green-100',   label: 'text-green-700',  badge: 'bg-green-100 text-green-600',   dot: 'bg-green-500' },
  teal:   { section: 'bg-teal-50 border-teal-100',     label: 'text-teal-700',   badge: 'bg-teal-100 text-teal-600',     dot: 'bg-teal-500' },
  sky:    { section: 'bg-sky-50 border-sky-100',       label: 'text-sky-700',    badge: 'bg-sky-100 text-sky-600',       dot: 'bg-sky-500' },
  slate:  { section: 'bg-slate-50 border-slate-200',   label: 'text-slate-600',  badge: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  red:    { section: 'bg-red-50 border-red-100',       label: 'text-red-700',    badge: 'bg-red-100 text-red-600',       dot: 'bg-red-500' },
};

const ROLE_META = {
  admin:     { label: 'Administrateur', desc: 'Contrôle total du système',    badge: 'bg-blue-600 text-white' },
  moderator: { label: 'Modérateur',     desc: 'Accès limité à la modération', badge: 'bg-purple-600 text-white' },
  user:      { label: 'Utilisateur',    desc: 'Accès standard',               badge: 'bg-slate-500 text-white' },
};

export default function RolePermissions() {
  const [roleData, setRoleData] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(null);
  const [message,  setMessage]  = useState({ type: '', text: '' });

  useEffect(() => { fetchPermissions(); }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/permissions');
      setRoleData(res.data);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des permissions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (role, key) => {
    if (role === 'admin') return;
    setRoleData(prev => prev.map(item =>
      item.role !== role ? item : {
        ...item,
        permissions: { ...item.permissions, [key]: !item.permissions[key] },
      }
    ));
  };

  const handleSave = async (role, permissions) => {
    try {
      setSaving(role);
      setMessage({ type: '', text: '' });
      await api.put('/permissions/update', { role, permissions });
      const label = ROLE_META[role]?.label || role;
      setMessage({ type: 'success', text: `Permissions « ${label} » mises à jour.` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3500);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <FaSpinner className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-8 pb-20">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <FaShieldAlt className="text-indigo-500" /> Gestion des Permissions
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Définissez ce que chaque rôle peut voir ou faire dans le backoffice.
        </p>
      </div>

      {/* Status */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border text-sm font-semibold ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {message.text}
        </div>
      )}

      {/* Cartes par rôle */}
      {roleData.map(item => {
        const meta    = ROLE_META[item.role] || { label: item.role, desc: '', badge: 'bg-slate-500 text-white' };
        const isAdmin = item.role === 'admin';
        const isSaving = saving === item.role;
        const perms   = typeof item.permissions === 'string'
          ? JSON.parse(item.permissions)
          : item.permissions || {};

        // Clés non couvertes par GROUPS → section "Autres"
        const knownKeys  = new Set(GROUPS.flatMap(g => g.keys));
        const unknownKeys = Object.keys(perms).filter(k => !knownKeys.has(k));

        // Stats globales
        const totalKeys   = Object.keys(perms).length;
        const enabledKeys = Object.values(perms).filter(Boolean).length;

        return (
          <div key={item.role} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* En-tête du rôle */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${meta.badge}`}>
                  <FaShieldAlt size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-slate-900">{meta.label}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${meta.badge}`}>
                      {item.role}
                    </span>
                    {!isAdmin && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {enabledKeys}/{totalKeys} actives
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{meta.desc}</p>
                </div>
              </div>

              {isAdmin ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm cursor-not-allowed">
                  <FaLock size={12} /> Immuable
                </div>
              ) : (
                <button
                  onClick={() => handleSave(item.role, perms)}
                  disabled={!!saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  Enregistrer
                </button>
              )}
            </div>

            {/* Groupes de permissions */}
            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
              {GROUPS.map(group => {
                const activeKeys = group.keys.filter(k => k in perms);
                if (activeKeys.length === 0) return null;

                const IconComp   = group.icon;
                const c          = COLORS[group.color] || COLORS.slate;
                const onCount    = activeKeys.filter(k => perms[k]).length;

                return (
                  <div key={group.id} className={`rounded-xl border p-4 ${c.section}`}>
                    {/* En-tête du groupe */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.badge}`}>
                          <IconComp size={13} />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-widest ${c.label}`}>
                          {group.label}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                        {onCount}/{activeKeys.length}
                      </span>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-col gap-1.5">
                      {activeKeys.map(key => {
                        const on = !!perms[key];
                        return (
                          <button
                            key={key}
                            onClick={() => handleToggle(item.role, key)}
                            disabled={isAdmin}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left w-full transition-all ${
                              isAdmin ? 'cursor-not-allowed' : 'hover:scale-[1.01] cursor-pointer'
                            } ${on ? 'bg-white border-emerald-200 shadow-sm' : 'bg-white/50 border-transparent'}`}
                          >
                            <div className={`w-4 h-4 rounded-full shrink-0 transition-colors ${
                              on ? 'bg-emerald-500' : 'bg-slate-200'
                            }`} />
                            <span className={`text-xs font-semibold flex-1 ${
                              on ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {PERMISSION_LABELS[key] || key}
                            </span>
                            {on && <FaCheckCircle size={11} className="text-emerald-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Permissions non catégorisées */}
              {unknownKeys.length > 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Autres</p>
                  <div className="flex flex-col gap-1.5">
                    {unknownKeys.map(key => {
                      const on = !!perms[key];
                      return (
                        <button
                          key={key}
                          onClick={() => handleToggle(item.role, key)}
                          disabled={isAdmin}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left w-full transition-all ${
                            isAdmin ? 'cursor-not-allowed' : 'hover:scale-[1.01] cursor-pointer'
                          } ${on ? 'bg-white border-emerald-200 shadow-sm' : 'bg-white/50 border-transparent'}`}
                        >
                          <div className={`w-4 h-4 rounded-full shrink-0 ${on ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                          <span className={`text-xs font-semibold ${on ? 'text-slate-800' : 'text-slate-400'}`}>
                            {PERMISSION_LABELS[key] || key}
                          </span>
                          {on && <FaCheckCircle size={11} className="text-emerald-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
