import { useEffect, useMemo, useState } from 'react';
import {
  FaUserShield,
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSearch,
  FaSpinner,
  FaSyncAlt,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaCheckCircle,
  FaBan,
} from 'react-icons/fa';
import commentServices from '../../../../../configurations/Services/commentServices.js';
import { jwtDecode } from 'jwt-decode';

export default function Comment() {
  const token = localStorage.getItem('token');
  let payload = null;

  try {
    if (token) {
      payload = jwtDecode(token);
    }
  } catch (err) {
    console.error('Erreur décodage JWT:', err);
  }

  const currentUserId = payload?.user_id;
  const storedRole = payload?.role || localStorage.getItem('role');
  const isAdmin = storedRole === 'admin';

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const clearSelection = () => setSelectedIds(new Set());

  const bulkApprove = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => commentServices.updateComment(id, { is_approved: 1 }))
      );
      setComments((prev) =>
        prev.map((c) => (selectedIds.has(c.comment_id) ? { ...c, is_approved: 1 } : c))
      );
      clearSelection();
    } catch (err) {
      console.error('Bulk approve error:', err);
      alert('Erreur lors de l\'approbation groupée');
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDisapprove = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => commentServices.updateComment(id, { is_approved: 0 }))
      );
      setComments((prev) =>
        prev.map((c) => (selectedIds.has(c.comment_id) ? { ...c, is_approved: 0 } : c))
      );
      clearSelection();
    } catch (err) {
      console.error('Bulk disapprove error:', err);
      alert('Erreur lors de la désapprobation groupée');
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkShow = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => commentServices.updateComment(id, { is_visible: 1 }))
      );
      setComments((prev) =>
        prev.map((c) => (selectedIds.has(c.comment_id) ? { ...c, is_visible: 1 } : c))
      );
      clearSelection();
    } catch (err) {
      console.error('Bulk show error:', err);
      alert('Erreur lors de l\'affichage groupé');
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkHide = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        [...selectedIds].map((id) => commentServices.updateComment(id, { is_visible: 0 }))
      );
      setComments((prev) =>
        prev.map((c) => (selectedIds.has(c.comment_id) ? { ...c, is_visible: 0 } : c))
      );
      clearSelection();
    } catch (err) {
      console.error('Bulk hide error:', err);
      alert('Erreur lors du masquage groupé');
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Supprimer ${selectedIds.size} commentaires ?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map((id) => commentServices.deleteComment(id)));
      setComments((prev) => prev.filter((c) => !selectedIds.has(c.comment_id)));
      clearSelection();
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Erreur lors de la suppression groupée');
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        filteredComments.forEach((c) => next.delete(c.comment_id));
      } else {
        filteredComments.forEach((c) => next.add(c.comment_id));
      }
      return next;
    });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState('all');
  const [filterVisible, setFilterVisible] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredComments = useMemo(() => {
    const list = Array.isArray(comments) ? comments : [];
    const term = (searchTerm || '').toLowerCase();

    const filtered = list.filter((c) => {
      const isApproved = Number(c.is_approved) === 1;
      const isVisible = Number(c.is_visible) === 1;

      if (filterApproved === 'approved' && !isApproved) return false;
      if (filterApproved === 'unapproved' && isApproved) return false;
      if (filterVisible === 'visible' && !isVisible) return false;
      if (filterVisible === 'hidden' && isVisible) return false;

      const userStr = `${c.first_name || ''} ${c.name || ''} ${c.email || ''}`.toLowerCase();
      if (term && !(c.content || '').toLowerCase().includes(term) && !userStr.includes(term)) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
  }, [comments, searchTerm, filterApproved, filterVisible, sortOrder]);

  const isAllSelected = filteredComments.length > 0 && filteredComments.every((c) => selectedIds.has(c.comment_id));

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [formData, setFormData] = useState({ content: '', is_approved: true });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetFilters = () => {
    setSearchTerm('');
    setFilterApproved('all');
    setFilterVisible('all');
    setSortOrder('newest');
  };

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await commentServices.getCommentsWithUserAndQuiz();
      const enriched = (Array.isArray(data) ? data : []).map((c) => ({
        ...c,
        is_visible: c.is_visible !== undefined ? c.is_visible : (c.is_approved ? 1 : 0),
      }));
      setComments(enriched);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Commentaires';
    fetchComments();
  }, []);

  const openAddForm = () => {
    setFormMode('add');
    setEditingId(null);
    setFormData({ content: '', is_approved: true });
    setShowForm(true);
  };

  const openEditForm = (row) => {
    setFormMode('edit');
    setEditingId(row.comment_id);
    setFormData({ content: row.content || '', is_approved: Boolean(row.is_approved) });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormMode('add');
    setEditingId(null);
    setFormData({ content: '', is_approved: true });
  };

  const handleCreate = async () => {
    if (!currentUserId) return;
    const content = formData.content.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const created = await commentServices.createComment({ user_id: currentUserId, content });
      setComments((prev) => [{ ...created, comment_id: created.comment_id || created.id || Math.random(), is_approved: 1, created_at: new Date().toISOString(), is_visible: 1 }, ...prev]);
      closeForm();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const content = formData.content.trim();
    setSubmitting(true);
    try {
      const payload = { content, is_approved: formData.is_approved ? 1 : 0 };
      const updated = await commentServices.updateComment(editingId, payload);
      setComments((prev) => prev.map((c) => c.comment_id === editingId ? { ...c, ...updated, content, is_approved: payload.is_approved } : c));
      closeForm();
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    try {
      await commentServices.deleteComment(row.comment_id);
      setComments((prev) => prev.filter((c) => c.comment_id !== row.comment_id));
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || 'Erreur lors de la suppression');
    }
  };

  const toggleVisible = async (row) => {
    try {
      const next = row.is_visible ? 0 : 1;
      await commentServices.updateComment(row.comment_id, { is_visible: next });
      setComments((prev) => prev.map((c) => c.comment_id === row.comment_id ? { ...c, is_visible: next } : c));
    } catch (err) {
      alert("Erreur lors du changement de visibilité");
    }
  };

  const toggleApprove = async (row) => {
    try {
      const next = row.is_approved ? 0 : 1;
      await commentServices.updateComment(row.comment_id, { is_approved: next });
      setComments((prev) => prev.map((c) => c.comment_id === row.comment_id ? { ...c, is_approved: next } : c));
    } catch (err) {
      alert("Erreur lors de l'approbation");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Chargement des commentaires...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Commentaires</h1>
          <p className="text-slate-500 font-medium">Modérez les échanges et gérez la visibilité</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <FaPlus /> <span>Nouveau commentaire</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un commentaire ou un auteur..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/20"
              value={filterApproved}
              onChange={(e) => setFilterApproved(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="approved">Approuvés</option>
              <option value="unapproved">En attente</option>
            </select>
            <select
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/20"
              value={filterVisible}
              onChange={(e) => setFilterVisible(e.target.value)}
            >
              <option value="all">Visibilité : Toutes</option>
              <option value="visible">Visibles</option>
              <option value="hidden">Masqués</option>
            </select>
            <button
              onClick={resetFilters}
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
              title="Réinitialiser"
            >
              <FaSyncAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auteur</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contenu</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredComments.map((c) => (
                <tr key={c.comment_id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                      checked={selectedIds.has(c.comment_id)}
                      onChange={() => toggleSelect(c.comment_id)}
                    />
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm ring-2 ring-white shadow-sm">
                        {(c.first_name?.[0] || c.name?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{c.first_name} {c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 max-w-md">
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{c.content}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.is_approved ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                        {c.is_approved ? <FaCheck size={8} /> : <FaTimes size={8} />} {c.is_approved ? 'Approuvé' : 'En attente'}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.is_visible ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'}`}>
                        {c.is_visible ? <FaEye size={8} /> : <FaEyeSlash size={8} />} {c.is_visible ? 'Visible' : 'Masqué'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-slate-700">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.created_at ? new Date(c.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditForm(c)} className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all" title="Modifier"><FaEdit size={16} /></button>
                      <button onClick={() => toggleApprove(c)} className={`p-2.5 rounded-xl transition-all ${c.is_approved ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`} title={c.is_approved ? 'Désapprouver' : 'Approuver'}>
                        {c.is_approved ? <FaBan size={16} /> : <FaCheckCircle size={16} />}
                      </button>
                      {isAdmin && (
                        <button onClick={() => toggleVisible(c)} className={`p-2.5 rounded-xl transition-all ${c.is_visible ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-blue-600 hover:bg-blue-50'}`} title={c.is_visible ? 'Masquer' : 'Afficher'}>
                          {c.is_visible ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDelete(c)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Supprimer"><FaTrash size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <FaSearch size={24} />
                      </div>
                      <p className="text-slate-500 font-medium">Aucun commentaire trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-slate-900 text-white rounded-3xl shadow-2xl shadow-slate-900/40 animate-in slide-in-from-bottom-8 duration-300 z-50">
          <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">{selectedIds.size}</div>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Sélectionnés</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={bulkApprove} disabled={bulkLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">Approuver</button>
            <button onClick={bulkDisapprove} disabled={bulkLoading} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">Désapprouver</button>
            {isAdmin && (
              <>
                <button onClick={bulkShow} disabled={bulkLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">Afficher</button>
                <button onClick={bulkHide} disabled={bulkLoading} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">Masquer</button>
                <button onClick={bulkDelete} disabled={bulkLoading} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">Supprimer</button>
              </>
            )}
          </div>
          <button onClick={clearSelection} className="p-2 text-slate-400 hover:text-white transition-colors border-l border-slate-700 pl-6">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeForm}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                {formMode === 'add' ? 'Nouveau commentaire' : 'Modifier le commentaire'}
              </h3>
              <button onClick={closeForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><FaTimes /></button>
            </div>

            <div className="p-8 space-y-6">
              {formMode === 'add' && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                  <FaUser /> Auteur : Admin (ID: {currentUserId})
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Contenu du message</label>
                <textarea
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 min-h-[120px] resize-none"
                  placeholder="Écrivez le commentaire ici..."
                  value={formData.content}
                  onChange={(e) => setFormData((d) => ({ ...d, content: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer group" onClick={() => setFormData(d => ({ ...d, is_approved: !d.is_approved }))}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${formData.is_approved ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-2 border-slate-200 text-transparent'}`}>
                  <FaCheck size={12} />
                </div>
                <span className="text-sm font-bold text-slate-700">Approuver automatiquement ce commentaire</span>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-3">
              <button onClick={closeForm} className="flex-1 px-6 py-4 bg-white text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all">Annuler</button>
              <button
                onClick={formMode === 'add' ? handleCreate : handleUpdate}
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : (formMode === 'add' ? 'Publier' : 'Enregistrer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

