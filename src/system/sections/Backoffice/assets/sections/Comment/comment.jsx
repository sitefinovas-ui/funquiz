import './comment.css';
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

  console.log('storedRole:', storedRole);

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
      alert('Error during bulk approve');
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
      alert('Error during bulk disapprove');
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
      alert('Error during bulk show');
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
      alert('Error during bulk hide');
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} comments?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all([...selectedIds].map((id) => commentServices.deleteComment(id)));
      setComments((prev) => prev.filter((c) => !selectedIds.has(c.comment_id)));
      clearSelection();
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Error during bulk delete');
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

  // États de filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [emailTerm, setEmailTerm] = useState('');
  const [filterApproved, setFilterApproved] = useState('all');
  const [filterVisible, setFilterVisible] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredComments = useMemo(() => {
    const list = Array.isArray(comments) ? comments : [];

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const term = (searchTerm || '').toLowerCase();
    const email = (emailTerm || '').toLowerCase();

    const filtered = list.filter((c) => {
      const isApproved = Number(c.is_approved) === 1;
      const isVisible = c.is_visible !== undefined ? Number(c.is_visible) === 1 : isApproved;

      if (filterApproved === 'approved' && !isApproved) return false;
      if (filterApproved === 'unapproved' && isApproved) return false;

      if (filterVisible === 'visible' && !isVisible) return false;
      if (filterVisible === 'hidden' && isVisible) return false;

      if (term && !(c.content || '').toLowerCase().includes(term)) return false;
      if (email && !(c.email || '').toLowerCase().includes(email)) return false;

      if (start || end) {
        const created = c.created_at ? new Date(c.created_at) : null;
        if (!created) return false;
        if (start && created < start) return false;
        if (end && created > end) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });

    return filtered;
  }, [
    comments,
    searchTerm,
    emailTerm,
    filterApproved,
    filterVisible,
    startDate,
    endDate,
    sortOrder,
  ]);

  const isAllSelected =
    filteredComments.length > 0 && filteredComments.every((c) => selectedIds.has(c.comment_id));

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({ content: '', is_approved: true });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const resetFilters = () => {
    setFilterApproved('all');
    setFilterVisible('all');
    setStartDate('');
    setEndDate('');
    setEmailTerm('');
    setSortOrder('newest');
  };

  // Charger les commentaires avec détails (utilisateur)
  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await commentServices.getCommentsWithUserAndQuiz();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      // Ajouter is_visible (fallback sur is_approved si absent)
      const enriched = sorted.map((c) => ({
        ...c,
        is_visible: c.is_visible !== undefined ? c.is_visible : c.is_approved ? 1 : 0,
      }));
      setComments(enriched);
    } catch (err) {
      console.error('Erreur récupération commentaires:', err);
      setError(err?.response?.data?.error || err?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Commentaires';
    fetchComments();
  }, []);

  // Ouvrir formulaire ajout
  const openAddForm = () => {
    setFormMode('add');
    setEditingId(null);
    setFormData({ content: '', is_approved: true });
    setShowForm(true);
  };

  // Ouvrir formulaire édition
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

  // Créer un commentaire
  const handleCreate = async () => {
    if (!currentUserId) {
      alert("Utilisateur non authentifié. Impossible d'ajouter un commentaire.");
      return;
    }
    const content = formData.content.trim();
    if (!content) {
      alert('Le contenu est requis.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { user_id: currentUserId, content };
      const created = await commentServices.createComment(payload);
      // Ajout optimiste
      setComments((prev) => [
        {
          ...created,
          comment_id: created.comment_id || created.id || Math.random(),
          is_approved: 1,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      closeForm();
    } catch (err) {
      console.error('Erreur création commentaire:', err);
      alert(err?.response?.data?.error || err?.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  // Mettre à jour un commentaire
  const handleUpdate = async () => {
    if (!editingId) return;
    const content = formData.content.trim();
    if (!content && formData.is_approved === undefined) {
      alert('Au moins un champ doit être fourni.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { content, is_approved: formData.is_approved ? 1 : 0 };
      const updated = await commentServices.updateComment(editingId, payload);
      setComments((prev) =>
        prev.map((c) =>
          c.comment_id === editingId
            ? { ...c, ...updated, content, is_approved: payload.is_approved }
            : c
        )
      );
      closeForm();
    } catch (err) {
      console.error('Erreur mise à jour commentaire:', err);
      alert(err?.response?.data?.error || err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un commentaire
  const handleDelete = async (row) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    try {
      await commentServices.deleteComment(row.comment_id);
      setComments((prev) => prev.filter((c) => c.comment_id !== row.comment_id));
    } catch (err) {
      console.error('Erreur suppression commentaire:', err);
      alert(err?.response?.data?.error || err?.message || 'Erreur lors de la suppression');
    }
  };

  const toggleVisible = async (row) => {
    try {
      const next = row.is_visible ? 0 : 1;
      const updated = await commentServices.updateComment(row.comment_id, { is_visible: next });
      setComments((prev) =>
        prev.map((c) =>
          c.comment_id === row.comment_id ? { ...c, ...updated, is_visible: next } : c
        )
      );
    } catch (err) {
      console.error('Erreur visibilité:', err);
      alert(err?.response?.data?.error || err?.message || "Impossible d'actualiser la visibilité");
    }
  };

  // Toggle approbation
  const toggleApprove = async (row) => {
    try {
      const next = row.is_approved ? 0 : 1;
      const updated = await commentServices.updateComment(row.comment_id, { is_approved: next });
      setComments((prev) =>
        prev.map((c) =>
          c.comment_id === row.comment_id ? { ...c, ...updated, is_approved: next } : c
        )
      );
    } catch (err) {
      console.error('Erreur approbation:', err);
      alert(err?.response?.data?.error || err?.message || "Impossible d'actualiser l'approbation");
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
        <h2 className="mb-0 text-dark">Gestion des commentaires</h2>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAddForm}>
          <FaPlus /> <span>Ajouter</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-3 bg-white rounded-4 justify-content-between d-flex flex-column flex-md-row align-items-stretch align-items-md-center p-4 gap-2">
        <div
          className="input-grou d-flex flex-row border border-secondary border-opacity-50 rounded-4 overflow-hidden"
          style={{ width: '100%', maxWidth: '520px' }}
        >
          <span className="input-group-text rounded-0 ">
            <FaSearch color='#000' />
          </span>
          <input
            type="text"
            className="p-3 w-100 border-0 rounded-0 is-valid-custom"
            placeholder="Rechercher par contenu ou utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline-secondary" onClick={fetchComments}>
          Actualiser
        </button>
      </div>

      

      {showForm && (
        <div className="card mb-3 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">
                {formMode === 'add' ? 'Ajouter un commentaire' : 'Modifier le commentaire'}
              </h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={closeForm}>
                Fermer
              </button>
            </div>

            {formMode === 'add' && (
              <div className="alert alert-info py-2">
                Le commentaire sera créé pour votre utilisateur (ID: {currentUserId || 'inconnu'}).
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Contenu</label>
              <textarea
                className="form-control-custom rounded-2"
                rows={3}
                value={formData.content}
                onChange={(e) => setFormData((d) => ({ ...d, content: e.target.value }))}
              />
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="isApproved"
                checked={formData.is_approved}
                onChange={(e) => setFormData((d) => ({ ...d, is_approved: e.target.checked }))}
              />
              <label className="form-check-label" htmlFor="isApproved">
                Approuvé
              </label>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {formMode === 'add' ? (
                <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
                  {submitting ? <FaSpinner className="spin" /> : 'Créer'}
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleUpdate} disabled={submitting}>
                  {submitting ? <FaSpinner className="spin" /> : 'Enregistrer'}
                </button>
              )}
              <button
                className="btn btn-outline-secondary"
                onClick={closeForm}
                disabled={submitting}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <span className="text-light">{selectedIds.size} sélectionné(s)</span>
          <button className="btn btn-success btn-sm" onClick={bulkApprove} disabled={bulkLoading}>
            Approuver
          </button>
          <button
            className="btn btn-warning btn-sm"
            onClick={bulkDisapprove}
            disabled={bulkLoading}
          >
            Désapprouver
          </button>
          {isAdmin && (
            <>
              <button className="btn btn-primary btn-sm" onClick={bulkShow} disabled={bulkLoading}>
                Afficher
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={bulkHide}
                disabled={bulkLoading}
              >
                Masquer
              </button>
              <button className="btn btn-danger btn-sm" onClick={bulkDelete} disabled={bulkLoading}>
                Supprimer
              </button>
            </>
          )}
          <button
            className="btn btn-outline-light btn-sm"
            onClick={clearSelection}
            disabled={bulkLoading}
          >
            Tout désélectionner
          </button>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">
              <FaSpinner className="spin me-2" /> Chargement...
            </div>
          ) : error ? (
            <div className="p-3 alert alert-danger mb-0">{error}</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-light table-striped">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '42px' }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        aria-label="Tout sélectionner"
                      />
                    </th>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Contenu</th>
                    <th>Visible</th>
                    <th>Approuvé</th>
                    <th>Créé le</th>
                    <th style={{ width: 200 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredComments ?? comments ?? []).map((c) => (
                    <tr key={c.comment_id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.comment_id)}
                          onChange={() => toggleSelect(c.comment_id)}
                          aria-label="Sélectionner ce commentaire"
                        />
                      </td>
                      <td>
                        <div className="fw-semibold">
                          {`${c.first_name || ''} ${c.name || ''}`.trim() || '—'}
                        </div>
                        <div className="small text-muted">{c.email || ''}</div>
                      </td>
                      <td>
                        {c.role === 'admin' ? (
                          <span className="badge bg-primary d-inline-flex align-items-center gap-1">
                            <FaUserShield /> Admin
                          </span>
                        ) : c.role === 'moderator' ? (
                          <span className="badge bg-info d-inline-flex align-items-center gap-1">
                            <FaUserShield /> Moderator
                          </span>
                        ) : (
                          <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
                            <FaUser /> Utilisateur
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: 400 }}>
                        <div className="small">{c.content}</div>
                      </td>
                      <td>
                        {c.is_visible ? (
                          <span className="badge bg-success d-inline-flex align-items-center gap-1">
                            <FaCheck /> Oui
                          </span>
                        ) : (
                          <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
                            <FaTimes /> Non
                          </span>
                        )}
                      </td>
                      <td>
                        {c.is_approved ? (
                          <span className="badge bg-success d-inline-flex align-items-center gap-1">
                            <FaCheck /> Oui
                          </span>
                        ) : (
                          <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
                            <FaTimes /> Non
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="small">
                          {c.created_at ? new Date(c.created_at).toLocaleString() : '—'}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm" role="group" aria-label="Actions">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditForm(c)}
                          >
                            <FaEdit /> Modifier
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(c)}
                            >
                              <FaTrash /> Supprimer
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleApprove(c)}
                            title={c.is_approved ? 'Désapprouver' : 'Approuver'}
                          >
                            {c.is_approved ? <FaTimes /> : <FaCheck />}{' '}
                            {c.is_approved ? 'Désapr.' : 'Appr.'}
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => toggleVisible(c)}
                              title={c.is_visible ? 'Cacher' : 'Afficher'}
                            >
                              {c.is_visible ? <FaTimes /> : <FaCheck />}{' '}
                              {c.is_visible ? 'Cacher' : 'Afficher'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
