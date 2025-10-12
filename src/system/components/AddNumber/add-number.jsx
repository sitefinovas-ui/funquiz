import React, { useState } from 'react';
import useAuth from '../../configurations/Context/useAuth';

export default function AddNumber({ closePopup }) {
 
  // ... existing code ...
  const { user, putUserById } = useAuth();
  const [number, setNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sanitizeDigits = (v) => v.replace(/\D/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const digits = sanitizeDigits(number);

    // Validation de base: 8 à 20 chiffres (schéma SQL: VARCHAR(20))
    if (!digits || digits.length < 8 || digits.length > 20) {
      setError('Veuillez entrer un numéro valide (8 à 20 chiffres).');
      return;
    }

    try {
      setSaving(true);
      await putUserById(user.user_id, { number: digits });
      alert('Numéro enregistré. Vous pourrez maintenant le vérifier.');
      closePopup();
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      // Mapping explicite des doublons -> message utilisateur clair
      if (
        status === 409 ||
        code === 'NUMBER_ALREADY_IN_USE' ||
        /Duplicate entry/i.test(backendMsg || '')
      ) {
        setError('Ce numéro est déjà utilisé par un autre compte.');
      } else {
        setError(backendMsg || 'Erreur lors de l’enregistrement.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="shadow-lg p-4 rounded-4 bg-white" style={{ width: 420 }}>
        <h3 className="mb-3">Ajouter un numéro</h3>
        <p className="text-muted mb-3">
          Entrez votre numéro de téléphone pour lier votre compte.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            className="form-control-custom mb-3"
            placeholder="Ex: 0701234567"
            value={number}
            onChange={(e) => setNumber(sanitizeDigits(e.target.value))}
            disabled={saving}
          />
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={closePopup}
              disabled={saving}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  // ... existing code ...
}