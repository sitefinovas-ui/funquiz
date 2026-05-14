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
      className="fixed inset-0 flex justify-center items-center"
      style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="shadow-lg p-4 rounded-2xl bg-white" style={{ width: 420 }}>
        <h3 className="mb-3 text-gray-900">Ajouter un numéro</h3>
        <p className="text-gray-500 mb-3">
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
          {error && <div className="rounded-xl px-4 py-2 mb-2 text-red-400 text-sm border border-red-500/20 bg-red-500/10">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="border border-gray-400 text-gray-700 rounded-full px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
              onClick={closePopup}
              disabled={saving}
            >
              Annuler
            </button>
            <button type="submit" className="bg-purple-600 text-white rounded-full px-4 py-2 hover:bg-purple-700 transition-colors text-sm disabled:opacity-50" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  // ... existing code ...
}