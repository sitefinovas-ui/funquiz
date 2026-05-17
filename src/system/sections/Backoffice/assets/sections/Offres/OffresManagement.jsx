import { useState, useEffect } from 'react';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner,
  FaCheckCircle, FaExclamationTriangle, FaLink, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import offresServices from '../../../../../configurations/Services/offresServices.js';

const EMPTY_FORM = {
  titre: '',
  description: '',
  image_url: '',
  date_debut: '',
  date_fin: '',
  statut: 'inactif',
  type: 'image',
  lien_cta: '',
};

const formatDate = (d) => d ? String(d).slice(0, 10) : '';

export default function OffresManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      setItems(await offresServices.list());
    } catch {
      setStatus({ type: 'error', message: 'Impossible de charger les offres.' });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      titre:       item.titre || '',
      description: item.description || '',
      image_url:   item.image_url || '',
      date_debut:  formatDate(item.date_debut),
      date_fin:    formatDate(item.date_fin),
      statut:      item.statut || 'inactif',
      type:        item.type || 'image',
      lien_cta:    item.lien_cta || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      if (editing) {
        await offresServices.update(editing.id, form);
        setStatus({ type: 'success', message: 'Offre mise à jour.' });
      } else {
        await offresServices.create(form);
        setStatus({ type: 'success', message: 'Offre créée.' });
      }
      setShowModal(false);
      fetchAll();
    } catch {
      setStatus({ type: 'error', message: 'Erreur lors de la sauvegarde.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await offresServices.delete(id);
      setStatus({ type: 'success', message: 'Offre supprimée.' });
      fetchAll();
    } catch {
      setStatus({ type: 'error', message: 'Erreur lors de la suppression.' });
    }
  };

  const toggleStatut = async (item) => {
    const next = item.statut === 'actif' ? 'inactif' : 'actif';
    try {
      await offresServices.update(item.id, { ...item, statut: next });
      fetchAll();
    } catch {
      setStatus({ type: 'error', message: 'Erreur lors du changement de statut.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Offres Spéciales</h1>
          <p className="text-slate-500 font-medium mt-1">Gérez les offres et leurs liens d'action</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all"
        >
          <FaPlus /> Ajouter
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {status.message}
          <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100"><FaTimes /></button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-indigo-500 text-4xl" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              {item.image_url && (
                <div className="h-36 overflow-hidden bg-gray-50">
                  <img src={item.image_url} alt={item.titre} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.titre}</h3>
                  <button onClick={() => toggleStatut(item)} className="ml-3 flex-shrink-0 text-2xl">
                    {item.statut === 'actif'
                      ? <FaToggleOn className="text-green-500" title="Actif" />
                      : <FaToggleOff className="text-gray-300" title="Inactif" />}
                  </button>
                </div>
                {item.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>}
                <div className="flex items-center gap-2 mb-3">
                  <FaLink className={item.lien_cta ? 'text-indigo-500' : 'text-gray-300'} />
                  {item.lien_cta ? (
                    <a href={item.lien_cta} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline truncate max-w-xs">
                      {item.lien_cta}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Aucun lien défini</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>{formatDate(item.date_debut)} → {formatDate(item.date_fin)}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"><FaEdit /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-2 py-16 text-center text-gray-400">Aucune offre pour l'instant.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? "Modifier l'offre" : 'Nouvelle offre'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Titre *</label>
                <input required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-gray-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-gray-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">URL Image</label>
                <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-gray-800" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FaLink className="text-indigo-500" /> Lien du bouton "Découvrir maintenant"
                </label>
                <input type="url" value={form.lien_cta} onChange={e => setForm({ ...form, lien_cta: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-indigo-200 rounded-xl bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500 text-gray-800" />
                <p className="text-xs text-gray-400">Laisse vide pour désactiver le bouton.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Date début</label>
                  <input type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-gray-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Date fin</label>
                  <input type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-gray-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Statut</label>
                  <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-gray-800">
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-gray-800">
                    <option value="image">Image</option>
                    <option value="video">Vidéo</option>
                    <option value="texte">Texte</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
