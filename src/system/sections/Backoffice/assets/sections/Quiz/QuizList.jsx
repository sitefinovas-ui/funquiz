import React, { useEffect, useState, useMemo } from 'react';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import questionServices from '../../../../../configurations/Services/questionServices.js';
import subThematicServices from '../../../../../configurations/Services/subThematicServices.js';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaChevronRight,
  FaQuestionCircle,
  FaLayerGroup,
  FaCheckCircle,
  FaTimes,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
} from 'react-icons/fa';

function QuizList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [thematics, setThematics] = useState([]);
  const [expandedThematic, setExpandedThematic] = useState(null);
  const [expandedSub, setExpandedSub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'thematic' | 'sub' | 'question' | 'delete'
  const [modalAction, setModalAction] = useState('edit'); // 'create' | 'edit'
  const [currentItem, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({});

  const loadThematics = async () => {
    try {
      setLoading(true);
      const data = await thematicService.getAllThematics();
      const normalized = (data || []).map((t) => {
        let subs = [];
        try {
          subs = typeof t.sub_thematics === 'string' ? JSON.parse(t.sub_thematics) : t.sub_thematics || [];
        } catch { subs = []; }
        const questionCount = subs.reduce((acc, st) => acc + (Array.isArray(st.questions) ? st.questions.length : 0), 0);
        const isActive = typeof t.is_active !== 'undefined' ? (t.is_active ? 1 : 0) : (t.view ?? 1);
        return { ...t, sub_thematics: subs, subCount: subs.length, questionCount, is_active: isActive };
      });
      setThematics(normalized);
    } catch (e) {
      setError('Erreur lors du chargement des quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadThematics(); }, []);

  const filteredThematics = useMemo(() => {
    return thematics.filter(t => 
      (t.title || t.thematic_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || t.thematic_description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [thematics, searchTerm]);

  const toggleThematic = (id) => setExpandedThematic(expandedThematic === id ? null : id);
  const toggleSub = (id) => setExpandedSub(expandedSub === id ? null : id);

  const handleUpdateIsActive = async (thematic, val) => {
    try {
      const fd = new FormData();
      fd.append('title', thematic.title || thematic.thematic_title);
      fd.append('is_active', Number(val) ? 1 : 0);
      await thematicService.updateThematic(thematic.thematic_id, fd);
      loadThematics();
    } catch (e) {
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteThematic = async (id) => {
    if (!confirm('Supprimer cette thématique et tout son contenu ?')) return;
    try {
      await thematicService.deleteThematic(id);
      loadThematics();
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  if (loading && thematics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <FaSpinner className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 font-medium">Chargement des quiz...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Tools */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une thématique..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-600/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { if(confirm('Supprimer TOUTES les thématiques ?')) thematicService.purgeThematics().then(loadThematics); }}
          className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2"
        >
          <FaTrash /> Purger la base
        </button>
      </div>

      {/* Thematics List */}
      <div className="space-y-4">
        {filteredThematics.map((t) => (
          <div key={t.thematic_id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
            {/* Thematic Header */}
            <div className={`p-6 flex items-center gap-6 cursor-pointer hover:bg-slate-50/50 transition-colors ${expandedThematic === t.thematic_id ? 'bg-slate-50/50' : ''}`} onClick={() => toggleThematic(t.thematic_id)}>
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: t.color_code || '#3b82f6' }}>
                <FaLayerGroup size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 truncate">{t.title || t.thematic_title}</h3>
                <p className="text-sm text-slate-500 truncate">{t.description || t.thematic_description || 'Aucune description'}</p>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                  <p className="text-lg font-black text-slate-900 leading-none">{t.subCount}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sous-thèmes</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-slate-900 leading-none">{t.questionCount}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Questions</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpdateIsActive(t, 1); }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${t.is_active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >ACTIF</button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpdateIsActive(t, 0); }}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${!t.is_active ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >OFF</button>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={(e) => { e.stopPropagation(); handleDeleteThematic(t.thematic_id); }} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><FaTrash size={14} /></button>
                <div className={`p-2.5 text-slate-400 transition-transform duration-300 ${expandedThematic === t.thematic_id ? 'rotate-180' : ''}`}>
                  <FaChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Sub-thematics Section */}
            {expandedThematic === t.thematic_id && (
              <div className="p-6 bg-white border-t border-slate-50 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sous-thématiques</h4>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold hover:bg-blue-100 transition-all">
                    <FaPlus size={10} /> Ajouter un sous-thème
                  </button>
                </div>
                
                {t.sub_thematics.map((st) => (
                  <div key={st.sub_thematic_id} className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => toggleSub(st.sub_thematic_id)}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${expandedSub === st.sub_thematic_id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <FaLayerGroup size={12} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{st.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{st.difficulty_level || 'Moyen'} · {st.questions?.length || 0} questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><FaEdit size={12} /></button>
                        <button className="p-2 text-slate-300 hover:text-red-600 transition-colors"><FaTrash size={12} /></button>
                        <FaChevronRight size={10} className={`text-slate-300 transition-transform ${expandedSub === st.sub_thematic_id ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {/* Questions Section */}
                    {expandedSub === st.sub_thematic_id && (
                      <div className="bg-slate-50/50 p-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
                          <button className="text-[10px] font-bold text-blue-600 hover:underline">+ Nouvelle question</button>
                        </div>
                        {st.questions?.map((q) => (
                          <div key={q.question_id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <FaQuestionCircle className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                              <div>
                                <p className="text-xs font-bold text-slate-700 line-clamp-1">{q.content}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{q.question_type} · {q.points} pts</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-1.5 text-slate-300 hover:text-blue-600 transition-colors"><FaEdit size={10} /></button>
                              <button className="p-1.5 text-slate-300 hover:text-red-600 transition-colors"><FaTrash size={10} /></button>
                            </div>
                          </div>
                        ))}
                        {(!st.questions || st.questions.length === 0) && (
                          <p className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">Aucune question dans ce thème</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {t.sub_thematics.length === 0 && (
                  <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun sous-thème</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredThematics.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <FaSearch size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun quiz trouvé</h3>
          <p className="text-slate-500">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}

export default QuizList;

