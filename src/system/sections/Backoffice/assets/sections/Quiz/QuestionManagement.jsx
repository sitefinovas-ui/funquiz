import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaImage, 
  FaSave, 
  FaTimes, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSearch,
  FaLayerGroup,
  FaQuestionCircle
} from 'react-icons/fa';
import questionServices from '../../../../../configurations/Services/questionServices.js';
import thematicService from '../../../../../configurations/Services/thematicServices.js';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [subThematics, setSubThematics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    sub_thematic_id: '',
    content: '',
    explanation: '',
    difficulty_level: 'moyen',
    question_type: 'multiple_choice',
    points: 10,
    time_limit: 30,
    answer_option1: '',
    answer_option2: '',
    answer_option3: '',
    correct_option: 1
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchSubThematics();
  }, []);

  useEffect(() => {
    if (selectedSubId) {
      fetchQuestions(selectedSubId);
    } else {
      setQuestions([]);
    }
  }, [selectedSubId]);

  const fetchSubThematics = async () => {
    try {
      const data = await thematicService.getAllThematics();
      const allSubs = data.reduce((acc, thematic) => {
        let subs = [];
        try {
          subs = typeof thematic.sub_thematics === 'string' 
            ? JSON.parse(thematic.sub_thematics) 
            : thematic.sub_thematics || [];
        } catch (e) { subs = []; }
        
        return [...acc, ...subs.map((s, idx) => ({ 
          ...s, 
          id: s.sub_thematic_id,
          uniqueKey: s.sub_thematic_id || `sub-${thematic.thematic_id}-${idx}`,
          thematicTitle: thematic.title || thematic.thematic_title 
        }))];
      }, []);
      
      const validSubs = allSubs.filter(s => s.id);
      setSubThematics(validSubs);
      if (validSubs.length > 0 && !selectedSubId) {
        setSelectedSubId(validSubs[0].id);
      }
    } catch (error) {
      console.error("Erreur chargement sous-thématiques:", error);
    }
  };

  const fetchQuestions = async (subId) => {
    setLoading(true);
    try {
      const data = await questionServices.getBySubThematic(subId);
      
      if (!Array.isArray(data)) {
        setQuestions([]);
        return;
      }

      // Récupérer les réponses pour chaque question
      const questionsWithAnswers = await Promise.all(data.map(async (q) => {
        try {
          const answers = await questionServices.getAnswers(q.question_id);
          return { ...q, answers: answers[0] || {} };
        } catch (e) {
          return { ...q, answers: {} };
        }
      }));
      
      setQuestions(questionsWithAnswers);
    } catch (error) {
      console.error("Erreur chargement questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      sub_thematic_id: selectedSubId,
      content: '',
      explanation: '',
      difficulty_level: 'moyen',
      question_type: 'multiple_choice',
      points: 10,
      time_limit: 30,
      answer_option1: '',
      answer_option2: '',
      answer_option3: '',
      correct_option: 1
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      sub_thematic_id: q.sub_thematic_id || selectedSubId,
      content: q.content || '',
      explanation: q.explanation || '',
      difficulty_level: q.difficulty_level || 'moyen',
      question_type: q.question_type || 'multiple_choice',
      points: q.points || 10,
      time_limit: q.time_limit || 30,
      answer_option1: q.answers?.answer_option1 || '',
      answer_option2: q.answers?.answer_option2 || '',
      answer_option3: q.answers?.answer_option3 || '',
      correct_option: q.answers?.correct_option || 1
    });
    setSelectedFile(null);
    setPreviewUrl(q.media_url || null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const data = new FormData();
    // On ajoute explicitement tous les champs pour éviter les oublis
    data.append('sub_thematic_id', formData.sub_thematic_id);
    data.append('content', formData.content);
    data.append('explanation', formData.explanation);
    data.append('difficulty_level', formData.difficulty_level);
    data.append('question_type', formData.question_type);
    data.append('points', formData.points);
    data.append('time_limit', formData.time_limit);
    data.append('answer_option1', formData.answer_option1 || '');
    data.append('answer_option2', formData.answer_option2 || '');
    data.append('answer_option3', formData.answer_option3 || '');
    data.append('correct_option', formData.correct_option);
    
    if (selectedFile) {
      data.append('media', selectedFile);
    }

    try {
      if (editingQuestion) {
        await questionServices.update(editingQuestion.question_id, data);
        setStatus({ type: 'success', message: "Question mise à jour." });
      } else {
        // Envoi d'un seul appel complet (Multipart)
        await questionServices.create(data);
        setStatus({ type: 'success', message: "Question créée." });
      }
      setShowModal(false);
      fetchQuestions(selectedSubId);
    } catch (error) {
      console.error("❌ Erreur handleSubmit:", error);
      setStatus({ type: 'error', message: error.response?.data?.error || "Erreur lors de la sauvegarde." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette question ?")) return;
    try {
      await questionServices.delete(id);
      fetchQuestions(selectedSubId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="w-full md:w-64">
            <select 
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {subThematics.map(sub => (
                <option key={sub.uniqueKey} value={sub.id}>
                  {sub.thematicTitle} - {sub.title}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher dans ce quiz..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <FaPlus />
          Nouvelle Question
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
          <p className="text-gray-500">Chargement des questions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.filter(q => q.content?.toLowerCase().includes(searchTerm.toLowerCase())).map((q) => (
            <div key={q.question_id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {q.media_url ? (
                  <img src={q.media_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FaQuestionCircle className="text-gray-300 text-2xl" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 dark:text-white truncate">{q.content}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{q.difficulty_level}</span>
                  <span className="text-[10px] font-bold text-gray-400">{q.points} pts · {q.time_limit}s</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleOpenEdit(q)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><FaEdit /></button>
                <button onClick={() => handleDelete(q.question_id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><FaTrash /></button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-gray-400 font-bold uppercase tracking-widest">Aucune question dans ce quiz</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Question */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingQuestion ? 'Modifier la Question' : 'Nouvelle Question'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Énoncé de la question *</label>
                <textarea 
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows="2"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Difficulté</label>
                  <select 
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white"
                  >
                    <option value="facile">Facile</option>
                    <option value="moyen">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Points</label>
                  <input 
                    type="number" 
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Temps (sec)</label>
                  <input 
                    type="number" 
                    value={formData.time_limit}
                    onChange={(e) => setFormData({...formData, time_limit: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Réponses</label>
                <div className="space-y-3">
                  {[1, 2, 3].map(num => (
                    <div key={num} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct_option"
                        checked={formData.correct_option === num}
                        onChange={() => setFormData({...formData, correct_option: num})}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        placeholder={`Option ${num}`}
                        value={formData[`answer_option${num}`]}
                        onChange={(e) => setFormData({...formData, [`answer_option${num}`]: e.target.value})}
                        className={`flex-1 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white ${
                          formData.correct_option === num ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 dark:border-gray-700'
                        }`}
                        required={num <= 2}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 italic">Cochez le bouton radio à gauche de la bonne réponse.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Explication (Feedback)</label>
                <textarea 
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Pourquoi cette réponse est la bonne ?"
                ></textarea>
              </div>

              <div className="flex items-center gap-6 p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain" /> : <FaImage className="text-gray-300 text-2xl" />}
                </div>
                <div className="flex-1">
                  <input type="file" id="media-upload" className="hidden" onChange={handleFileChange} accept="image/*" />
                  <label htmlFor="media-upload" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 font-bold text-sm">
                    Choisir une image
                  </label>
                  <p className="text-[10px] text-gray-500 mt-2">Image d'illustration pour la question.</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700 rounded-xl">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {editingQuestion ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
