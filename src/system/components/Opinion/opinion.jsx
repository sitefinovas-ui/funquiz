import './opinion.css';
import { useState, useEffect } from 'react';
import commentServices from '../../configurations/Services/commentServices';

const Opinion = ({ closePopup }) => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const user_id_token = payload?.user_id;

  const [active, setActive] = useState(false);
  const [opinionText, setOpinionText] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [comments, setComments] = useState([]);
  const [loginMessage, setLoginMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 Supprimer un commentaire
  const deleteComment = async (commentId) => {
    try {
      await commentServices.deleteComment(commentId);
      setComments(comments.filter((comment) => comment.comment_id !== commentId));
    } catch (error) {
      console.error('❌ Erreur lors de la suppression :', error);
      setErrorMessage('Impossible de supprimer le commentaire. Réessayez.');
    }
  };

  // 🔹 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user_id_token) {
      setSubmissionStatus('error');
      setLoginMessage('⚠️ Vous devez être connecté pour donner un avis.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await commentServices.createComment({
        user_id: user_id_token,
        content: opinionText,
      });

      setSubmissionStatus('success');
      setOpinionText('');

      const updated = await commentServices.getCommentsWithUserAndQuiz();
      setComments(updated);
    } catch (error) {
      console.error('❌ Erreur lors de l’envoi :', error);
      setSubmissionStatus('error');
      setErrorMessage('⚠️ L’envoi de votre avis a échoué. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Récupération des commentaires
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentServices.getCommentsWithUserAndQuiz();
        // Trier du plus récent au plus ancien
        setComments(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (error) {
        console.error('❌ Erreur lors de la récupération :', error);
        setErrorMessage('⚠️ Impossible de récupérer les commentaires.');
      }
    };
    fetchComments();
  }, []);

  // 🔹 Toggle du formulaire
  const handleToggleForm = () => {
    if (!token) {
      setLoginMessage('⚠️ Vous devez être connecté pour donner un avis.');
      return;
    }
    setLoginMessage('');
    setActive(!active);
  };

  // 🔹 Filtrer les commentaires selon la recherche
  const filteredComments = comments.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.content.toLowerCase().includes(term) ||
      c.first_name.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term)
    );
  });

  // 🔹 Surligner le texte recherché dans le contenu
  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="opinion-backdrop">
      <div className="opinion-popup">
        {/* Bouton fermer */}
        <button onClick={closePopup} className="btn-close bg-white rounded-circle p-2"></button>

        <h1 className="opinion-title text-light">Avis des Joueurs</h1>
        {loginMessage && <p className="text-warning text-center mt-2">{loginMessage}</p>}
        {errorMessage && <p className="text-danger text-center mt-1">{errorMessage}</p>}

        {/* Recherche */}
        <div className="search-container mb-3">
          <input
            type="text"
            placeholder="Rechercher un commentaire ou un nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Toggle du formulaire */}
        <div className="toggle-form-container mb-3">
          <button onClick={handleToggleForm} className={`btn-toggle ${active ? 'active' : ''}`}>
            {active ? 'Fermer le formulaire' : 'Donner mon avis'}
          </button>
        </div>

        {/* Formulaire d’avis */}
        {active && (
          <div className="opinion-form mb-3">
            <h2 className="text-light">Laissez votre avis</h2>
            {submissionStatus === 'success' && (
              <div className="alert alert-success">✅ Merci pour votre avis !</div>
            )}
            {submissionStatus === 'error' && (
              <div className="alert alert-danger">❌ Une erreur est survenue.</div>
            )}

            <form onSubmit={handleSubmit}>
              <textarea
                className="form-control"
                placeholder="Votre avis..."
                value={opinionText}
                onChange={(e) => setOpinionText(e.target.value)}
                required
              />
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer'}
              </button>
            </form>
          </div>
        )}

        {/* Liste des commentaires */}
        <div className="comments-list mt-4">
          {filteredComments
            .filter((comment) => Number(comment.is_approved) === 1)
            .map((c) => (
              <div key={c.comment_id} className="comment-item">
                {c.avatar_url ? (
                  <img
                    src={c.avatar_url}
                    alt={`${c.first_name} ${c.name}`}
                    className="rounded-circle"
                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      fontSize: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="comment-content">
                  <div className="comment-header d-flex justify-content-between align-items-center">
                    <span className="user-name text-light fs-5">
                      {c.first_name} {c.name}
                    </span>
                    <div className="d-flex align-items-center">
                      <small className="comment-date">
                        {new Date(c.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </small>
                      {user_id_token === c.user_id && (
                        <button
                          onClick={() => deleteComment(c.comment_id)}
                          className="btn btn-sm btn-danger rounded-circle  ms-2"
                        >
                          x
                        </button>
                      )}
                    </div>
                  </div>
                  <p
                    className="comment-text text-white"
                    dangerouslySetInnerHTML={{ __html: highlightText(c.content) }}
                  ></p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Opinion;
