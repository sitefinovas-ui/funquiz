import React, { useState, useEffect } from 'react';
import { 
  FaClipboard, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaInfoCircle,
  FaTrash,
  FaLayerGroup,
  FaPlus,
  FaTable
} from 'react-icons/fa';
import questionServices from '../../../../../configurations/Services/questionServices.js';
import thematicService from '../../../../../configurations/Services/thematicServices.js';

const QuestionImport = () => {
  const [loading, setLoading] = useState(false);
  const [pasteData, setPasteData] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [status, setStatus] = useState(null);
  const [thematics, setThematics] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState('');

  const headers = [
    "Question", 
    "Explication", 
    "Difficulté", 
    "Score", 
    "Temps", 
    "Réponse 1", 
    "Réponse 2", 
    "Réponse 3", 
    "Bonne Réponse",
    "Nom du Quiz"
  ];

  useEffect(() => {
    thematicService.getAllThematics()
      .then(data => {
        const allSubs = data.reduce((acc, thematic) => {
          let subs = [];
          try {
            subs = typeof thematic.sub_thematics === 'string' 
              ? JSON.parse(thematic.sub_thematics) 
              : thematic.sub_thematics || [];
          } catch (e) { subs = []; }
          
          return [...acc, ...subs.map((s, idx) => ({ 
            id: s.sub_thematic_id,
            title: s.title,
            thematicTitle: thematic.title || thematic.thematic_title 
          }))];
        }, []);
        
        // Filtrer pour n'avoir que ceux avec un ID valide
        const validSubs = allSubs.filter(s => s.id);
        setThematics(validSubs);
        if (validSubs.length > 0 && !selectedSubId) {
          setSelectedSubId(validSubs[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handlePaste = (e) => {
    const text = e.target.value;
    setPasteData(text);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    // Détection du séparateur (tabulation pour Excel, sinon point-virgule ou virgule)
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
      const cleanedCells = cells.map(c => c.trim().replace(/^"(.*)"$/, '$1'));
      // S'assurer que chaque ligne a le bon nombre de colonnes (remplissage si besoin)
      while (cleanedCells.length < headers.length) {
        cleanedCells.push("");
      }
      return cleanedCells;
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
      alert("Aucune donnée à importer. Collez des données depuis Excel ou un tableau.");
      return;
    }

    setLoading(true);
    setStatus(null);

    // Conversion des lignes du tableau en fichier CSV pour réutiliser l'API existante
    // On entoure chaque cellule de guillemets et on double les guillemets internes pour un CSV valide
    const csvContent = "\uFEFF" + [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(";"),
      ...parsedRows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], "import_paste.csv", { type: "text/csv" });

    const formData = new FormData();
    if (selectedSubId) {
      formData.append('sub_thematic_id', selectedSubId);
    }
    formData.append('file', file);

    try {
      const result = await questionServices.importQuestions(formData);
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
        message: err.response?.data?.error || err.message || "Une erreur est survenue lors de l'importation." 
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
            <FaClipboard className="text-blue-500" />
            Importation Rapide par Copier-Coller
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Copiez vos colonnes depuis Excel ou Google Sheets et collez-les directement ici.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Step 1: Paste Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
              Collez vos données ici
            </h3>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500">Quiz par défaut :</label>
                <select 
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="text-xs p-1 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white"
                >
                  <option value="">-- Selon le fichier --</option>
                  {thematics.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.thematicTitle} - {sub.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <textarea
            value={pasteData}
            onChange={handlePaste}
            placeholder="Copiez vos lignes Excel et collez-les ici...&#10;Exemple : Ma question	Explication	facile	10	30	Rép1	Rép2	Rép3	1	Mon Quiz"
            className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-sm font-mono"
          ></textarea>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-800">
            <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-300">
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
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Vérifiez les données ({parsedRows.length} lignes)
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
                          <div className="max-w-[200px] truncate" title={row[colIndex]}>
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
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none'
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
                  Confirmer et importer ces {parsedRows.length} questions
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
                  <div className="mt-2 text-sm opacity-90 flex flex-wrap gap-4">
                    <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
                      <span className="font-semibold">Questions créées :</span>
                      <span className="text-lg ml-2">{status.details.questions_created}</span>
                    </div>
                    {status.details.questions_skipped > 0 && (
                      <div className="bg-amber-100/50 dark:bg-amber-900/20 p-2 rounded text-amber-800 dark:text-amber-400">
                        <span className="font-semibold">Lignes ignorées :</span>
                        <span className="text-lg ml-2">{status.details.questions_skipped}</span>
                        <p className="text-[10px] mt-1">Vérifiez les titres des quiz ou l'énoncé des questions.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionImport;
