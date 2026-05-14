import React, { useState } from 'react';
import { FaFileExcel, FaTimesCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import { uploadUsers } from '../../configurations/Services/userImportService.js';

const ImportUsers = ({ closePopup }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [defaultIsActive, setDefaultIsActive] = useState(true);
  const [defaultStatus, setDefaultStatus] = useState('active');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return alert('Veuillez sélectionner un fichier Excel (.xlsx, .csv).');

    setUploading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('default_is_active', defaultIsActive ? 1 : 0);
    formData.append('default_status', defaultStatus);

    try {
      const data = await uploadUsers(formData);
      setResult({
        success: true,
        message: data.message,
        inserted: data.inserted,
        duplicates: data.duplicates || [],
        errors: data.errors || [],
        preview: data.preview || [],
      });
    } catch (err) {
      setResult({
        success: false,
        message: err.message || "Erreur lors de l'importation",
        details: err.details,
      });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return createPortal(
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }}
      className="bg-black/50 w-full min-h-screen flex items-center justify-center"
    >
      <div className="bg-white rounded shadow p-4" style={{ width: 'min(700px, 95vw)' }}>
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-bold mb-0 text-purple-600">📥 Importer des utilisateurs</h5>
        </div>

        <div className="mb-3 flex flex-col gap-2">
          <label className="block text-sm font-semibold mb-1">Fichier CSV ou XLSX</label>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
            onChange={handleFileChange}
            disabled={uploading}
            placeholder="Sélectionner un fichier"
          />

          {/* ✅ Une seule section pour les paramètres par défaut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div>
              <label className="block text-sm font-semibold mb-1">Activer les utilisateurs</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultIsActive"
                  checked={defaultIsActive}
                  onChange={(e) => setDefaultIsActive(e.target.checked)}
                  disabled={uploading}
                  className="w-4 h-4 accent-purple-600"
                />
                <label htmlFor="defaultIsActive" className="text-sm">
                  {defaultIsActive ? 'Actif' : 'Inactif'}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Statut par défaut</label>
              <select
                className="block w-full p-2 text-sm border border-gray-300 rounded-lg bg-white"
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value)}
                disabled={uploading}
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
                <option value="deleted">deleted</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-purple-600 text-white rounded-full px-4 py-2 flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? <FaSpinner className="spin" /> : <FaFileExcel />}
            <span>{uploading ? 'Import en cours...' : 'Importer'}</span>
          </button>
          <button className="border border-gray-400 text-gray-700 rounded-full px-4 py-2 hover:bg-gray-100 transition-colors text-sm" onClick={closePopup} disabled={uploading}>
            Fermer
          </button>
        </div>

        {/* ✅ Résultat */}
        {result && (
          <div
            className={`rounded-xl px-4 py-3 flex flex-col gap-2 mt-3 text-sm border ${result.success ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-red-400 border-red-500/20 bg-red-500/10'}`}
          >
            <div className="flex items-center gap-2">
              {result.success ? <FaCheckCircle /> : <FaTimesCircle />}
              <span className="font-semibold">{result.message}</span>
            </div>

            {result.success && (
              <>
                <div className="text-xs">
                  <span className="mr-3">
                    Insérés: <strong>{result.inserted ?? 0}</strong>
                  </span>
                  <span className="mr-3">
                    Doublons: <strong>{result.duplicates?.length ?? 0}</strong>
                  </span>
                  <span>
                    Erreurs: <strong>{result.errors?.length ?? 0}</strong>
                  </span>
                </div>

                {result.duplicates?.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold text-xs mb-1">Doublons (emails):</div>
                    <div className="text-xs">{result.duplicates.join(', ')}</div>
                  </div>
                )}

                {result.errors?.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold text-xs mb-1">Erreurs:</div>
                    <ul className="text-xs mb-0 list-disc pl-4">
                      {result.errors.map((e, i) => (
                        <li key={i}>
                          {e.email}: {e.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.preview?.length > 0 && (
                  <div className="mt-2">
                    <div className="fw-semibold small mb-1">Aperçu (5 premières lignes):</div>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered text-center align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Prenom</th>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.preview.map((u, i) => (
                            <tr key={i}>
                              <td>{u.first_name}</td>
                              <td>{u.name}</td>
                              <td>{u.email}</td>
                              <td>{u.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {!result.success && result.details && (
              <div className="small">
                <div className="fw-semibold mb-1">Détails:</div>
                <pre className="mb-0">{JSON.stringify(result.details, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* ✅ Format attendu */}
        <div className="border-top pt-3 mt-3">
          <p className="text-muted small mb-1">
            <strong>Format attendu :</strong>
          </p>
          <div className="table-responsive">
            <table className="table table-sm table-bordered text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>Prenom</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Jean</td>
                  <td>Dupont</td>
                  <td>jean@gmail.com</td>
                  <td>user</td>
                </tr>
                <tr>
                  <td>Marie</td>
                  <td>Lemoine</td>
                  <td>marie@gmail.com</td>
                  <td>admin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <style>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default ImportUsers;
