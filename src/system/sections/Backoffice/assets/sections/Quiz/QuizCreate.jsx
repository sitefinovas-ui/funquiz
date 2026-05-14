import React, { useState, useEffect } from 'react';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import countryServices from '../../../../../configurations/Services/countryServices.js';
import subThematicServices from '../../../../../configurations/Services/subThematicServices.js';
import questionServices from '../../../../../configurations/Services/questionServices.js';
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaLayerGroup,
  FaQuestionCircle,
  FaSave,
  FaArrowRight,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
} from 'react-icons/fa';

const QuizCreate = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [thematics, setThematics] = useState([]);
  const [selectedThematicId, setSelectedThematicId] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('CI');
  const [africanCountries, setAfricanCountries] = useState([]);
  
  // Step 1: Thematic Data
  const [thematicData, setThematicData] = useState({
    title: '',
    description: '',
    color_code: '#3b82f6',
    is_active: 1,
    country_code: 'CI'
  });

  // Step 2: Sub-thematic Data
  const [subThematicData, setSubThematicData] = useState({
    title: '',
    description: '',
    difficulty_level: 'moyen',
    display_order: 1
  });

  // Step 3: Questions Data
  const [questions, setQuestions] = useState([
    {
      content: '',
      explanation: '',
      difficulty_level: 'moyen',
      question_type: 'multiple_choice',
      points: 10,
      time_limit: 30,
      answers: {
        answer_option1: '',
        answer_option2: '',
        answer_option3: '',
        correct_option: 1,
        answer_type: 'text',
        points_value: 1
      }
    }
  ]);

  useEffect(() => {
    countryServices.getAll().then(data => {
      const activeCountries = data.filter(c => c.is_active);
      setAfricanCountries(activeCountries);
      if (activeCountries.length > 0) setSelectedCountry(activeCountries[0].code);
    }).catch(console.error);

    thematicService.getAllThematics().then(setThematics).catch(console.error);
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, {
      content: '',
      explanation: '',
      difficulty_level: 'moyen',
      question_type: 'multiple_choice',
      points: 10,
      time_limit: 30,
      answers: {
        answer_option1: '',
        answer_option2: '',
        answer_option3: '',
        correct_option: 1,
        answer_type: 'text',
        points_value: 1
      }
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateAnswer = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index].answers[field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let tId = selectedThematicId;
      
      // 1. Create Thematic if new
      if (!tId) {
        const fd = new FormData();
        fd.append('title', thematicData.title);
        fd.append('description', thematicData.description);
        fd.append('color_code', thematicData.color_code);
        fd.append('is_active', thematicData.is_active);
        fd.append('country_code', selectedCountry);
        const res = await thematicService.createThematic(fd);
        tId = res.thematic_id || res.id;
      }

      // 2. Create Sub-thematic
      const subRes = await subThematicServices.create({
        thematic_id: tId,
        ...subThematicData
      });
      const stId = subRes.sub_thematic_id || subRes.id;

      // 3. Create Questions & Answers
      await Promise.all(questions.map(async (q) => {
        const qRes = await questionServices.create({
          sub_thematic_id: stId,
          content: q.content,
          explanation: q.explanation,
          difficulty_level: q.difficulty_level,
          question_type: q.question_type,
          points: q.points,
          time_limit: q.time_limit
        });
        const qId = qRes.question_id || qRes.id;
        await questionServices.createAnswers({
          question_id: qId,
          ...q.answers
        });
      }));

      alert('Quiz créé avec succès !');
      window.location.reload();
    } catch (e) {
      alert('Erreur lors de la création : ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Steps Indicator */}
      <div className="flex items-center justify-between px-8 py-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400'}`}>
              {step > s ? <FaCheck size={14} /> : s}
            </div>
            <div className="hidden sm:block">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${step >= s ? 'text-blue-600' : 'text-slate-400'}`}>
                Étape {s}
              </p>
              <p className={`text-xs font-black ${step >= s ? 'text-slate-900' : 'text-slate-300'}`}>
                {s === 1 ? 'Thématique' : s === 2 ? 'Sous-thème' : 'Questions'}
              </p>
            </div>
            {s < 3 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 space-y-8">
          {/* Step 1: Thematic */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Configuration de la thématique</h2>
                <p className="text-slate-500 font-medium">Choisissez un pays et une thématique associée.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">1. Pays d'origine</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20"
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        setSelectedThematicId(null); // Reset selection when country changes
                      }}
                    >
                      {africanCountries.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">2. Thématique</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/20"
                      value={selectedThematicId || ''}
                      onChange={(e) => setSelectedThematicId(e.target.value || null)}
                    >
                      <option value="">+ Créer une nouvelle thématique pour ce pays</option>
                      {thematics
                        .filter(t => (t.country_code || 'CI') === selectedCountry)
                        .map(t => (
                          <option key={t.thematic_id} value={t.thematic_id}>{t.title || t.thematic_title}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {!selectedThematicId && (
                  <div className="space-y-6 p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Titre</label>
                        <input 
                          className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 shadow-sm"
                          placeholder="Nom de la thématique"
                          value={thematicData.title}
                          onChange={(e) => setThematicData({...thematicData, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Couleur</label>
                        <div className="flex gap-3">
                          <input 
                            type="color"
                            className="w-16 h-14 bg-white p-2 border-none rounded-2xl shadow-sm cursor-pointer"
                            value={thematicData.color_code}
                            onChange={(e) => setThematicData({...thematicData, color_code: e.target.value})}
                          />
                          <input 
                            className="flex-1 px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 shadow-sm"
                            value={thematicData.color_code}
                            onChange={(e) => setThematicData({...thematicData, color_code: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Description</label>
                      <textarea 
                        className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-medium text-slate-700 shadow-sm min-h-[100px] resize-none"
                        placeholder="Brève description..."
                        value={thematicData.description}
                        onChange={(e) => setThematicData({...thematicData, description: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Sub-thematic */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Détails du sous-thème</h2>
                <p className="text-slate-500 font-medium">Définissez le sujet spécifique de ce quiz.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Titre du quiz</label>
                  <input 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700"
                    placeholder="Ex: Les capitales d'Europe"
                    value={subThematicData.title}
                    onChange={(e) => setSubThematicData({...subThematicData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Difficulté</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700"
                    value={subThematicData.difficulty_level}
                    onChange={(e) => setSubThematicData({...subThematicData, difficulty_level: e.target.value})}
                  >
                    <option value="facile">Facile</option>
                    <option value="moyen">Moyen</option>
                    <option value="difficile">Difficile</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Description (optionnel)</label>
                <textarea 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 min-h-[100px] resize-none"
                  placeholder="De quoi parle ce quiz ?"
                  value={subThematicData.description}
                  onChange={(e) => setSubThematicData({...subThematicData, description: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Step 3: Questions */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">Questions & Réponses</h2>
                  <p className="text-slate-500 font-medium">Configurez les questions de votre quiz.</p>
                </div>
                <button 
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <FaPlus /> <span>Ajouter</span>
                </button>
              </div>

              <div className="space-y-12">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="relative p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-8 group">
                    <button 
                      onClick={() => removeQuestion(qIdx)}
                      className="absolute -top-4 -right-4 w-10 h-10 bg-white text-red-500 rounded-2xl shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
                    >
                      <FaTrash size={14} />
                    </button>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 shadow-sm flex items-center justify-center font-black text-xl">
                        {qIdx + 1}
                      </div>
                      <input 
                        className="flex-1 px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 shadow-sm"
                        placeholder="Intitulé de la question..."
                        value={q.content}
                        onChange={(e) => updateQuestion(qIdx, 'content', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Explication (après réponse)</label>
                        <textarea 
                          className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-medium text-slate-700 shadow-sm min-h-[80px] resize-none"
                          placeholder="Pourquoi est-ce la bonne réponse ?"
                          value={q.explanation}
                          onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Points</label>
                          <input 
                            type="number"
                            className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 shadow-sm"
                            value={q.points}
                            onChange={(e) => updateQuestion(qIdx, 'points', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Temps (sec)</label>
                          <input 
                            type="number"
                            className="w-full px-6 py-4 bg-white border-none rounded-2xl text-sm font-bold text-slate-700 shadow-sm"
                            value={q.time_limit}
                            onChange={(e) => updateQuestion(qIdx, 'time_limit', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Options de réponse</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((opt) => (
                          <div key={opt} className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${q.answers.correct_option === opt ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-100 hover:border-slate-200'}`} onClick={() => updateAnswer(qIdx, 'correct_option', opt)}>
                            <div className="flex justify-between items-center">
                              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${q.answers.correct_option === opt ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {opt}
                              </span>
                              {q.answers.correct_option === opt && <FaCheckCircle className="text-emerald-500" />}
                            </div>
                            <textarea 
                              className="w-full p-0 bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 resize-none min-h-[60px]"
                              placeholder={`Option ${opt}...`}
                              value={q.answers[`answer_option${opt}`]}
                              onChange={(e) => updateAnswer(qIdx, `answer_option${opt}`, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <p className="text-[9px] font-black uppercase tracking-tighter opacity-50">
                              {q.answers.correct_option === opt ? 'Bonne réponse' : 'Réponse fausse'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            className="flex items-center gap-2 px-8 py-4 bg-white text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all disabled:opacity-0"
          >
            <FaArrowLeft /> <span>Précédent</span>
          </button>
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? (!selectedThematicId && !thematicData.title) : !subThematicData.title}
              className="flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <span>Continuer</span> <FaArrowRight />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading || questions.some(q => !q.content)}
              className="flex items-center gap-2 px-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              <span>Finaliser et Créer le Quiz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCreate;
