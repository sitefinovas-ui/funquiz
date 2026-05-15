import React, { useState, useEffect } from 'react';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner,
  FaCheckCircle, FaExclamationTriangle, FaSearch, FaFilter
} from 'react-icons/fa';
import subThematicServices from '../../../../../configurations/Services/subThematicServices.js';
import thematicService from '../../../../../configurations/Services/thematicServices.js';

const DIFFICULTY_OPTIONS = [
  { value: 'facile', label: 'Facile', color: 'bg-green-100 text-green-700' },
  { value: 'moyen', label: 'Moyen', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'difficile', label: 'Difficile', color: 'bg-red-100 text-red-700' },
];

const SubThematicManagement = () => {
  const [subThematics, setSubThematics] = useState([]);
  const [thematics, setThematics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterThematicId, setFilterThematicId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const [formData, setFormData] = useState({
    thematic_id: '',
    title: '',
    description: '',
    difficulty_level: 'moyen',
    display_order: 0,
    is_active: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsData, thematicsData] = await Promise.all([
        subThematicServices.getAll(),
        thematicService.getAllParamThematics(),
      ]);
      setSubThematics(subsData || []);
      setThematics(thematicsData || []);
    } catch {
      setStatus({ type: 'error', message: 'Impossible de charger les données.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSub(null);
    setFormData({
      thematic_id: thematics[0]?.thematic_id || '',
      title: '',
      description: '',
      difficulty_level: 'moyen',
      display_order: 0,
      is_active: 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingSub(sub);
    setFormData({
      thematic_id: sub.thematic_id || '',
      title: sub.title || '',
      description: sub.description || '',
      difficulty_level: sub.difficulty_level || 'moyen',
      display_order: sub.display_order || 0,
      is_active: sub.is_active ?? 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.thematic_id || !formData.title) {
      setStatus({ type: 'error', message: 'Thématique et titre sont requis.' });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      if (editingSub) {
        await subThematicServices.update(editingSub.sub_thematic_id, formData);
        setStatus({ type: 'success', message: 'Sous-thématique mise à jour.' });
      } else {
        await subThematicServices.create(formData);
        setStatus({ type: 'success', message: 'Sous-thématique créée.' });
      }
      setShowModal(false);
      fetchData();
    } catch {
      setStatus({ type: 'error', message: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette sous-thématique ?')) return;
    try {
      await subThematicServices.delete(id);
      setStatus({ type: 'success', message: 'Sous-thématique supprimée.' });
      fetchData();
    } catch {
      setStatus({ type: 'error', message: 'Erreur lors de la suppression.' });
    }
  };

  const filtered = subThematics.filter(s => {
    const matchSearch =
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.thematic_title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchThematic = !filterThematicId || String(s.thematic_id) === String(filterThematicId);
    return matchSearch && matchThematic;
  });

  const getDifficultyStyle = (level) =>
    DIFFICULTY_OPTIONS.find(d => d.value === level)?.color || 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterThematicId}
              onChange={(e) => setFilterThematicId(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Toutes les thématiques</option>
              {thematics.map(t => (
                <option key={t.thematic_id} value={t.thematic_id}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <FaPlus />
          Ajouter une Sous-thématique
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          status.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {status.message}
          <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100">
            <FaTimes />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-indigo-500 text-4xl mb-4" />
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {filtered.length} sous-thématique{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              Aucune sous-thématique trouvée.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700">
              {filtered.map(sub => (
                <div key={sub.sub_thematic_id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-800 dark:text-white truncate">{sub.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getDifficultyStyle(sub.difficulty_level)}`}>
                        {sub.difficulty_level}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        sub.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sub.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="text-indigo-500 font-medium">{sub.thematic_title}</span>
                      {sub.description && <span className="truncate max-w-xs">{sub.description}</span>}
                      <span>Ordre: {sub.display_order}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.sub_thematic_id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingSub ? 'Modifier la Sous-thématique' : 'Ajouter une Sous-thématique'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Thématique parente *</label>
                <select
                  required
                  value={formData.thematic_id}
                  onChange={(e) => setFormData({ ...formData, thematic_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner une thématique</option>
                  {thematics.map(t => (
                    <option key={t.thematic_id} value={t.thematic_id}>{t.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Titre *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Difficulté</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {DIFFICULTY_OPTIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sub_is_active"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sub_is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Sous-thématique active
                </label>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {editingSub ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubThematicManagement;
