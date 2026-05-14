import './opinion.css';
import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaPen, FaTrash } from 'react-icons/fa';
import commentServices from '../../configurations/Services/commentServices';

const StarSelector = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="op-stars-pick">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`op-star-pick-btn ${(hover || value) >= s ? 'on' : ''}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      <span className="op-star-pick-label">
        {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent !'][hover || value]}
      </span>
    </div>
  );
};

const StarDisplay = ({ rating = 5 }) => (
  <div className="op-stars-row">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`op-star ${s <= rating ? 'on' : 'off'}`}>★</span>
    ))}
  </div>
);

const Opinion = ({ closePopup }) => {
  const token          = localStorage.getItem('token');
  const payload        = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const user_id_token  = payload?.user_id;

  const [isClosing,        setIsClosing]        = useState(false);
  const [formOpen,         setFormOpen]          = useState(false);
  const [opinionText,      setOpinionText]       = useState('');
  const [rating,           setRating]            = useState(5);
  const [submissionStatus, setSubmissionStatus]  = useState(null);
  const [comments,         setComments]          = useState([]);
  const [loginMessage,     setLoginMessage]      = useState('');
  const [loading,          setLoading]           = useState(false);
  const [errorMessage,     setErrorMessage]      = useState('');
  const [searchTerm,       setSearchTerm]        = useState('');

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => closePopup?.(), 260);
  };

  const deleteComment = async (commentId) => {
    try {
      await commentServices.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId));
    } catch {
      setErrorMessage('Impossible de supprimer le commentaire.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user_id_token) {
      setLoginMessage('Vous devez être connecté pour laisser un avis.');
      return;
    }
    if (!opinionText.trim()) return;
    setLoading(true);
    setErrorMessage('');
    try {
      await commentServices.createComment({ user_id: user_id_token, content: opinionText, rating });
      setSubmissionStatus('success');
      setOpinionText('');
      setRating(5);
      const updated = await commentServices.getCommentsWithUserAndQuiz();
      setComments(updated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setTimeout(() => { setFormOpen(false); setSubmissionStatus(null); }, 2000);
    } catch {
      setSubmissionStatus('error');
      setErrorMessage("L'envoi de votre avis a échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    commentServices.getCommentsWithUserAndQuiz()
      .then((data) => setComments(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))))
      .catch(() => setErrorMessage('Impossible de récupérer les avis.'));
  }, []);

  const handleToggleForm = () => {
    if (!token) { setLoginMessage('Vous devez être connecté pour laisser un avis.'); return; }
    setLoginMessage('');
    setFormOpen((v) => !v);
    setSubmissionStatus(null);
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    return text.replace(new RegExp(`(${searchTerm})`, 'gi'), '<mark class="op-mark">$1</mark>');
  };

  const approvedComments = comments
    .filter((c) => Number(c.is_approved) === 1)
    .filter((c) => {
      const t = searchTerm.toLowerCase();
      if (!t) return true;
      return (
        c.content?.toLowerCase().includes(t) ||
        c.first_name?.toLowerCase().includes(t) ||
        c.name?.toLowerCase().includes(t)
      );
    });

  const avgRating = approvedComments.length
    ? (approvedComments.reduce((sum, c) => sum + (c.rating || 5), 0) / approvedComments.length).toFixed(1)
    : null;

  return (
    <div className={`op-backdrop ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`op-popup ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>

        {/* ── HEADER ── */}
        <div className="op-header">
          <div className="op-header-left">
            <div className="op-icon-wrap">💬</div>
            <div>
              <h1 className="op-title">Avis des joueurs</h1>
              <p className="op-subtitle">Partagez votre expérience avec la communauté</p>
            </div>
          </div>
          <button onClick={handleClose} className="op-close" aria-label="Fermer">
            <FaTimes size={13} />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="op-body">

          {/* Alerts */}
          {loginMessage && (
            <div className="op-alert warn">
              <span>⚠️</span> {loginMessage}
            </div>
          )}
          {errorMessage && (
            <div className="op-alert error">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {/* Stats bar */}
          {approvedComments.length > 0 && (
            <div className="op-stats">
              <div className="op-stats-score">
                <span className="op-stats-num">{avgRating}</span>
                <div className="op-stats-right">
                  <StarDisplay rating={Math.round(parseFloat(avgRating))} />
                  <span className="op-stats-sub">{approvedComments.length} avis</span>
                </div>
              </div>
            </div>
          )}

          {/* Search + Write row */}
          <div className="op-toolbar">
            <div className="op-search">
              <FaSearch size={13} className="op-search-ico" />
              <input
                type="text"
                placeholder="Rechercher un avis ou un nom…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="op-search-clear" onClick={() => setSearchTerm('')}>
                  <FaTimes size={11} />
                </button>
              )}
            </div>
            <button
              onClick={handleToggleForm}
              className={`op-write-btn ${formOpen ? 'open' : ''}`}
            >
              <FaPen size={12} />
              {formOpen ? 'Annuler' : 'Donner mon avis'}
            </button>
          </div>

          {/* Write form */}
          {formOpen && (
            <div className="op-form">
              <p className="op-form-label">Votre note</p>
              <StarSelector value={rating} onChange={setRating} />

              <p className="op-form-label" style={{ marginTop: 16 }}>Votre avis</p>
              <div className="op-textarea-wrap">
                <textarea
                  className="op-textarea"
                  placeholder="Décrivez votre expérience avec FunQuiz…"
                  value={opinionText}
                  onChange={(e) => setOpinionText(e.target.value)}
                  maxLength={400}
                  required
                />
                <span className="op-char-count">{opinionText.length}/400</span>
              </div>

              {submissionStatus === 'success' && (
                <div className="op-feedback success">
                  ✅ Merci ! Votre avis sera visible après validation.
                </div>
              )}
              {submissionStatus === 'error' && (
                <div className="op-feedback error">❌ Une erreur est survenue.</div>
              )}

              <button
                type="button"
                className="op-submit"
                onClick={handleSubmit}
                disabled={loading || !opinionText.trim()}
              >
                {loading ? <span className="op-spinner" /> : 'Envoyer mon avis'}
              </button>
            </div>
          )}

          {/* Comments list */}
          <div className="op-list">
            {approvedComments.length === 0 ? (
              <div className="op-empty">
                <span className="op-empty-icon">💬</span>
                <p>Aucun avis pour le moment.</p>
                <span>Soyez le premier à partager votre expérience !</span>
              </div>
            ) : (
              approvedComments.map((c, idx) => (
                <div
                  key={c.comment_id}
                  className="op-card"
                  style={{ animationDelay: `${idx * 0.045}s` }}
                >
                  {/* Card header */}
                  <div className="op-card-head">
                    <div className="op-card-left">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="op-avatar" />
                      ) : (
                        <div className="op-avatar-fb">
                          {(c.first_name || c.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="op-card-name">{c.first_name} {c.name}</p>
                        <StarDisplay rating={c.rating || 5} />
                      </div>
                    </div>
                    <div className="op-card-right">
                      <time className="op-card-date">
                        {new Date(c.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </time>
                      {user_id_token === c.user_id && (
                        <button
                          className="op-del-btn"
                          onClick={() => deleteComment(c.comment_id)}
                          aria-label="Supprimer"
                        >
                          <FaTrash size={11} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review text */}
                  <p
                    className="op-card-text"
                    dangerouslySetInnerHTML={{ __html: highlightText(c.content) }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Opinion;
