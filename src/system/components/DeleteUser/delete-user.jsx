import { useState } from 'react';
import { usePopup } from '../../configurations/Context/PopupContext.jsx';
import authServices from '../../configurations/Services/authServices.js';
import { useNavigate } from 'react-router-dom';

const DeleteSurvey = ({ userId }) => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const user_id_token = payload?.user_id;

  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closePopup } = usePopup();

  const reasons = [
    { value: 'utilite', label: "Je n'en ai plus l'utilité" },
    { value: 'bugs', label: 'Trop de bugs ou problèmes techniques' },
    { value: 'experience', label: 'Expérience utilisateur décevante' },
    { value: 'prix', label: 'Coût trop élevé' },
    { value: 'fonctionnalites', label: 'Fonctionnalités insuffisantes' },
    { value: 'concurrence', label: "J'ai trouvé une meilleure alternative" },
    { value: 'autre', label: 'Autre raison' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checked) return;
    if (!reason) {
      alert('Veuillez sélectionner une raison.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await authServices.deleteUserSoft({
        user_id: user_id_token,
        reason,
        comment,
      });
      alert(data.message || 'Votre compte a été supprimé avec succès.');
      closePopup();
      navigate('/');
      localStorage.removeItem('token');
      window.location.reload();
    } catch (error) {
      alert('Impossible de supprimer le compte : ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" />
      <div className="modal-container">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <div className="header-icon">⚠️</div>
            <div className="header-text">
              <h2>Suppression de compte</h2>
              <p>Cette action est définitive et irréversible</p>
            </div>
            <button className="close-btn" onClick={closePopup}>
              ✖️
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <div className="survey-section">
              <div className="survey-intro">
                <h3>Aidez-nous à nous améliorer</h3>
                <p>
                  Vos retours nous permettent d'offrir une meilleure expérience à tous nos
                  utilisateurs.
                </p>
              </div>

              {/* Raison */}
              <div className="form-group">
                <label>Quelle est la raison principale de votre départ ?*</label>
                <div className="radio-group">
                  {reasons.map((option) => (
                    <label
                      key={option.value}
                      className={`radio-option ${reason === option.value ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={option.value}
                        checked={reason === option.value}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <span className="radio-custom" />
                      <span className="radio-text">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div className="form-group textarea-container">
                <label>Commentaire (optionnel)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Partagez vos suggestions..."
                />
                <div className="char-count">{comment.length}/500</div>
              </div>

              {/* Confirmation */}
              <div className="confirmation-section">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                  <span className="checkmark" />
                  <span className="confirmation-text">
                    Je confirme vouloir supprimer définitivement mon compte
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="actions">
                <button className="btn btn-secondary" type="button" onClick={closePopup}>
                  Annuler
                </button>
                <button
                  className={`btn btn-danger ${!checked || isSubmitting ? 'disabled' : ''}`}
                  type="button"
                  disabled={!checked || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? <span className="spinner" /> : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1001;
          animation: slideIn 0.3s ease-out;
        }

        .modal-content {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          animation: scaleIn 0.3s ease-out;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #fafafa;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: #fef2f2;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          color: #dc2626;
        }
        .header-text {
          flex: 1;
        }
        .header-text h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        .header-text p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .close-btn {
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }
        .close-btn:hover {
          background: #e5e7eb;
        }

        .modal-body {
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }

        .survey-section {
          background: #fff;
        }
        .survey-intro {
          text-align: center;
          margin-bottom: 2rem;
        }
        .survey-intro h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        .survey-intro p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .radio-option:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }
        .radio-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .radio-option input[type='radio'] {
          display: none;
        }
        .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          margin-right: 0.75rem;
          position: relative;
        }
        .radio-option.selected .radio-custom {
          border-color: #3b82f6;
          background: #3b82f6;
        }
        .radio-option.selected .radio-custom::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }
        .radio-text {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .textarea-container {
          position: relative;
        }
        .textarea-container textarea {
          width: 100%;
          min-height: 100px;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .textarea-container textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .textarea-container textarea::placeholder {
          color: #9ca3af;
        }
        .char-count {
          position: absolute;
          bottom: 0.5rem;
          right: 0.75rem;
          font-size: 0.75rem;
          color: #9ca3af;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
        }

        .confirmation-section {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .checkbox-container input[type='checkbox'] {
          display: none;
        }
        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #dc2626;
          border-radius: 4px;
          margin-right: 0.5rem;
          position: relative;
        }
        .checkbox-container input[type='checkbox']:checked + .checkmark {
          background: #dc2626;
        }
        .checkbox-container input[type='checkbox']:checked + .checkmark::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 6px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .confirmation-text {
          font-size: 0.875rem;
          color: #991b1b;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .btn-danger {
          background: #dc2626;
          color: white;
        }
        .btn-danger:hover:not(.disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        .btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
          }
          to {
            transform: scale(1);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .modal-container {
            padding: 0.5rem;
          }
          .modal-header {
            padding: 1rem;
          }
          .modal-body {
            padding: 1rem;
          }
          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default DeleteSurvey;
