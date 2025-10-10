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
      className="bg-black bg-opacity-50 w-100 vh-100 d-flex align-items-center justify-content-center"
    >
      <div className="bg-white rounded shadow p-4" style={{ width: 'min(700px, 95vw)' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 text-primary">📥 Importer des utilisateurs</h5>
        </div>

        <div className="mb-3 d-flex flex-column gap-2">
          <label className="form-label fw-semibold">Fichier CSV ou XLSX</label>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="form-control text-black"
            onChange={handleFileChange}
            disabled={uploading}
            placeholder="Sélectionner un fichier"
          />

          {/* ✅ Une seule section pour les paramètres par défaut */}
          <div className="row g-3 mt-1">
            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold">Activer les utilisateurs</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="defaultIsActive"
                  checked={defaultIsActive}
                  onChange={(e) => setDefaultIsActive(e.target.checked)}
                  disabled={uploading}
                />
                <label className="form-check-label" htmlFor="defaultIsActive">
                  {defaultIsActive ? 'Actif' : 'Inactif'}
                </label>
              </div>
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label fw-semibold">Statut par défaut</label>
              <select
                className="form-select"
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

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? <FaSpinner className="spin" /> : <FaFileExcel />}
            <span>{uploading ? 'Import en cours...' : 'Importer'}</span>
          </button>
          <button className="btn btn-outline-secondary" onClick={closePopup} disabled={uploading}>
            Fermer
          </button>
        </div>

        {/* ✅ Résultat */}
        {result && (
          <div
            className={`alert ${result.success ? 'alert-success' : 'alert-danger'} d-flex flex-column gap-2 mt-3`}
          >
            <div className="d-flex align-items-center gap-2">
              {result.success ? <FaCheckCircle /> : <FaTimesCircle />}
              <span className="fw-semibold">{result.message}</span>
            </div>

            {result.success && (
              <>
                <div className="small">
                  <span className="me-3">
                    Insérés: <strong>{result.inserted ?? 0}</strong>
                  </span>
                  <span className="me-3">
                    Doublons: <strong>{result.duplicates?.length ?? 0}</strong>
                  </span>
                  <span>
                    Erreurs: <strong>{result.errors?.length ?? 0}</strong>
                  </span>
                </div>

                {result.duplicates?.length > 0 && (
                  <div className="mt-2">
                    <div className="fw-semibold small mb-1">Doublons (emails):</div>
                    <div className="small">{result.duplicates.join(', ')}</div>
                  </div>
                )}

                {result.errors?.length > 0 && (
                  <div className="mt-2">
                    <div className="fw-semibold small mb-1">Erreurs:</div>
                    <ul className="small mb-0">
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
