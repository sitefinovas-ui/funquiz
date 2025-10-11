import { useEffect, useState } from 'react';
import logServices from '../../../../../configurations/Services/logServices.js';

const LogsPage = () => {
  const [lines, setLines] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async (l = limit) => {
    setLoading(true);
    setError('');
    try {
      const res = await logServices.getLogs(l);
      setLines(res.lines || []);
      setTotal(res.total || res.lines?.length || 0);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Erreur de chargement des logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Rapport console';
    load();
  }, []);

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mt-3 mb-3">
        <h2 className="h5 mb-0">Rapport console backend</h2>
        <div className="d-flex align-items-center gap-2">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="form-select form-select-sm w-100 m-0"
            style={{ width: '140px' }}
          >
            {[100, 200, 500, 1000, 2000].map((n) => (
              <option key={n} value={n}>
                Dernières {n} lignes
              </option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => load()}>
            Rafraîchir
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      <div className="small text-muted mb-2">Total lignes: {total}</div>

      <div
        className="border rounded p-2"
        style={{
          background: '#0f172a',
          color: '#e5e7eb',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          maxHeight: '60vh',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
        }}
      >
        {loading ? (
          <div>Chargement…</div>
        ) : lines.length === 0 ? (
          <div>Aucun log disponible.</div>
        ) : (
          <pre style={{ margin: 0 }}>
            {lines.map((ln, i) => (
              <div key={i}>{ln}</div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LogsPage;