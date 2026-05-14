import React, { useState, useEffect } from 'react';
import { 
  FaClipboard, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaInfoCircle,
  FaTrash,
  FaGlobe,
  FaTable
} from 'react-icons/fa';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import countryServices from '../../../../../configurations/Services/countryServices.js';

const ThematicImport = () => {
  const [loading, setLoading] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [status, setStatus] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('CI');

  const headers = [
    "Titre Thématique", 
    "Description Thématique", 
    "Code Couleur (#Hex)", 
    "Pays (Code)", 
    "Titre Sous-Thématique", 
    "Description Sous-Thématique", 
    "Difficulté"
  ];

  useEffect(() => {
    countryServices.getAll().then(setCountries).catch(console.error);
  }, []);

  const handlePaste = (e) => {
    const text = e.target.value;
    setPasteData(text);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.trim().split(/\r?\n/);
    const rows = lines.map(line => {
      let cells = [];
      if (line.includes('\t')) {
        cells = line.split('\t');
      } else if (line.includes(';')) {
        cells = line.split(';');
      } else {
        cells = line.split(',');
      }
      return cells.map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    });

    setParsedRows(rows);
    setStatus(null);
  };

  const removeRow = (index) => {
    const newRows = [...parsedRows];
    newRows.splice(index, 1);
    setParsedRows(newRows);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) {
      alert("Aucune donnée à importer.");
      return;
    }

    setLoading(true);
    setStatus(null);

    // Conversion en CSV pour l'API existante
    const csvContent = "\uFEFF" + [
      headers.join(";"),
      ...parsedRows.map(row => row.join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], "import_thematics_paste.csv", { type: "text/csv" });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('default_country_code', selectedCountry);

    try {
      const result = await thematicService.importThematics(formData);
      setStatus({ 
        type: 'success', 
        message: result.message,
        details: result.details 
      });
      setParsedRows([]);
      setPasteData('');
    } catch (err) {
      console.error("Erreur d'importation:", err);
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || err.message || "Une erreur est survenue." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaClipboard className="text-indigo-500" />
            Importation Rapide des Thématiques
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Copiez vos colonnes thématiques depuis Excel et collez-les ici.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Step 1: Paste Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
              Collez vos données ici
            </h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Pays par défaut :</label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="text-xs p-1 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>
          
          <textarea
            value={pasteData}
            onChange={handlePaste}
            placeholder="Copiez vos lignes Excel (Titre Thématique	Description	Couleur	Pays...) et collez-les ici..."
            className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-0 transition-all text-sm font-mono"
          ></textarea>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg flex gap-3 items-start border border-indigo-100 dark:border-indigo-800">
            <FaInfoCircle className="text-indigo-500 mt-1 flex-shrink-0" />
            <div className="text-xs text-indigo-800 dark:text-indigo-300">
              <p className="font-bold mb-1">Ordre des colonnes conseillé :</p>
              <p className="opacity-80 italic">{headers.join(" | ")}</p>
            </div>
          </div>
        </div>

        {/* Step 2: Verification Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Vérifiez les données ({parsedRows.length} thématiques)
              </h3>
              <button 
                onClick={() => {setParsedRows([]); setPasteData('');}}
                className="text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <FaTrash /> Tout effacer
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    <th className="p-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-200 dark:border-gray-700 w-10 text-center">#</th>
                    {headers.map((h, i) => (
                      <th key={i} className="p-3 text-[10px] font-black uppercase text-gray-400 border-b border-gray-200 dark:border-gray-700 min-w-[120px]">
                        {h}
                      </th>
                    ))}
                    <th className="p-3 border-b border-gray-200 dark:border-gray-700 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {parsedRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="p-3 text-xs text-gray-400 text-center font-bold">{rowIndex + 1}</td>
                      {headers.map((_, colIndex) => (
                        <td key={colIndex} className="p-3 text-xs text-gray-700 dark:text-gray-300">
                          <div className="max-w-[150px] truncate">
                            {colIndex === 2 && row[colIndex] && (
                              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: row[colIndex] }}></span>
                            )}
                            {row[colIndex] || <span className="text-gray-300 italic">Vide</span>}
                          </div>
                        </td>
                      ))}
                      <td className="p-3">
                        <button onClick={() => removeRow(rowIndex)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <FaTrash size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleImport}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                loading 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Importation en cours...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Confirmer et importer ces {parsedRows.length} thématiques
                </>
              )}
            </button>
          </div>
        )}

        {status && (
          <div className={`p-5 rounded-xl border flex gap-4 ${
            status.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}>
            <div className="mt-1">
              {status.type === 'success' ? <FaCheckCircle className="text-xl" /> : <FaExclamationTriangle className="text-xl" />}
            </div>
            <div>
              <p className="font-bold">{status.message}</p>
              {status.details && (
                <div className="mt-2 text-sm opacity-90 grid grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                    <span className="block font-semibold">Thématiques :</span>
                    <span className="text-lg">{status.details.thematics_created} créées</span>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                    <span className="block font-semibold">Sous-thématiques :</span>
                    <span className="text-lg">{status.details.sub_thematics_created} créées</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThematicImport;

