import React, { useState, useEffect } from 'react';
import { Trophy, Brain, Target, Zap, Star, Award, TrendingUp, Clock, Users, Play, BookOpen, Flame } from 'lucide-react';

export default function QuizProfilePage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    document.title = "FUNQUIZ | Mon profile";
  }, []);

  const userStats = {
    totalQuizzes: 247,
    correctAnswers: 1843,
    totalPoints: 15420,
    rank: 'Expert',
    level: 28,
    streak: 12,
    accuracy: 87,
    avgTime: '2.3s'
  };

  const categories = [
    { name: 'Science', icon: '🔬', quizzes: 45, accuracy: 92, color: 'from-blue-500 to-cyan-500' },
    { name: 'Histoire', icon: '📚', quizzes: 38, accuracy: 89, color: 'from-amber-500 to-orange-500' },
    { name: 'Sport', icon: '⚽', quizzes: 52, accuracy: 84, color: 'from-green-500 to-emerald-500' },
    { name: 'Cinéma', icon: '🎬', quizzes: 41, accuracy: 91, color: 'from-purple-500 to-pink-500' },
    { name: 'Musique', icon: '🎵', quizzes: 35, accuracy: 86, color: 'from-red-500 to-rose-500' },
    { name: 'Géographie', icon: '🌍', quizzes: 36, accuracy: 88, color: 'from-teal-500 to-blue-500' }
  ];

  const achievements = [
    { name: 'Première Victoire', desc: 'Gagner votre premier quiz', icon: Trophy, earned: true, date: '15 Jan 2024' },
    { name: 'Série de 10', desc: 'Répondre correctement 10 fois de suite', icon: Flame, earned: true, date: '20 Jan 2024' },
    { name: 'Rapide comme l\'éclair', desc: 'Répondre en moins de 1 seconde', icon: Zap, earned: true, date: '25 Jan 2024' },
    { name: 'Expert Sciences', desc: '90% de réussite en sciences', icon: Brain, earned: true, date: '1 Fév 2024' },
    { name: 'Marathon', desc: 'Jouer pendant 2h consécutives', icon: Clock, earned: false },
    { name: 'Perfectionniste', desc: '100% de réussite sur 20 questions', icon: Target, earned: false }
  ];

  const recentQuizzes = [
    { title: 'Les Planètes du Système Solaire', category: 'Science', score: 18, total: 20, time: '1m 45s', date: 'Aujourd\'hui' },
    { title: 'Rois de France', category: 'Histoire', score: 15, total: 15, time: '2m 12s', date: 'Hier' },
    { title: 'Capitales Européennes', category: 'Géographie', score: 22, total: 25, time: '3m 01s', date: 'Il y a 2 jours' },
    { title: 'Films des années 80', category: 'Cinéma', score: 16, total: 20, time: '2m 33s', date: 'Il y a 3 jours' }
  ];

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankColor = (rank) => {
    const colors = {
      'Débutant': 'from-gray-400 to-gray-600',
      'Amateur': 'from-blue-400 to-blue-600',
      'Confirmé': 'from-purple-400 to-purple-600',
      'Expert': 'from-orange-400 to-orange-600',
      'Maître': 'from-red-400 to-red-600'
    };
    return colors[rank] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header avec effet de particules */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white bg-opacity-20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative px-6 py-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="relative inline-block">
              <img 
                src="https://picsum.photos/120/120?random=quiz-user" 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-2xl mx-auto mb-6"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2">Alex QuizMaster</h1>
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getRankColor(userStats.rank)} text-white font-semibold shadow-lg`}>
              <Star className="w-5 h-5 mr-2" />
              {userStats.rank} - Niveau {userStats.level}
            </div>
            
            <div className="flex justify-center items-center space-x-6 mt-6 text-white">
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.totalQuizzes}</div>
                <div className="text-sm opacity-80">Quiz joués</div>
              </div>
              <div className="w-px h-12 bg-white opacity-30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
                <div className="text-sm opacity-80">Points totaux</div>
              </div>
              <div className="w-px h-12 bg-white opacity-30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">{userStats.accuracy}%</div>
                <div className="text-sm opacity-80">Précision</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8">
        {/* Navigation tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'stats', label: 'Statistiques', icon: TrendingUp },
              { id: 'categories', label: 'Catégories', icon: BookOpen },
              { id: 'achievements', label: 'Succès', icon: Award },
              { id: 'history', label: 'Historique', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des tabs */}
        <div className="space-y-8">
          {activeTab === 'stats' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{userStats.correctAnswers}</div>
                    <div className="text-sm text-gray-600">Bonnes réponses</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{userStats.streak}</div>
                    <div className="text-sm text-gray-600">Série actuelle</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">🔥 Série de victoires en cours!</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{userStats.avgTime}</div>
                    <div className="text-sm text-gray-600">Temps moyen</div>
                  </div>
                </div>
                <div className="text-xs text-green-600">⚡ Très rapide!</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">#127</div>
                    <div className="text-sm text-gray-600">Classement global</div>
                  </div>
                </div>
                <div className="text-xs text-purple-600">📈 +15 cette semaine</div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{category.name}</h3>
                      <p className="text-gray-600">{category.quizzes} quiz joués</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Précision</span>
                      <span className="font-bold text-lg">{category.accuracy}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${category.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                        style={{width: `${category.accuracy}%`}}
                      ></div>
                    </div>
                    <button className="w-full mt-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Jouer maintenant</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className={`bg-white rounded-2xl p-6 shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  achievement.earned ? 'border-2 border-yellow-400' : 'opacity-60'
                }`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      achievement.earned 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      <achievement.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{achievement.name}</h3>
                      <p className="text-gray-600 text-sm">{achievement.desc}</p>
                      {achievement.earned && (
                        <p className="text-xs text-green-600 mt-1">🏆 Obtenu le {achievement.date}</p>
                      )}
                    </div>
                  </div>
                  {achievement.earned && (
                    <div className="text-center py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                      <span className="text-yellow-700 font-semibold">✨ Succès débloqué!</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Quiz récents</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {recentQuizzes.map((quiz, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{quiz.title}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{quiz.category}</span>
                          <span>⏱️ {quiz.time}</span>
                          <span>{quiz.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(quiz.score, quiz.total)}`}>
                          {quiz.score}/{quiz.total}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round((quiz.score / quiz.total) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (quiz.score / quiz.total) >= 0.9 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          (quiz.score / quiz.total) >= 0.7 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{width: `${(quiz.score / quiz.total) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call to action */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt pour un nouveau défi?</h2>
          <p className="text-indigo-100 mb-6">Testez vos connaissances et grimpez dans le classement!</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
            🎮 Commencer un Quiz
          </button>
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  );
}