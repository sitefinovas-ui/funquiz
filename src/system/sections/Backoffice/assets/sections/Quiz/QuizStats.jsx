import React, { useEffect, useState } from 'react';
import {
  FaUser,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaChartLine,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import quizStatsServices from '../../../../../configurations/Services/quizStatsServices.js';

const KpiCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-current/20 transition-transform group-hover:scale-110`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );
};

const QuizStats = () => {
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    activeThematics: 0,
    averageSuccessRate: 0,
    averageScore: 0,
  });
  const [thematicStats, setThematicStats] = useState([]);
  const [thematicLoading, setThematicLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const asNumber = (val) => {
    const v = Number(val);
    return Number.isFinite(v) ? v : 0;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for better performance
      const [globalRes, thematicRes, rankingRes, activityRes] = await Promise.all([
        quizStatsServices.getGlobalStats(),
        quizStatsServices.getThematicStats(),
        quizStatsServices.getRankings(),
        quizStatsServices.getRecentActivity()
      ]);

      // Process Global Stats
      const g = Array.isArray(globalRes) ? (globalRes[0] || {}) : (globalRes?.data || globalRes || {});
      setGlobalStats({
        totalUsers: asNumber(g.total_participants),
        totalQuestions: asNumber(g.total_questions),
        activeThematics: asNumber(g.active_thematics),
        averageSuccessRate: asNumber(g.avg_success_rate),
        averageScore: asNumber(g.avg_score),
      });

      // Process Thematic Stats
      const thematics = (thematicRes?.data || thematicRes || []).map(t => ({
        id: t.thematic_id,
        name: t.thematic_title,
        completedQuizzes: asNumber(t.quiz_count),
        successRate: asNumber(t.success_rate),
      }));
      setThematicStats(thematics);

      // Process Rankings
      const ranks = (rankingRes?.data || rankingRes || []).map(r => ({
        user_id: r.user_id,
        username: r.full_name || r.username || 'Anonyme',
        score: asNumber(r.total_points),
      }));
      setRankings(ranks);

      // Process Activity
      const activity = (activityRes?.data || activityRes || []).map(a => ({
        history_id: a.history_id,
        date: a.played_at,
        username: a.full_name || a.username || 'Anonyme',
        quizName: `${a.quiz_title} · ${a.thematic_title}`,
        score: `${a.score}/${a.max_score}`,
      }));
      setRecentActivity(activity);

    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
      setThematicLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && thematicStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Analyse des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard title="Participants" value={globalStats.totalUsers.toLocaleString('fr-FR')} icon={FaUser} color="bg-slate-900" />
        <KpiCard title="Questions" value={globalStats.totalQuestions.toLocaleString('fr-FR')} icon={FaFileAlt} color="bg-blue-600" />
        <KpiCard title="Thématiques" value={globalStats.activeThematics} icon={FaTrophy} color="bg-amber-500" />
        <KpiCard title="Réussite" value={`${globalStats.averageSuccessRate.toFixed(1)}%`} icon={FaCheckCircle} color="bg-emerald-500" />
        <KpiCard title="Score Moyen" value={`${globalStats.averageScore.toFixed(1)}%`} icon={FaChartLine} color="bg-purple-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Rankings */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Top 10 du classement</h3>
            <FaTrophy className="text-amber-400" size={20} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-20">Rang</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilisateur</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Score Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rankings.slice(0, 10).map((r, i) => (
                  <tr key={r.user_id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-6">
                      {i === 0 ? <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-black">1</span> :
                       i === 1 ? <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-black">2</span> :
                       i === 2 ? <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black">3</span> :
                       <span className="w-8 h-8 font-bold text-slate-400 flex items-center justify-center">{i + 1}</span>}
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-900">{r.username}</p>
                    </td>
                    <td className="p-6 text-right text-blue-600 font-black">{r.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Activité récente</h3>
            <FaClock className="text-blue-500" size={20} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Détails</th>
                  <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentActivity.slice(0, 10).map((a) => (
                  <tr key={a.history_id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-700">{a.date ? new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{a.date ? new Date(a.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{a.username}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{a.quizName}</p>
                    </td>
                    <td className="p-6 text-right font-black text-slate-900">{a.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Thematic Stats */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Performance par thématique</h3>
          <button onClick={fetchData} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <FaSyncAlt />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {thematicStats.map((thematic) => (
            <div key={thematic.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20">
                  <FaFileAlt size={20} />
                </div>
                <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{thematic.name}</h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Quiz complétés</p>
                    <p className="text-xl font-black text-slate-900">{thematic.completedQuizzes.toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Réussite</p>
                    <p className="text-xl font-black text-emerald-500">{thematic.successRate}%</p>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(thematic.successRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizStats;

