import { useState } from "react";
import { usePopup } from "../../configurations/Context/PopupContext.jsx";

const DeleteSurvey = ( ) => {
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closePopup } = usePopup()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checked) return;
    
    setIsSubmitting(true);
    
    // Simulation API
    setTimeout(() => {
      console.log("Raison :", reason);
      console.log("Commentaire :", comment);
      alert("Votre demande de suppression a été prise en compte. Vous recevrez une confirmation par email.");
      setIsSubmitting(false);
    }, 2000);
  };

  const reasons = [
    { value: "utilite", label: "Je n'en ai plus l'utilité" },
    { value: "bugs", label: "Trop de bugs ou problèmes techniques" },
    { value: "experience", label: "Expérience utilisateur décevante" },
    { value: "prix", label: "Coût trop élevé" },
    { value: "fonctionnalites", label: "Fonctionnalités insuffisantes" },
    { value: "concurrence", label: "J'ai trouvé une meilleure alternative" },
    { value: "autre", label: "Autre raison" }
  ];

  return (
    <>
      <div className="modal-backdrop"  />
      <div className="modal-container">
        <div className="modal-content">
          {/* En-tête */}
          <div className="modal-header">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="header-text">
              <h2>Suppression de compte</h2>
              <p>Cette action est définitive et irréversible</p>
            </div>
            <button className="close-btn" onClick={closePopup}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="modal-body">
            {/* Informations légales */}
            <div className="info-card">
              <div className="info-header">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Vos droits</h3>
              </div>
              <ul className="rights-list">
                <li>
                  <span className="right-icon">⏱️</span>
                  <div>
                    <strong>Délai de rétractation</strong>
                    <p>30 jours pour annuler votre demande</p>
                  </div>
                </li>
                <li>
                  <span className="right-icon">📥</span>
                  <div>
                    <strong>Export de données</strong>
                    <p>Téléchargez vos informations avant suppression</p>
                  </div>
                </li>
                <li>
                  <span className="right-icon">🔒</span>
                  <div>
                    <strong>Suppression définitive</strong>
                    <p>Toutes vos données seront effacées après 30 jours</p>
                  </div>
                </li>
              </ul>
              <div className="support-link">
                Besoin d'aide ? <a href="/contact">Contactez notre support</a>
              </div>
            </div>

            {/* Enquête satisfaction */}
            <div className="survey-section">
              <div className="survey-intro">
                <h3>Aidez-nous à nous améliorer</h3>
                <p>Vos retours nous permettent d'offrir une meilleure expérience à tous nos utilisateurs.</p>
              </div>

              {/* Raison du départ */}
              <div className="form-group">
                <label className="form-label">Quelle est la raison principale de votre départ ?*</label>
                <div className="radio-group">
                  {reasons.map((reasonOption) => (
                    <label key={reasonOption.value} className={`radio-option ${reason === reasonOption.value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="reason"
                        value={reasonOption.value}
                        checked={reason === reasonOption.value}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-text">{reasonOption.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Commentaire */}
              <div className="form-group">
                <label className="form-label">Commentaire (optionnel)</label>
                <div className="textarea-container">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    placeholder="Partagez vos suggestions ou détaillez votre expérience..."
                    maxLength="500"
                  />
                  <div className="char-count">{comment.length}/500</div>
                </div>
              </div>

              {/* Confirmation */}
              <div className="confirmation-section">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <div className="confirmation-text">
                    <strong>Je confirme vouloir supprimer définitivement mon compte</strong>
                    <p>Je comprends que cette action est irréversible et que toutes mes données seront supprimées.</p>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closePopup}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className={`btn btn-danger ${(!checked || isSubmitting) ? 'disabled' : ''}`}
                  disabled={!checked || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Suppression en cours...
                    </>
                  ) : (
                    'Supprimer définitivement'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Reset et base */
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
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          animation: scaleIn 0.3s ease-out;
        }

        /* En-tête */
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

        .header-icon svg {
          width: 24px;
          height: 24px;
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
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
          color: #6b7280;
        }

        .close-btn:hover {
          background: #e5e7eb;
        }

        .close-btn svg {
          width: 18px;
          height: 18px;
        }

        /* Corps du modal */
        .modal-body {
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }

        /* Carte d'informations */
        .info-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .info-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          color: #0369a1;
        }

        .info-header svg {
          width: 20px;
          height: 20px;
          margin-right: 0.5rem;
        }

        .info-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .rights-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .rights-list li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .rights-list li:last-child {
          margin-bottom: 0;
        }

        .right-icon {
          font-size: 1.125rem;
          margin-right: 0.75rem;
          margin-top: 0.125rem;
        }

        .rights-list strong {
          display: block;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .rights-list p {
          margin: 0;
          font-size: 0.875rem;
          color: #475569;
        }

        .support-link {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #bae6fd;
          font-size: 0.875rem;
          color: #475569;
        }

        .support-link a {
          color: #0369a1;
          text-decoration: none;
          font-weight: 500;
        }

        .support-link a:hover {
          text-decoration: underline;
        }

        /* Section enquête */
        .survey-section {
          background: #ffffff;
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

        /* Formulaire */
        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #111827;
          font-size: 0.875rem;
        }

        /* Radio buttons */
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

        .radio-option input[type="radio"] {
          display: none;
        }

        .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          margin-right: 0.75rem;
          position: relative;
          transition: all 0.2s;
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

        /* Textarea */
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

        /* Confirmation */
        .confirmation-section {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
        }

        .checkbox-container {
          display: flex;
          align-items: flex-start;
          cursor: pointer;
        }

        .checkbox-container input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #dc2626;
          border-radius: 4px;
          margin-right: 0.75rem;
          margin-top: 0.125rem;
          position: relative;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .checkbox-container input[type="checkbox"]:checked + .checkmark {
          background: #dc2626;
        }

        .checkbox-container input[type="checkbox"]:checked + .checkmark::after {
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

        .confirmation-text strong {
          display: block;
          color: #991b1b;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .confirmation-text p {
          margin: 0;
          font-size: 0.75rem;
          color: #7f1d1d;
          line-height: 1.4;
        }

        /* Actions */
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
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
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

        /* Spinner */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
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

          .rights-list li {
            flex-direction: column;
            align-items: flex-start;
          }

          .right-icon {
            margin-bottom: 0.5rem;
            margin-right: 0;
          }
        }
      `}</style>
    </>
  );
};

export default DeleteSurvey;