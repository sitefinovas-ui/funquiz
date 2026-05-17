import { useState, useEffect } from 'react';
import {
  FaHeart, FaClock, FaFire, FaPlus, FaEdit, FaTrash,
  FaSave, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaGamepad, FaRedo, FaHourglassHalf,
} from 'react-icons/fa';
import gameConfigService from '../../../../../configurations/Services/gameConfigService.js';

const KEY_META = {
  max_hearts:       { icon: <FaHeart className="text-red-500" />,    color: 'red',    unit: 'vies' },
  vies:             { icon: <FaHeart className="text-red-500" />,    color: 'red',    unit: 'vies' },
  timer_seconds:    { icon: <FaClock className="text-blue-500" />,   color: 'blue',   unit: 'sec' },
  max_streak_bonus: { icon: <FaFire className="text-orange-500" />,  color: 'orange', unit: 'pts bonus' },
  max_replays:      { icon: <FaRedo className="text-purple-500" />,         color: 'purple', unit: 'continues' },
  cooldown_minutes: { icon: <FaHourglassHalf className="text-green-500" />, color: 'green',  unit: 'min' },
};

const colorMap = {
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
};

const EMPTY = { config_key: '', config_value: '', label: '', description: '' };

export default function GameConfigManagement() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [status,    setStatus]    = useState(null);
  const [editing,   setEditing]   = useState(null);  // { item, form }
  const [showAdd,   setShowAdd]   = useState(false);
  const [addForm,   setAddForm]   = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try { setItems(await gameConfigService.getAll()); }
    catch { setStatus({ type: 'error', message: 'Impossible de charger la configuration.' }); }
    finally { setLoading(false); }
  };

  const notify = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3500);
  };

  /* ── SAVE existing ── */
  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await gameConfigService.save(editing.item.config_key, {
        config_value: editing.form.config_value,
        label:        editing.form.label,
        description:  editing.form.description,
      });
      notify('success', 'Configuration mise à jour.');
      setEditing(null);
      fetchAll();
    } catch {
      notify('error', 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  /* ── CREATE new ── */
  const saveAdd = async () => {
    if (!addForm.config_key || addForm.config_value === '') {
      notify('error', 'Clé et valeur obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await gameConfigService.create(addForm);
      notify('success', 'Paramètre créé.');
      setShowAdd(false);
      setAddForm(EMPTY);
      fetchAll();
    } catch {
      notify('error', 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (key) => {
    if (!window.confirm(`Supprimer le paramètre "${key}" ?`)) return;
    try {
      await gameConfigService.remove(key);
      notify('success', 'Paramètre supprimé.');
      fetchAll();
    } catch {
      notify('error', 'Erreur lors de la suppression.');
    }
  };

  const getMeta = (key) => KEY_META[key] || { icon: <FaGamepad className="text-purple-500" />, color: 'purple', unit: '' };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FaGamepad className="text-indigo-500" /> Paramètres du jeu
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Configurez les règles de jeu — vies, chronomètre, bonus de série.
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setAddForm(EMPTY); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
        >
          <FaPlus /> Ajouter
        </button>
      </div>

      {/* Status */}
      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span className="flex-1">{status.message}</span>
          <button onClick={() => setStatus(null)}><FaTimes /></button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-indigo-500 text-4xl" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(item => {
            const meta   = getMeta(item.config_key);
            const colors = colorMap[meta.color] || colorMap.purple;
            const isEdit = editing?.item.config_key === item.config_key;

            return (
              <div
                key={item.config_key}
                className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                {/* Title row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="text-xl">{meta.icon}</div>
                    <div>
                      <p className={`font-bold text-sm ${colors.text}`}>{item.label || item.config_key}</p>
                      <code className="text-[10px] text-slate-400 font-mono">{item.config_key}</code>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setEditing(isEdit ? null : { item, form: { config_value: item.config_value, label: item.label, description: item.description } })}
                      className={`p-1.5 rounded-lg transition-colors ${isEdit ? 'bg-slate-200 text-slate-600' : 'text-indigo-600 hover:bg-indigo-100'}`}
                    >
                      <FaEdit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.config_key)}
                      className="p-1.5 text-red-400 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>
                </div>

                {/* Value display or edit */}
                {isEdit ? (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editing.form.config_value}
                        onChange={e => setEditing(p => ({ ...p, form: { ...p.form, config_value: e.target.value } }))}
                        className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-center text-slate-900 bg-white focus:ring-2 focus:ring-indigo-300"
                      />
                      <span className="text-xs text-slate-500">{meta.unit}</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Libellé (optionnel)"
                      value={editing.form.label}
                      onChange={e => setEditing(p => ({ ...p, form: { ...p.form, label: e.target.value } }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-300"
                    />
                    <input
                      type="text"
                      placeholder="Description (optionnel)"
                      value={editing.form.description}
                      onChange={e => setEditing(p => ({ ...p, form: { ...p.form, description: e.target.value } }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white focus:ring-2 focus:ring-indigo-300"
                    />
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setEditing(null)} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100">Annuler</button>
                      <button onClick={saveEdit} disabled={saving} className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center justify-center gap-1">
                        {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2 my-3">
                      <span className={`text-4xl font-extrabold ${colors.text}`}>{item.config_value}</span>
                      <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>{meta.unit}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2">
                      Mis à jour : {item.updated_at ? new Date(item.updated_at).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  </>
                )}
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="col-span-3 py-16 text-center text-slate-400">Aucun paramètre configuré.</div>
          )}
        </div>
      )}

      {/* ── Add modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><FaPlus className="text-indigo-500" /> Nouveau paramètre</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Clé *</label>
                <input
                  type="text"
                  placeholder="ex: max_questions"
                  value={addForm.config_key}
                  onChange={e => setAddForm(p => ({ ...p, config_key: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Valeur *</label>
                <input
                  type="text"
                  placeholder="ex: 10"
                  value={addForm.config_value}
                  onChange={e => setAddForm(p => ({ ...p, config_value: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Libellé</label>
                <input
                  type="text"
                  placeholder="ex: Nb de questions par partie"
                  value={addForm.label}
                  onChange={e => setAddForm(p => ({ ...p, label: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <input
                  type="text"
                  placeholder="Description courte"
                  value={addForm.description}
                  onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50">Annuler</button>
                <button onClick={saveAdd} disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
