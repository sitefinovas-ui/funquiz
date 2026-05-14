import { useEffect, useState, useRef } from 'react';
import {
  FaUserShield,
  FaTrophy,
  FaClock,
  FaUsers,
  FaChartLine,
  FaBolt,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { AiTwotoneMessage } from 'react-icons/ai';
import { TfiCommentsSmiley } from 'react-icons/tfi';
import { GiRapidshareArrow } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import pointService from '../../../../../configurations/Services/pointService.js';
import messageServices from '../../../../../configurations/Services/messageServices.js';
import commentServices from '../../../../../configurations/Services/commentServices.js';
import thematicService from '../../../../../configurations/Services/thematicServices.js';
import usersServices from '../../../../../configurations/Services/authServices.js';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const HomeDash = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    inscriptions: 0,
    messages: 0,
    commentaires: 0,
    partages: 0,
    totalUsers: 0,
    activeUsers: 0,
    changes: { inscriptions: '0%', messages: '0%', commentaires: '0%', partages: '0%' },
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topQuizzes, setTopQuizzes] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);

  useEffect(() => {
    document.title = 'FUNQUIZ Pro | Tableau de bord';
    fetchDashboardData();
  }, []);

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [allUsers, usersData, messagesData, commentsData, thematicsData] = await Promise.all([
        usersServices.getAllUsers(),
        pointService.getAllUsersPoints(),
        messageServices.getAllMessages(),
        commentServices.getCommentsWithUserAndQuiz(),
        thematicService.getAllThematics(),
      ]);

      const users = usersData.data || [];
      const thematics = thematicsData || [];

      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);

      const todayStats = {
        inscriptions: allUsers.filter((u) => new Date(u.created_at) >= todayStart).length,
        messages: messagesData.filter((m) => new Date(m.created_at) >= todayStart).length,
        commentaires: commentsData.filter((c) => new Date(c.created_at) >= todayStart).length,
        partages: users.filter(
          (u) => u.total_games_played > 0 && new Date(u.last_activity) >= todayStart
        ).length,
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter((u) => {
          const lastActivity = new Date(u.last_activity || u.created_at);
          const daysDiff = (today - lastActivity) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length,
      };

      const yesterdayStats = {
        inscriptions: allUsers.filter((u) => {
          const date = new Date(u.created_at);
          return date >= yesterdayStart && date < todayStart;
        }).length,
        messages: messagesData.filter((m) => {
          const date = new Date(m.created_at);
          return date >= yesterdayStart && date < todayStart;
        }).length,
        commentaires: commentsData.filter((c) => {
          const date = new Date(c.created_at);
          return date >= yesterdayStart && date < todayStart;
        }).length,
        partages: users.filter((u) => {
          const date = new Date(u.last_activity);
          return u.total_games_played > 0 && date >= yesterdayStart && date < todayStart;
        }).length,
      };

      const changes = {
        inscriptions: calculatePercentageChange(
          todayStats.inscriptions,
          yesterdayStats.inscriptions
        ),
        messages: calculatePercentageChange(todayStats.messages, yesterdayStats.messages),
        commentaires: calculatePercentageChange(
          todayStats.commentaires,
          yesterdayStats.commentaires
        ),
        partages: calculatePercentageChange(todayStats.partages, yesterdayStats.partages),
      };

      setStats({ ...todayStats, changes });

      const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const weeklyStats = [];

      for (let i = 6; i >= 0; i--) {
        const dayDate = new Date(todayStart);
        dayDate.setDate(dayDate.getDate() - i);
        const nextDay = new Date(dayDate);
        nextDay.setDate(nextDay.getDate() + 1);

        weeklyStats.push({
          jour: weekDays[dayDate.getDay()],
          inscriptions: allUsers.filter((u) => {
            const date = new Date(u.created_at);
            return date >= dayDate && date < nextDay;
          }).length,
          messages: messagesData.filter((m) => {
            const date = new Date(m.created_at);
            return date >= dayDate && date < nextDay;
          }).length,
          commentaires: commentsData.filter((c) => {
            const date = new Date(c.created_at);
            return date >= dayDate && date < nextDay;
          }).length,
        });
      }

      setWeeklyData(weeklyStats);

      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
      const categoryStats = thematics
        .map((thematic, index) => ({
          name: thematic.thematic_title,
          value: users.filter((u) => u.favorite_category === thematic.thematic_id).length,
          color: thematic.color_code || colors[index % colors.length],
        }))
        .filter((cat) => cat.value > 0)
        .sort((a, b) => b.value - a.value);

      if (categoryStats.length === 0) {
        categoryStats.push({ name: 'Sans catégorie', value: users.length || 1, color: '#64748b' });
      }

      setCategoryData(categoryStats);

      const quizStats = thematics
        .map((thematic) => {
          const thematicUsers = users.filter(
            (u) =>
              u.favorite_category === thematic.thematic_id &&
              u.total_games_played &&
              u.total_games_played > 0
          );

          const totalGames = thematicUsers.reduce(
            (acc, u) => acc + (parseInt(u.total_games_played) || 0),
            0
          );
          const avgCompletion =
            thematicUsers.length > 0
              ? thematicUsers.reduce((acc, u) => acc + (parseFloat(u.average_completion) || 0), 0) /
                thematicUsers.length
              : 0;

          return {
            name: thematic.thematic_title || 'Quiz sans titre',
            color: thematic.color_code || '#7a3db8',
            participants: thematicUsers.length,
            totalGames: totalGames,
            note: avgCompletion > 0 ? (avgCompletion / 20).toFixed(1) : '0.0',
          };
        })
        .filter((quiz) => quiz.participants > 0 || quiz.totalGames > 0)
        .sort((a, b) => b.totalGames - a.totalGames || b.participants - a.participants)
        .slice(0, 5);

      if (quizStats.length === 0 && thematics.length > 0) {
        thematics.slice(0, 5).forEach((thematic, index) => {
          quizStats.push({
            name: thematic.thematic_title || `Quiz ${index + 1}`,
            color: thematic.color_code || colors[index % colors.length],
            participants: 0,
            totalGames: 0,
            note: '0.0',
          });
        });
      }

      setTopQuizzes(quizStats);

      const recentActivities = [...messagesData, ...commentsData]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8)
        .map((activity) => {
          const thematic = thematics.find((t) => t.thematic_id === activity.thematic_id);
          return {
            user: `${activity.first_name || 'Utilisateur'} ${(activity.name || 'A').charAt(0)}.`,
            avatar: activity.first_name ? activity.first_name.charAt(0).toUpperCase() : 'U',
            action: activity.content ? 'a commenté' : 'a envoyé un message',
            quiz: thematic ? thematic.thematic_title : 'Quiz général',
            time: formatTimeAgo(new Date(activity.created_at)),
          };
        });

      setRecentActivity(recentActivities);

      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthlyStats = [];
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;

        monthlyStats.push({
          mois: months[monthIndex],
          utilisateurs: allUsers.filter((u) => {
            const date = new Date(u.created_at);
            return date.getMonth() === monthIndex && date.getFullYear() === year;
          }).length,
        });
      }

      setMonthlyGrowth(monthlyStats);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de chargement');
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffMinutes < 1) return 'maintenant';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return `${Math.floor(diffMinutes / 1440)}j`;
  };

  const KpiCard = ({ title, value, change, icon: Icon, color }) => {
    const isPositive = change.includes('+');
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${color} text-white shadow-lg shadow-current/20 transition-transform group-hover:scale-110`}>
            <Icon size={24} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
            {change}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Analyse des données en cours...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de bord</h1>
          <p className="text-slate-500 font-medium">
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-6 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
          </div>
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-2xl font-bold text-blue-600">{stats.activeUsers}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Actifs</p>
          </div>
          <div className="text-center px-4">
            <p className="text-2xl font-bold text-emerald-600">{((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}%</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Engagement</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Inscriptions"
          value={stats.inscriptions}
          change={stats.changes.inscriptions}
          icon={FaUserShield}
          color="bg-blue-600"
        />
        <KpiCard
          title="Messages reçus"
          value={stats.messages}
          change={stats.changes.messages}
          icon={AiTwotoneMessage}
          color="bg-purple-600"
        />
        <KpiCard
          title="Commentaires"
          value={stats.commentaires}
          change={stats.changes.commentaires}
          icon={TfiCommentsSmiley}
          color="bg-emerald-600"
        />
        <KpiCard
          title="Engagements"
          value={stats.partages}
          change={stats.changes.partages}
          icon={GiRapidshareArrow}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Activité hebdomadaire</h3>
            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg uppercase tracking-wider">7 derniers jours</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Area type="monotone" dataKey="inscriptions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBlue)" name="Inscriptions" />
                <Area type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPurple)" name="Messages" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Par catégorie</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: cat.color }}></div>
                  <span className="text-sm font-medium text-slate-600">{cat.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Croissance mensuelle</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="utilisateurs" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Quiz */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <FaTrophy className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Top Quiz</h3>
          </div>
          <div className="space-y-6">
            {topQuizzes.map((quiz, index) => (
              <div key={index} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-sm font-extrabold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{quiz.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{quiz.participants} joueurs · {quiz.totalGames} parties</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <span>★</span>
                  <span>{quiz.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <FaClock className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Activité récente</h3>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0 uppercase">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 leading-tight">
                    <span className="font-bold text-slate-900">{activity.user}</span> {activity.action} sur <span className="font-bold text-blue-600">{activity.quiz}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDash;
