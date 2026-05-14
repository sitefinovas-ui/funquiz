import { useEffect, useState } from 'react';
import { FaTerminal, FaSyncAlt, FaExclamationTriangle, FaClock, FaSpinner } from 'react-icons/fa';
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Logs Serveur</h1>
          <p className="text-slate-500 font-medium">Consultez l'activité en temps réel du backend</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setLimit(newLimit);
              load(newLimit);
            }}
            className="px-6 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 shadow-sm focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
          >
            {[100, 200, 500, 1000, 2000].map((n) => (
              <option key={n} value={n}>Dernières {n} lignes</option>
            ))}
          </select>
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            <span>Rafraîchir</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl flex items-center gap-3">
          <FaExclamationTriangle />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Terminal Card */}
      <div className="bg-slate-950 rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <FaTerminal size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest">console.log</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg">
            <FaClock size={10} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{total} lignes</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <FaSpinner className="animate-spin text-blue-500" size={24} />
              <p className="text-slate-500 font-mono text-xs animate-pulse">Flux entrant...</p>
            </div>
          ) : lines.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 font-mono text-sm italic">Aucun log disponible pour le moment.</p>
            </div>
          ) : (
            <div className="font-mono text-sm space-y-1">
              {lines.map((ln, i) => (
                <div key={i} className="flex gap-4 group">
                  <span className="text-slate-700 select-none text-right w-10 shrink-0">{i + 1}</span>
                  <span className="text-slate-300 group-hover:text-white transition-colors break-all leading-relaxed">{ln}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />
    </div>
  );
};

export default LogsPage;
