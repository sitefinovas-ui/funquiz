// En-tête du fichier NewsletterDashboard
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jwtDecode } from 'jwt-decode';
import newsletterService from '../../../../../configurations/Services/newsletterServices';
import './Newsletter.css';

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

  // Chargement des newsletters avec filtres
  const loadNewsletters = async () => {
    try {
      setLoading(true);
      console.log('Envoi des filtres:', filters);
      const response = await newsletterService.searchNewsletters(filters);
      console.log('Réponse du serveur:', response);
      // S'assurer que newsletters est toujours un tableau
      const newsletterArray = Array.isArray(response?.results) ? response.results : [];
      console.log('Tableau de newsletters:', newsletterArray);
      setNewsletters(newsletterArray);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur chargement newsletters:', err);
      setNewsletters([]); // Réinitialiser à un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadNewsletters();
    }
  }, [filters, isAdmin]);

  // Mise à jour du statut confirmed
  const handleStatusChange = async (id, confirmed) => {
    try {
      setLoading(true);
      await newsletterService.updateStatus(id, confirmed);
      await loadNewsletters();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur changement statut:', err);
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un abonné
  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      return;
    }

    try {
      setLoading(true);
      await newsletterService.deleteNewsletter(id);
      await loadNewsletters();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur suppression newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  // Envoi d'une newsletter
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
    } catch (err) {
      setError(err.message);
      console.error('Erreur envoi newsletter:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div className="alert alert-danger">Accès non autorisé</div>;
  }

  if (loading && !newsletters.length) {
    return <div className="alert alert-info">Chargement...</div>;
  }

  return (
    <div className="newsletter-dashboard">
      {/* Filtres */}
      <div className="filters-section card p-3 mb-4">
        <h5 className="text-dark">Filtres</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control-custom"
              placeholder="Rechercher par email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select border text-dark"
              value={filters.confirmed}
              onChange={(e) => setFilters({ ...filters, confirmed: e.target.value })}
            >
              <option value="">Tous les statuts</option>
              <option value="1">Confirmés</option>
              <option value="0">Non confirmés</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control-custom"
              placeholder="Date début"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control-custom"
              placeholder="Date fin"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Liste des abonnés */}
      <div className="subscribers-section card p-3 mb-4">
        <h5>Abonnés ({newsletters.length})</h5>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Date d'inscription</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {newsletters.map((newsletter) => (
                <tr className="border-0" key={newsletter.newsletter_id}>
                  <td>{newsletter.email}</td>
                  <td>{format(new Date(newsletter.created_at), 'dd MMMM yyyy', { locale: fr })}</td>
                  <td>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newsletter.confirmed === 1}
                        onChange={() =>
                          handleStatusChange(
                            newsletter.newsletter_id,
                            newsletter.confirmed === 1 ? 0 : 1
                          )
                        }
                      />
                      <label className="form-check-label">
                        {newsletter.confirmed === 1 ? 'Confirmé' : 'Non confirmé'}
                      </label>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteNewsletter(newsletter.newsletter_id)}
                      disabled={loading}
                    >
                      {loading ? '...' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
              {!newsletters.length && !loading && (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    Aucun abonné trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulaire d'envoi */}
      <div className="send-section card p-3">
        <h5>Envoyer une newsletter</h5>
        <form onSubmit={handleSendNewsletter}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control-custom "
              placeholder="Sujet"
              value={emailContent.subject}
              onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <textarea
              className="form-control-custom rounded-3 h-100"
              rows="5"
              placeholder="Contenu"
              value={emailContent.content}
              onChange={(e) => setEmailContent({ ...emailContent, content: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !newsletters.some((n) => n.confirmed === 1)}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer aux abonnés confirmés'}
          </button>
          {!newsletters.some((n) => n.confirmed === 1) && (
            <small className="text-muted d-block mt-2">
              Aucun abonné confirmé disponible pour l'envoi
            </small>
          )}
        </form>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default NewsletterDashboard;
